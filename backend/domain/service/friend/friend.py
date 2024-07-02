# backend/domain/service/friend/friend.py
import os , sys, json, asyncio
from fastapi import HTTPException, APIRouter, Depends, Body, Request, Response
from utils import verify_access_token
from config.connection import create_gremlin_client
from .request import SendKnockRequest,RejectKnockRequest
from .response import ListKnockResponse,SendKnockResponse
from gremlin_python.process.traversal import T

router = APIRouter()
access_token = "access_token"

@router.post("/knock/send")
async def send_knock(
    request: Request,
    client=Depends(create_gremlin_client),
    send_knock_request: SendKnockRequest = Body(...),
):
    token = request.cookies.get(access_token)
    from_user_node_id = (verify_access_token(token))['user_node_id']
    print("from_user_node_id : ", from_user_node_id)

    try:
        query = f"""g.V('{from_user_node_id}').as('from_user_node')
        .V('{send_knock_request.to_user_node_id}').as('to_user_node')
        .coalesce(
        __.select('from_user_node').outE('knock').where(inV().as('to_user_node')),
        __.addE('knock').from('from_user_node').to('to_user_node'))
        """
        print("query : ",query)
        edge_result_set = client.submitAsync(query)
        edge_result = edge_result_set.result().one()
        print("edge_result : ", edge_result)
        return SendKnockResponse()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()

@router.post("/knock/list")
async def list_knock(
    request: Request,
    client=Depends(create_gremlin_client),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)['user_node_id']
    print('user_node_id : ', user_node_id)

    try:
        query = f"g.V('{user_node_id}').inE('knock').as('knock').outV().as('from_user_node').select('knock', 'from_user_node').by(valueMap(true))"
        print("query : ", query)
        future_result_set = client.submitAsync(query).result().all()
        results =  await asyncio.wrap_future(future_result_set)

        result_list = ListKnockResponse(knocks=[])
        for result in results:
            edge_id = result['knock'][T.id]
            nickname = result['from_user_node']['nickname'][0]
            result_list.append_knock(edge_id,nickname)

        return result_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()

@router.post("/knock/reject")
async def reject_knock(
    request: Request,
    client=Depends(create_gremlin_client),
    reject_knock_request: RejectKnockRequest = Body(...),
):
    token = request.cookies.get(access_token)
    verify_access_token(token)['user_node_id']

    try:
        query = f"g.E('{reject_knock_request.knock_id}').hasLabel('knock').drop()"
        print("query : ", query)
        future_result_set = client.submitAsync(query).result().all()
        await asyncio.wrap_future(future_result_set)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()