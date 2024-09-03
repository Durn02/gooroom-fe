# backend/domain/auth/auth.py
from datetime import datetime, timedelta
import os
import sys
import re
import uuid
import random
import string
from fastapi import HTTPException, APIRouter, Depends, Body, Request, Response
from config.connection import get_session
from utils import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_access_token,
    verify_refresh_token,
    Logger,
    send_email,
)
from .request import (
    SignInRequest,
    SignUpRequest,
    PwChangeRequest,
    PwResetRequest,
    VerificationRequest,
    SendVerificationCodeRequest,
)
from .response import (
    SignInResponse,
    SignUpResponse,
    PwChangeResponse,
    PwResetResponse,
    VerificationResponse,
    SignOutResponse,
    SendVerificationCodeResponse,
    VerifyAccessTokenResponse,
    RefreshAccTokenResponse,
)

logger = Logger(__file__)

sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)

router = APIRouter()
access_token = "access_token"
refresh_token = "refresh_token"


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
        verification_info = (
            verification_code
            + " : "
            + expiration_time.replace(microsecond=0).isoformat()
        )
        update_query = f"""
        MATCH (p:PrivateData {{email: '{send_verification_code_request.email}'}})
        WITH p
        WHERE p.verification_count < 5
        SET p.verification_count = p.verification_count + 1, 
            p.verification_info = '{verification_info}'
        RETURN 'verification code sent' AS message
        """

        result = session.run(update_query)

        update_record = result.single()

        if not update_record:
            raise HTTPException(
                status_code=400,
                detail="User not found or exceeded verification attempts",
            )

        if update_record["message"] != "verification code sent":
            raise HTTPException(status_code=400, detail="Error occurred")

        # 이메일로 verification code 전송
        send_email(
            send_verification_code_request.email,
            f"Your verification code: '{verification_code}'",
        )

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
        datetimenow = datetime.now().replace(microsecond=0).isoformat()
        query = f"""
        MATCH (p:PrivateData {{email: '{verification_request.email}'}})
        WHERE p.grant = "not-verified"
        WITH p, right(p.verification_info, 19) AS expiration_time_str
        WITH p, expiration_time_str, datetime(expiration_time_str) AS expiration_time
        WHERE expiration_time > datetime("{datetimenow}")
        WITH p, left(p.verification_info,6) AS verify_code
        WHERE verify_code = '{verification_request.verifycode}'
        SET p.grant = 'user'
        RETURN 'Verified successfully' AS message
        """

        result = session.run(query)
        record = result.single()

        if record == None:
            raise HTTPException(
                status_code=400,
                detail="invalid email or request (already verified or expired)",
            )

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

        private_node_id = str(uuid.uuid4())
        user_node_id = str(uuid.uuid4())

        query = f"""
        OPTIONAL MATCH (p:PrivateData {{email: '{signup_request.email}'}})
        WITH p
        WHERE p IS NULL
        CREATE (new_p:PrivateData {{email: '{signup_request.email}', password: '{encrypted_password}', username: '{signup_request.username}',
                               link_info: '', verification_info: '', link_count: 0,
                               verification_count: 0, grant: 'not-verified', node_id: '{private_node_id}'}})
        CREATE (u:User {{username: '{signup_request.username}', nickname: '{signup_request.nickname}', concern: {signup_request.concern}, my_memo: '',node_id: '{user_node_id}'}})
        CREATE (new_p)-[:is_info]->(u)
        RETURN p,new_p,u
        """
        result = session.run(query)
        record = result.single()

        if record == None:
            raise HTTPException(status_code=400, detail="already registered email")

        return SignUpResponse()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.post("/dummy_create")
async def dummy_create(
    response: Response,
    session=Depends(get_session),
    signup_request: SignUpRequest = Body(...),
):
    logger.info("signup-dummy-create")
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

        query = f"""
        MATCH (p:PrivateData {{email: '{signup_request.email}'}})
        RETURN p
        """
        result = session.run(query, email=signup_request.email)
        record = result.single()

        if record:
            return {"message": "Email already exists. Please use a different email."}

        private_node_id = str(uuid.uuid4())
        user_node_id = str(uuid.uuid4())
        create_query = f"""
        CREATE (p:PrivateData {{email: '{signup_request.email}', password: '{encrypted_password}', username: '{signup_request.username}',
                               link_info: '', verification_info: '', link_count: 0,
                               verification_count: 0, grant: 'user', node_id: '{private_node_id}'}})
        CREATE (u:User {{username: '{signup_request.username}', nickname: '{signup_request.nickname}', concern: {signup_request.concern}, my_memo: '',node_id: '{user_node_id}'}})
        MERGE (p)-[:is_info]->(u)
        RETURN p, u
        """

        result = session.run(create_query)
        record = result.single()

        token = create_access_token(user_node_id)
        response.set_cookie(key=access_token, value=f"{token}", httponly=True)
        return SignUpResponse()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.get("/verify-access-token")
