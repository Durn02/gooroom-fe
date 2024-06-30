# backend/domain/service/friend/friend.py
import os , sys, json, asyncio
from fastapi import HTTPException, APIRouter, Depends, Body, Request, Response
from utils import verify_access_token
from config.connection import create_gremlin_client
from .request import SendKnockRequest

router = APIRouter()
access_token = "access_token"

@router.post("/knock/send")
async def send_knock(
    request: Request,
    client=Depends(create_gremlin_client),
    send_knock_request: SendKnockRequest = Body(...),
):
    token = request.cookies.get(access_token)
    from_user_node_id = verify_access_token(token)

    try:
        query = f"g.V('{from_user_node_id}').addE('knock').to(V('{send_knock_request.to_user_node_id}')).property('from_user_node')"
        edge_result_set = client.submitAsync(query)
        edge_result = edge_result_set.result().one()
        print("edge_result : ", edge_result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()

@router.post("/knock/list")
async def list_knock(
    request: Request,
    client=Depends(create_gremlin_client),
    # list_knock_request: SendKnockRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)

    try:
        query = f"g.V('{user_node_id}').inE(knock).valueMap(true)"
        future_result_set = client.submitAsync(query).result().all()
        edge_result =  await asyncio.wrap_future(future_result_set)
        print("edge_result : ", edge_result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()
