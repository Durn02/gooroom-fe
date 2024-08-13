# backend/domain/auth/auth.py
import os, sys, json, asyncio, re
from fastapi import HTTPException, APIRouter, Depends, Body, Request, Response
import random, string
from datetime import datetime, timedelta
from config.connection import get_session
from neo4j import GraphDatabase
from utils import (
    hash_password,
    verify_password,
    create_access_token,
    verify_access_token,
    Logger,
    send_verification_email,
)
from .request import (
    SignInRequest,
    SignUpRequest,
    PwChangeRequest,
    VerificationRequest,
    SendVerificationCodeRequest,
)
from .response import (
    SignUpResponse,
    SignInResponse,
    SignOutResponse,
    PwChangeResponse,
    VerificationResponse,
    SendVerificationCodeResponse,
)
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = Logger(__file__)

sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)

router = APIRouter()
access_token = "access_token"


@router.post("/send-verification-code")
async def send_verification_code(
    response: Response,
    session=Depends(get_session),
    send_verification_code_request: SendVerificationCodeRequest = Body(...),
):
    logger.info("send verify code")

    try:
        # Verification count 및 정보 업데이트 쿼리
        verification_code = "".join(
            random.choices(string.ascii_uppercase + string.digits, k=6)
        )
        expiration_time = datetime.now() + timedelta(minutes=30)
        verification_info = json.dumps({verification_code: expiration_time.isoformat()})

        update_query = """
        MATCH (p:PrivateData {email: $email})
        WITH p
        WHERE p.verification_count < 5
        SET p.verification_count = p.verification_count + 1, 
            p.verification_info = $verification_info
        RETURN 'verification code sent' AS message
        """

        result = session.run(
            update_query,
            email=send_verification_code_request.email,
            verification_info=verification_info,
        )
        update_record = result.single()
        print(update_record)

        if not update_record:
            raise HTTPException(
                status_code=400,
                detail="User not found or exceeded verification attempts",
            )

        if update_record["message"] != "verification code sent":
            raise HTTPException(status_code=400, detail="Error occurred")

        # 이메일로 verification code 전송
        send_verification_email(send_verification_code_request.email, verification_info)

        return SendVerificationCodeResponse(message="verification code sent")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.post("/verify-code")
async def verify_code(
    response: Response,
    session=Depends(get_session),
    verification_request: VerificationRequest = Body(...),
):
    logger.info("verify code")

    try:
        # Verification 정보 및 grant 상태 조회
        query = """
        MATCH (p:PrivateData {email: $email})
        RETURN p.verification_info AS verification_info, p.grant AS grant
        """
        result = session.run(query, email=verification_request.email)
        record = result.single()

        if not record:
            raise HTTPException(status_code=400, detail="User not found")

        verification_info = record["verification_info"]
        grant = record["grant"]

        if grant != "not-verified":
            raise HTTPException(status_code=400, detail="Already verified email")

        # Verification 정보 검증
        if verification_info:
            verification_info = json.loads(verification_info)
            if verification_request.verifycode not in verification_info:
                raise HTTPException(status_code=400, detail="Invalid verification code")
            if datetime.now() > datetime.fromisoformat(
                verification_info[verification_request.verifycode]
            ):
                raise HTTPException(status_code=400, detail="Verification code expired")

        # Verification 상태 업데이트
        update_query = """
        MATCH (p:PrivateData {email: $email})
        SET p.grant = 'user'
        RETURN 'Verified successfully' AS message
        """
        result = session.run(update_query, email=verification_request.email)
        update_record = result.single()

        if update_record["message"] != "Verified successfully":
            raise HTTPException(status_code=400, detail="Error occurred")

        return VerificationResponse(message="Verified successfully")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.post("/signup")
async def signup(
    response: Response,
    session=Depends(get_session),
    signup_request: SignUpRequest = Body(...),
):
    logger.info("signup")
    pw = signup_request.password
    if not re.match(
        r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$', pw
    ):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character, and must be at least 8 characters long",
        )

    try:
        encrypted_password = hash_password(signup_request.password)
        concern_json = json.dumps(signup_request.concern)

        query = """
        MATCH (p:PrivateData {email: $email})
        RETURN p
        """
        result = session.run(query, email=signup_request.email)
        record = result.single()

        if record:
            return {"message": "Email already exists. Please use a different email."}


        create_query = """
        CREATE (p:PrivateData {email: $email, password: $password, username: $username,
                               link_info: '', verification_info: '', link_count: 0,
                               verification_count: 0, grant: 'not-verified'})
        CREATE (u:User {username: $username, nickname: $nickname, concern: $concern, my_memo: ''})
        MERGE (p)-[:is_info]->(u)
        RETURN p, u
        """

        result = session.run(
            create_query,
            email=signup_request.email,
            password=encrypted_password,
            username=signup_request.username,
            nickname=signup_request.nickname,
            concern=concern_json,
        )
        record = result.single()

        if record:
            private_node = record["p"]
            user_node = record["u"]
            uuid = private_node.id
            user_node_id = user_node.id

            print(f"Private Node ID: {uuid}")
            print(f"User Node ID: {user_node_id}")

        token = create_access_token(uuid)
        response.set_cookie(key=access_token, value=f"{token}", httponly=True)
        return SignUpResponse()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.post("/signin")