async def verify_access_token_api(request: Request, response: Response):
    logger.info("verify access token(api)")
    token = request.cookies.get(access_token)

    if not token:
        raise HTTPException(status_code=401, detail="access token missing")
    if not verify_access_token(token):
        raise HTTPException(status_code=401, detail="invalid access token")

    return VerifyAccessTokenResponse()


@router.post("/refresh-acc-token")
async def refresh_acc_token(request: Request, response: Response):
    logger.info("refresh access token")
    token = request.cookies.get(refresh_token)

    if not token:
        raise HTTPException(status_code=401, detail="refresh token missing")
    # verify_access_token(token)

    token = verify_refresh_token(token)

    new_token = create_access_token(token.get("user_node_id"))
    if not new_token:
        raise HTTPException(status_code=400, detail="failed to refresh access token")

    response.set_cookie(key=access_token, value=f"{new_token}", httponly=True)
    return RefreshAccTokenResponse()


@router.post("/signin")
async def signin(
    response: Response,
    session=Depends(get_session),
    signin_request: SignInRequest = Body(...),
):
    logger.info("signin")

    query = f"""
    MATCH (p:PrivateData {{email: '{signin_request.email}'}})
    MATCH (p)-[:is_info]->(u)
    RETURN p.password AS password, p.grant AS grant, u.node_id AS user_node_id
    """

    try:
        result = session.run(query)
        record = result.single()

        if not record:
            raise HTTPException(status_code=400, detail="not registered email")

        password = record["password"]
        grant = record["grant"]
        if not verify_password(signin_request.password, password):
            raise HTTPException(status_code=400, detail="inconsistent password")

        if grant == "not-verified":
            raise HTTPException(status_code=400, detail="not verified email")

        user_node_id = record["user_node_id"]
        token = create_access_token(user_node_id)
        response.set_cookie(key=access_token, value=f"{token}", httponly=True)

        token = create_refresh_token(user_node_id)
        response.set_cookie(key=refresh_token, value=f"{token}", httponly=True)
        return SignInResponse()

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.post("/logout")
async def logout(request: Request, response: Response):
    logger.info("logout")
    token = request.cookies.get(access_token)

    if not token:
        raise HTTPException(status_code=401, detail="access token missing")

    verify_access_token(token)

    if token:
        response.delete_cookie(key=access_token)
        response.delete_cookie(key=refresh_token)
        return SignOutResponse(message="logout success")
    else:
        return SignOutResponse(message="not logined")


@router.post("/pw/reset")
async def pw_reset(
    request: Request,
    session=Depends(get_session),
    pw_reset_request: PwResetRequest = Body(...),
):

    logger.info("reset password")

    try:
        random_password = "".join(
            random.choices(string.ascii_letters + string.digits, k=10)
        )
        hashed_password = hash_password(random_password)
        # print(hashed_password, random_password)
        query = f"""
        MATCH (p:PrivateData {{email: '{pw_reset_request.email}'}})
        WHERE NOT p.grant = 'not-verified' 
        SET p.password = '{hashed_password}'
        RETURN 'Password reset successfully' AS message, p.email AS email
        """

        result = session.run(query)
        record = result.single()

        if not record:
            raise HTTPException(
                status_code=400,
                detail="Error occurred during password reset or not verified",
            )

        # 이메일로 랜덤 생성 비밀번호 전송
        send_email(
            record["email"],
            f"Password Reset : '{random_password}'. Change your password after login",
        )

        return PwResetResponse(message="Password reset successfully, check your email")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.post("/pw/change")
async def pw_change(
    request: Request,
    response: Response,
    session=Depends(get_session),
    pw_change_req: PwChangeRequest = Body(...),
):
    logger.info("pw change")
    token = request.cookies.get(access_token)

    if not token:
        raise HTTPException(status_code=401, detail="Access token missing")

    token_payload = verify_access_token(token)
    user_node_id = token_payload.get("user_node_id")

    if not user_node_id:
        raise HTTPException(status_code=400, detail="Invalid input")

    try:
        # 현재 비밀번호 가져오기
        query = f"""
        MATCH (u:User {{node_id: '{user_node_id}'}})<-[:is_info]-(p:PrivateData)
        RETURN p.password AS password
        """
        result = session.run(query)
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

        update_query = f"""
        MATCH (u:User {{node_id: '{user_node_id}'}})<-[:is_info]-(p:PrivateData)
        SET p.password = '{hashed_new_pw}'
        RETURN 'Password changed successfully' AS message
        """
        result = session.run(update_query)
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

        delete_user_query = f"""
            MATCH (u:User {{node_id: '{user_node_id}'}})<-[r:is_info]-(p: PrivateData)
            DETACH DELETE p, u
            RETURN 'User deleted successfully' AS message
        """
        result = session.run(delete_user_query)
        record = result.single()

        if record["message"] == "User deleted successfully":
            response.delete_cookie(key=access_token)
            response.delete_cookie(key=refresh_token)
            return SignOutResponse()
        else:
            raise HTTPException(status_code=500, detail="Failed to sign out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()
