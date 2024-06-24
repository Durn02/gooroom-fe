# backend/domain/auth/auth.py
import os
import sys
import json
from fastapi import HTTPException, APIRouter, Depends, Body
from config.connection import create_gremlin_client
from utils.logger import Logger
from utils.jwt_utils import create_access_token
from gremlin_python.driver.client import Client
from .request.signup_request import SignUpRequest
from .response.signup_response import SignUpResponse

logger = Logger("domain.auth").get_logger()

sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)

router = APIRouter()


@router.post("/signup")
async def signup(
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
        print("result :", result)
        if result:
            raise HTTPException(status_code=400, detail="already registered email")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    try:
        create_private_query = f"g.addV('PrivateData').property('email', '{signup_request.email}').property('password', '{signup_request.password}').property('username', '{signup_request.username}')"
        private_result_set = client.submitAsync(create_private_query)
        private_result = private_result_set.result().one()
        uuid = private_result[0].id

        print(f"Private Node ID: {uuid}")

        concern_json = json.dumps(signup_request.concern)
        create_user_query = f"g.addV('User').property('nickname', '{signup_request.nickname}').property('username', '{signup_request.username}').property('concern', '{concern_json}')"
        user_result_set = client.submitAsync(create_user_query)
        user_result = user_result_set.result().one()
        user_node_id = user_result[0].id

        print(f"User Node ID: {user_node_id}")

        create_edge_query = f"g.V('{uuid}').addE('is_info').to(V('{user_node_id}'))"
        edge_result_set = client.submitAsync(create_edge_query)
        edge_result = edge_result_set.result()
        print(f"Edge Result: {edge_result}")

        return create_access_token(uuid)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()


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
        client.close()
