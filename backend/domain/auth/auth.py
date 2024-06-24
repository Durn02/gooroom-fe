# backend/domain/auth/auth.py
import os
import sys
from fastapi import HTTPException, APIRouter, Depends, Body
from config.connection import create_gremlin_client
from utils.logger import Logger
from .request.signup_request import SignUpRequest
from .response.signup_response import SignUpResponse
from utils.jwt_utils import create_access_token
from gremlin_python.driver.client import Client

logger = Logger("domain.auth").get_logger()

sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)

router = APIRouter()



@router.post("/signup")
async def signup(client:Client= Depends(create_gremlin_client), signup_request: SignUpRequest = Body(...), ):
    
    # Todo. 비밀번호 형식 검증해야함(숫자,특수문자 등).
    # pw = signUpRequest.password

    # email 중복 검사
    try:
        query = "g.V().hasLabel('privateData').has('email', email)"
        bindings = {"email" : signup_request.email}
        result_set = client.submitAsync(query,bindings)
        results = result_set.result()
        print("results : ", type(results))
        result = results.one()
        print("result : ", type(result))
        # results = results.all()
        # print("results : ", type(results))
        # resultsAll = results.all()
        # print("resultsAll : ", type(resultsAll))
        # if results:
        #     raise HTTPException(status_code=400, detail="already registered email")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # try:
    #     create_private_query = "g.addV('PrivateData').property(email, email).property(password, password).property(username, username)"
    #     private_bindings = {"email": signup_request.email, "password": signup_request.password, "username": signup_request.username}
    #     private_result = await client.submit(create_private_query, private_bindings).all()
    #     uuid = private_result[0].id
      
    #     create_user_query = "g.addV('User').property(nickname, nickname).property(username, username).property(concern, concern)"
    #     user_bindings = {"nickname": signup_request.nickname, "username": signup_request.username, "concern": signup_request.concern}
    #     user_result = await client.submit(create_user_query, user_bindings).all().result()
    #     user_node_id = user_result[0].id

    #     create_edge_query = "g.V(uuid).addE('is_info').to(g.V(user_node_id))"
    #     edge_bindings = {"uuid": uuid, "user_node_id": user_node_id}
    #     await client.submit(create_edge_query, edge_bindings).all().result()
    #     return create_access_token(uuid)
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=str(e))
    # finally:
    #     client.close()


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
