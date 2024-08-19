# backend/domain/service/friend/block/block.py
import asyncio
from typing import List
from fastapi import APIRouter, HTTPException, APIRouter, Depends, Body, Request
from utils import verify_access_token
from config.connection import get_session
from .request import BlockFriendRequest, PopBlockedRequest
from .response import BlockFriendResponse, GetBlockedResponse

router = APIRouter()
access_token = "access_token"


@router.post("/add_member", response_model=BlockFriendResponse)
async def block_friend(
    request: Request,
    session=Depends(get_session),
    block_friend_request: BlockFriendRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        MATCH (from_user:User {{node_id: '{user_node_id}'}}), (to_user:User {{node_id: '{block_friend_request.user_node_id}'}})
        OPTIONAL MATCH (from_user)<-[r:is_roommate]-(to_user)
        DELETE r
        MERGE (from_user)-[:is_blocked {{edge_id: randomUUID()}}]->(to_user)
        RETURN 'User blocked successfully' AS message
        """

        result = session.run(query)
        record = result.single()

        if not record:
            raise HTTPException(status_code=400, detail="User not found")
        return BlockFriendResponse(message=record["message"])

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.post("/get-members", response_model=List[GetBlockedResponse])
async def get_blocked(
    request: Request,
    session=Depends(get_session),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        MATCH (u:User {{node_id: '{user_node_id}'}})-[block:is_blocked]->(blocked_user:User)
        RETURN block, blocked_user
        """

        result = session.run(query)
        records = result.data()
        print(records)
        response = [
            GetBlockedResponse.from_data(record["block"], record["blocked_user"])
            for record in records
        ]
        return response

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.delete("/pop-members")
async def pop_blocked(
    request: Request,
    session=Depends(get_session),
    pop_blocked_request: PopBlockedRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        g.V('{user_node_id}').outE('block').hasId('{pop_blocked_request.block_edge_id}').fold()
        .coalesce(
            unfold().sideEffect(V('{pop_blocked_request.block_edge_id}').drop()).constant('dropped'),
            constant('not exist')
        )
        """

        future_result_set = session.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        print(results)

        if results == ["not exist"]:
            return PopBlockedRequest(message="not exist")
        else:
            return PopBlockedRequest(
                message=f"'{pop_blocked_request.block_edge_id}' dropped"
            )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()
