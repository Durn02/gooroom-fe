# backend/domain/auth/auth.py
import os, sys, json, asyncio
from fastapi import HTTPException, APIRouter, Depends, Body, Request, Response
from config.connection import create_gremlin_client
from utils import hash_password,verify_password,create_access_token,verify_access_token,Logger
from gremlin_python.driver.client import Client
from gremlin_python.process.traversal import T
from .request import SignInRequest, SignUpRequest
from .response import SignUpResponse, SignInResponse, SignOutResponse

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

    # Todo. 비밀번호 형식 검증해야함(숫자,특수문자 등).
    # pw = signUpRequest.password

    print(signup_request)

    # email 중복 검사
    try:
        query = f"g.V().hasLabel('PrivateData').has('email', '{signup_request.email}')"
        result_set = client.submitAsync(query)
        result = result_set.result().one()
        if result:
            raise HTTPException(status_code=400, detail="already registered email")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    try:
        encrypted_password = hash_password(signup_request.password)
        create_private_query = f"g.addV('PrivateData').property('email', '{signup_request.email}').property('password', '{encrypted_password}').property('username', '{signup_request.username}')"
        private_result_set = client.submitAsync(create_private_query)
        private_result = private_result_set.result().one()
        uuid = private_result[0].id

        print(f"Private Node ID: {uuid}")

        concern_json = json.dumps(signup_request.concern)
        create_user_query = f"g.addV('User').property('nickname', '{signup_request.nickname}').property('username', '{signup_request.username}').property('concern', '{concern_json}').property('memo','')"
        user_result_set = client.submitAsync(create_user_query)
        user_result = user_result_set.result().one()
        user_node_id = user_result[0].id

        print(f"User Node ID: {user_node_id}")

        create_edge_query = f"g.V('{uuid}').addE('is_info').to(V('{user_node_id}'))"
        edge_result_set = client.submitAsync(create_edge_query)
        edge_result = edge_result_set.result()
        print(f"Edge Result: {edge_result}")

        token = create_access_token(uuid)
        response.set_cookie(key=access_token, value=f"{token}", httponly=True)
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
        query = f"""g.V().hasLabel('PrivateData').has('email','{signin_request.email}').as('privateNode')
        .outE('is_info').inV().hasLabel('User').as('userNode')
        .select('privateNode', 'userNode').by(valueMap(true))"""

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)
        print("result[0] : ",results[0])
        result = results[0]
        privateNode = result['privateNode']
        userNode = result['userNode']
        print("privateNode : ", privateNode)
        print("userNode : ", userNode)

        if not results:
            raise HTTPException(status_code=400, detail="not registered email")

        # result.get('password', ['default_value'])는 ['실제 pw value']를 반환
        # 유효한 데이터가 없으면 ['default_Value'] 설정한 기본값 반환
        # ['실제 pw value'][0]는 'my_password'를 반환
        password = privateNode.get('password',[''])[0]
        if not verify_password(signin_request.password,password):
            raise HTTPException(status_code=400, detail="inconsistent password")
        user_node_id = userNode.get(T.id)
        token = create_access_token(user_node_id)
        response.set_cookie(key=access_token, value=f"{token}", httponly=True)
        print("token : ", token)
        print("verifed result : ", verify_access_token(token))
        return SignInResponse()
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()

@router.post("/singout")
async def singout(request: Request,response: Response):
    token = request.cookies.get(access_token)
    print("token :",token)

    if token:
        response.delete_cookie(key=access_token)
        return SignOutResponse(message="logout success")
    else:
        return SignOutResponse(message="not logined")
    
# 노드 정보 조회(테스트용)
@router.get("/")
async def get_nodes(client=Depends(create_gremlin_client)):
    logger.info("노드 정보 조회")
    try:
        query = "g.V().hasLabel('User').valueMap(true)"
        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)
        print(type(results[0]['concern']))
        return results[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        logger.info("완료")
        client.close()
