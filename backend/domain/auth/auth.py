# backend/domain/auth/auth.py
import os, sys, json, asyncio, re
from fastapi import HTTPException, APIRouter, Depends, Body, Request, Response
from config.connection import create_gremlin_client
from utils import (
    hash_password,
    verify_password,
    create_access_token,
    verify_access_token,
    Logger,
)
from gremlin_python.driver.client import Client
from gremlin_python.process.traversal import T
from .request import SignInRequest, SignUpRequest, PwChangeRequest
from .response import SignUpResponse, SignInResponse, SignOutResponse, PwChangeResponse

logger = Logger(__file__)

sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)

router = APIRouter()
access_token = "access_token"


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
            response.set_cookie(key="access_token", value=token, httponly=True)
            return SignUpResponse()
        else:
            raise HTTPException(status_code=500, detail="Failed to create user")
    except HTTPException as e:
        raise e
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
        query = f"""g.V().hasLabel('PrivateData').has('email','{signin_request.email}').as('privateNode')
        .outE('is_info').inV().hasLabel('User').as('userNode')
        .select('privateNode', 'userNode').by(valueMap(true))"""

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)
        print("result : ", results)
        result = results[0]
        privateNode = result["privateNode"]
        userNode = result["userNode"]
        print("privateNode : ", privateNode)
        print("userNode : ", userNode)

        if not result:
            raise HTTPException(status_code=400, detail="not registered email")

        # result.get('password', ['default_value'])는 ['실제 pw value']를 반환
        # 유효한 데이터가 없으면 ['default_Value'] 설정한 기본값 반환
        # ['실제 pw value'][0]는 'my_password'를 반환
        password = privateNode.get("password", [""])[0]
        if not verify_password(signin_request.password, password):
            raise HTTPException(status_code=400, detail="inconsistent password")
        user_node_id = privateNode.get(T.id)
        token = create_access_token(user_node_id)
        response.set_cookie(key="access_token", value=token, httponly=True)
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
    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(status_code=401, detail="Access token missing")

    token_payload = verify_access_token(token)
    uuid = token_payload.get("uuid")

    if not uuid:
        raise HTTPException(status_code=400, detail="Invalid input")

    try:
        input_password_hashed = hash_password(pw_change_req.currentpw)
        new_password_hashed = hash_password(pw_change_req.changepw)
        print(input_password_hashed, new_password_hashed)
        query = f"""
        g.V('{uuid}').fold().coalesce(unfold().choose(
            values('password').is(eq('{input_password_hashed}')),
            __.property(single, 'password', '{new_password_hashed}')
            .constant('Password changed successfully'), constant('Incorrect current password')
            ), constant('User not found')
        )
        """
        future_result_set = client.submitAsync(query).result().all()
        result = await asyncio.wrap_future(future_result_set)
        print(result)
        if result[0] == "Incorrect current password":
            raise HTTPException(status_code=400, detail="Incorrect current password")
        elif result[0] == "User not found":
            raise HTTPException(status_code=400, detail="User not found")

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
        token = request.cookies.get("access_token")
        print("token :", token)
        if not access_token:
            raise HTTPException(status_code=401, detail="Access token missing")

        token_payload = verify_access_token(token)
        uuid = token_payload.get("uuid")
        print(uuid)

        if not uuid:
            raise HTTPException(status_code=400, detail="Invalid input")

        delete_user_query = f"""
            g.V('{uuid}').fold().coalesce(
                unfold().as('p').out('is_info').hasLabel('User').as('u')
                .sideEffect(select('u').unfold().drop()).sideEffect(select('p').unfold().drop())
                .constant('User deleted successfully'), constant('User not found')
            )
        """

        future_result_set = client.submitAsync(delete_user_query).result().all()
        results = await asyncio.wrap_future(future_result_set)
        print(results)
        if results[0] == "User not found":
            raise HTTPException(status_code=404, detail="User not found")
        if results[0] == "User deleted successfully":
            response.delete_cookie(key="access_token")
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
