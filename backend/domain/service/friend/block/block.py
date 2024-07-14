# backend/domain/service/friend/block/block.py
import asyncio
from fastapi import APIRouter,HTTPException, APIRouter, Depends, Body, Request
from utils import verify_access_token
from config.connection import create_gremlin_client
from gremlin_python.process.traversal import T
from .request import BlockFriendRequest
from .response import BlockFriendResponse,GetBlockedResponse
from typing import List

router = APIRouter()
access_token = "access_token"

@router.post("/add-member")
async def block_friend(
    request: Request,
    client = Depends(create_gremlin_client),
    block_friend_request: BlockFriendRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)['user_node_id']

    try:
        query = f"""g.V('{user_node_id}').as('from_user_node')
        .V('{block_friend_request.user_node_id}').as('to_user_node')
        .coalesce(
        __.select('from_user_node').outE('block').where(inV().as('to_user_node')),
        __.addE('block').from('from_user_node').to('to_user_node'))
        """

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        if not len(results):
            raise HTTPException(status_code=404, detail=f'no such user {block_friend_request.user_node_id}')

        print(results[0])
        return BlockFriendResponse()

    except HTTPException as e :
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()

@router.post("/get-members",response_model = List[GetBlockedResponse])
async def get_members(
    request: Request,
    client = Depends(create_gremlin_client),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)['user_node_id']

    try:
        query = f"""
        g.V('{user_node_id}').outE('block').as('block_edge').inV().as('blocked_user').select('block_edge', 'blocked_user').by(valueMap(true))
        """

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)
        response =  [GetBlockedResponse.from_data(result['block_edge'], result['blocked_user']) for result in results]
        return response

    except HTTPException as e :
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()