async def signin(
    response: Response,
    session=Depends(get_session),
    signin_request: SignInRequest = Body(...),
):
    logger.info("login")

    query = """
    MATCH (p:PrivateData {email: $email})
    MATCH (p)-[:is_info]->(u)
    RETURN p.password AS password, p.grant AS grant, ID(u) AS id
    """

    try:
        result = session.run(query, email=signin_request.email)
        record = result.single()

        if not record:
            raise HTTPException(status_code=400, detail="not registered email")

        password = record["password"]
        grant = record["grant"]
        if not verify_password(signin_request.password, password):
            raise HTTPException(status_code=400, detail="inconsistent password")

        if grant == "not-verified":
            raise HTTPException(status_code=400, detail="not verified email")

        user_node_id = record["id"]
        token = create_access_token(user_node_id)
        response.set_cookie(key=access_token, value=f"{token}", httponly=True)
        return SignInResponse()

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.post("/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get(access_token)
    print("token :", token)

    if token:
        response.delete_cookie(key=access_token)
        return SignOutResponse(message="logout success")
    else:
        return SignOutResponse(message="not logined")


@router.post("/pw/change")
async def pw_change(
    request: Request,
    response: Response,
    session=Depends(get_session),
    pw_change_req: PwChangeRequest = Body(...),
):
    token = request.cookies.get(access_token)

    if not token:
        raise HTTPException(status_code=401, detail="Access token missing")

    token_payload = verify_access_token(token)
    user_node_id = token_payload.get("user_node_id")

    if not user_node_id:
        raise HTTPException(status_code=400, detail="Invalid input")

    try:
        # 현재 비밀번호 가져오기
        query = """
        MATCH (u:User)<-[:is_info]-(p:PrivateData)
        WHERE ID(u) = $user_node_id
        RETURN p.password AS password
        """
        result = session.run(query, user_node_id=int(user_node_id))
        record = result.single()

        if not record:
            raise HTTPException(status_code=400, detail="User not found")

        password = record["password"]

        new_pw = pw_change_req.changepw

        if not re.match(
            r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$', new_pw
        ):
            raise HTTPException(
                status_code=400,
                detail="New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character, and must be at least 8 characters long",
            )

        if verify_password(pw_change_req.changepw, password):
            raise HTTPException(
                status_code=400,
                detail="Changed password should not be the same as the current password",
            )

        hashed_new_pw = hash_password(new_pw)

        if not verify_password(pw_change_req.currentpw, password):
            raise HTTPException(status_code=400, detail="Incorrect current password")

        update_query = """
        MATCH (u:User)<-[:is_info]-(p:PrivateData)
        WHERE ID(u) = $user_node_id
        SET p.password = $new_password
        RETURN 'Password changed successfully' AS message
        """
        result = session.run(
            update_query, user_node_id=int(user_node_id), new_password=hashed_new_pw
        )
        update_record = result.single()

        if update_record["message"] != "Password changed successfully":
            raise HTTPException(status_code=400, detail="Error occurred")

        return PwChangeResponse(message="Password changed successfully")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.post("/signout")
async def signout(
    response: Response,
    request: Request,
    session=Depends(get_session),
):
    logger.info("signout")
    try:
        token = request.cookies.get(access_token)

        if not token:
            raise HTTPException(status_code=401, detail="Access token missing")

        token_payload = verify_access_token(token)
        user_node_id = token_payload.get("user_node_id")

        if not user_node_id:
            raise HTTPException(status_code=400, detail="Invalid input")

        delete_user_query = """
            MATCH (p:PrivateData)<-[:is_info]-(u:User)
            WHERE ID(u) = $user_node_id
            DETACH DELETE p, u
            RETURN 'User deleted successfully' AS message
        """

        result = session.run(delete_user_query, user_node_id=int(user_node_id))
        record = result.single()

        if record["message"] == "User deleted successfully":
            response.delete_cookie(key=access_token)
            return SignOutResponse()
        else:
            raise HTTPException(status_code=500, detail="Failed to sign out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()
