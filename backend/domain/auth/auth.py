# backend/domain/auth/auth.py
import os, sys, json, asyncio, re
from fastapi import HTTPException, APIRouter, Depends, Body, Request, Response
import random, string
from datetime import datetime, timedelta
from config.connection import create_gremlin_client
from utils import (
    hash_password,
    verify_password,
    create_access_token,
    verify_access_token,
    Logger,
    send_verification_email,
)
from gremlin_python.driver.client import Client
from gremlin_python.process.traversal import T
from .request import SignInRequest, SignUpRequest, PwChangeRequest, VerificationRequest
from .response import (
    SignUpResponse,
    SignInResponse,
    SignOutResponse,
    PwChangeResponse,
    VerificationResponse,
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


@router.post("/verify-code")
async def verify_code(
    response: Response,
    client: Client = Depends(create_gremlin_client),
    verification_request: VerificationRequest = Body(...),
):
    logger.info("verify code")

    try:
        query = f"""
            g.V().hasLabel('PrivateData').has('email', '{verification_request.email}').outE('is_info').inV()
            .as('u').project('verification_info')
            .by(select('u').values('verification_info'))
        """
        future_result_set = client.submitAsync(query).result().all()
        result = await asyncio.wrap_future(future_result_set)
        verification_info = result[0]["verification_info"]

        if not result:
            raise HTTPException(status_code=400, detail="User not found")

        if verification_info:
            verification_info = json.loads(verification_info)
            if verification_request.verifycode not in verification_info:
                raise HTTPException(status_code=400, detail="Invalid verification code")
            if datetime.now() > datetime.fromisoformat(
                verification_info[verification_request.verifycode]
            ):
                raise HTTPException(status_code=400, detail="Verification code expired")

        query2 = f"""
            g.V().hasLabel('PrivateData').has('email', '{verification_request.email}').outE('is_info').inV()
            .fold()
            .coalesce(
                unfold().property(single, 'grant', 'user').constant('Verified successfully'),
                constant('Error occurred')
            )
        """
        future_result_set = client.submitAsync(query2).result().all()
        result = await asyncio.wrap_future(future_result_set)

        if result[0] == "Error occured":
            raise HTTPException(status_code=400, detail="Error occured")
        return VerificationResponse(message="Verified successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()


@router.post("/signup")
async def signup(
    response: Response,
    client: Client = Depends(create_gremlin_client),
    signup_request: SignUpRequest = Body(...),
):
    # 비밀번호 형식: 영어 대/소문자, 숫자, 특수문자를 혼합하여 8자리 이상
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

        verification_code = "".join(
            random.choices(string.ascii_uppercase + string.digits, k=6)
        )
        expiration_time = datetime.now() + timedelta(minutes=30)
        verification_info = json.dumps({verification_code: expiration_time.isoformat()})

        send_verification_email(signup_request.email, verification_info)

        query = f"""
        g.V().hasLabel('PrivateData').has('email', '{signup_request.email}')
        .fold()
        .coalesce(
            unfold(),
            addV('PrivateData')
                .property('email', '{signup_request.email}')
                .property('password', '{encrypted_password}')
                .property('username', '{signup_request.username}')
                .as('private')
                .addV('User')
                .property('nickname', '{signup_request.nickname}')
                .property('username', '{signup_request.username}')
                .property('concern', '{concern_json}')
                .property('my_memo', '')
                .property('grant', 'not-verified')
                .property('link_info', '')
                .property('verification_info', '{verification_info}')
                .as('user')
                .addE('is_info').from('private').to('user')
                .select('private', 'user')
        )
        
        """

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)
        print(f"Results: {results}")

        if results:
            private_node = results[0]["private"]
            user_node = results[0]["user"]
            uuid = private_node.id
            user_node_id = user_node.id

            print(f"Private Node ID: {uuid}")
            print(f"User Node ID: {user_node_id}")

        token = create_access_token(uuid)
        response.set_cookie(key=access_token, value=f"Bearer {token}", httponly=True)
        return SignUpResponse()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()


@router.post("/signin")
async def signin(
    response: Response,
    client=Depends(create_gremlin_client),
    signin_request: SignInRequest = Body(...),
):
    # auth api logger에 유저정보도 남기는 게 좋을 것 같음
    logger.info("login")
    try:
        query = f"""g.V().hasLabel('PrivateData').has('email','{signin_request.email}').as('p')
        .outE('is_info').inV().as('u')
        .project('password', 'grant', 'id')
        .by(select('p').values('password')).by(select('u').values('grant')).by(select('u').id())"""

        future_result_set = client.submitAsync(query).result().all()
        result = await asyncio.wrap_future(future_result_set)

        if not result:
            raise HTTPException(status_code=400, detail="not registered email")

        password = result[0]["password"]
        grant = result[0]["grant"]

        if not verify_password(signin_request.password, password):
            raise HTTPException(status_code=400, detail="inconsistent password")

        if grant == "not-verified":
            raise HTTPException(status_code=400, detail="not verified email")

        user_node_id = result[0]["id"]
        token = create_access_token(user_node_id)
        response.set_cookie(key=access_token, value=f"Bearer {token}", httponly=True)
        return SignInResponse()
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()


@router.post("/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get(access_token)
    print("token :", token)

    if token:
        response.delete_cookie(key=access_token)
        return SignOutResponse(message="logout success")
    else:
        return SignOutResponse(message="not logined")


# @router.post("/pw/reset")
# async def pw_reset(request: Request, response: Response, pw_reset_req: pwResetBody = Body(...)):
#     token = request.cookies.get(access_token)
#     print("token :", token)

#     if token:
#         response.delete_cookie(key=access_token)
#         return SignOutResponse(message="logout success")
#     else:
#         return SignOutResponse(message="not logined")


@router.post("/pw/change")
async def pw_change(
    request: Request,
    response: Response,
    client=Depends(create_gremlin_client),
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
        query = f"""
        g.V('{user_node_id}').inE('is_info').outV().as('u').project('password').by(select('u').values('password'))
            """
        future_result_set = client.submitAsync(query).result().all()
        result = await asyncio.wrap_future(future_result_set)

        if not result:
            raise HTTPException(status_code=400, detail="User not found")

        password = result[0]["password"]

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
                detail="Changed password should not be same with current password",
            )

        hashed_new_pw = hash_password(new_pw)

        if not verify_password(pw_change_req.currentpw, password):
            raise HTTPException(status_code=400, detail="Incorrect current password")

        query2 = f"""
            g.V('{user_node_id}').inE('is_info').outV().as('u')
            .fold()
            .coalesce(
                unfold().property(single, 'password', '{hashed_new_pw}').constant('Password changed successfully'),
                constant('Error occurred')
            )
        """
        future_result_set = client.submitAsync(query2).result().all()
        result = await asyncio.wrap_future(future_result_set)

        if result[0] == "Error occured":
            raise HTTPException(status_code=400, detail="Error occured")

        return PwChangeResponse(message="Password changed successfully")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/signout")
async def signout(
    response: Response,
    request: Request,
    client=Depends(create_gremlin_client),
):
    logger.info("signout")
    try:
        token = request.cookies.get(access_token)

        if not access_token:
            raise HTTPException(status_code=401, detail="Access token missing")

        token_payload = verify_access_token(token)
        user_node_id = token_payload.get("user_node_id")

        if not user_node_id:
            raise HTTPException(status_code=400, detail="Invalid input")

        delete_user_query = f"""
            g.V('{user_node_id}').fold().coalesce(
                unfold().as('p').inE('is_info').outV().as('u')
                .sideEffect(select('u').unfold().drop()).sideEffect(select('p').unfold().drop())
                .constant('User deleted successfully'), constant('User not found')
            )
        """

        future_result_set = client.submitAsync(delete_user_query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        if results[0] == "User not found":
            raise HTTPException(status_code=404, detail="User not found")
        if results[0] == "User deleted successfully":
            response.delete_cookie(key=access_token)
            return SignOutResponse()
        else:
            raise HTTPException(status_code=500, detail="Failed to sign out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 노드 정보 조회(테스트용)
@router.get("/")
async def get_nodes(client=Depends(create_gremlin_client)):
    logger.info("노드 정보 조회")
    try:
        query = "g.V()"
        result = client.submit(query).all().result()
        logger.info("/nodes 200 ok")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        logger.info("완료")
        client.close()
