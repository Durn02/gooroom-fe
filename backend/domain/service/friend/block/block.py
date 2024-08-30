# backend/domain/service/friend/block/block.py
import asyncio
from typing import List
from fastapi import APIRouter, HTTPException, APIRouter, Depends, Body, Request
from utils import verify_access_token, Logger
from config.connection import get_session
from .request import BlockFriendRequest, PopBlockedRequest
from .response import BlockFriendResponse, GetBlockedResponse, PopBlockedResponse

router = APIRouter()
access_token = "access_token"
logger = Logger(__file__)


@router.post("/add_member", response_model=BlockFriendResponse)
async def block_friend(
    request: Request,
    session=Depends(get_session),
    block_friend_request: BlockFriendRequest = Body(...),
):
    logger.info("block_friend")
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
            MATCH (from_user:User {{node_id: '{user_node_id}'}}), (to_user:User {{node_id: '{block_friend_request.user_node_id}'}})
            OPTIONAL MATCH (from_user)-[b:block]->(to_user)
            WHERE b IS NULL
            MERGE (from_user)-[:block {{edge_id: randomUUID()}}]->(to_user)
            WITH from_user, to_user, b
            OPTIONAL MATCH (from_user)<-[r:is_roommate]->(to_user)
            OPTIONAL MATCH (from_user)<-[m:mute]->(to_user)
            DELETE r, m
            RETURN 
                CASE WHEN b IS NULL THEN 'User blocked successfully' ELSE 'User was already blocked' END AS message
            """

        result = session.run(query)
        record = result.single()

        if not record:
            raise HTTPException(status_code=400, detail="Failed to block")
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
    logger.info("get_blocked")
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        MATCH (u:User {{node_id: '{user_node_id}'}})-[b:block]->(blocked_user:User)
        RETURN b.edge_id, blocked_user
        """

        result = session.run(query)
        records = result.data()
        print(records)
        response = [
            GetBlockedResponse.from_data(record["b.edge_id"], record["blocked_user"])
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
    logger.info("pop_blocked")
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        MATCH (from_user:User {{node_id: '{user_node_id}'}})-[b:block {{edge_id: '{pop_blocked_request.block_edge_id}'}}]->(to_user:User)
        DELETE b
        RETURN b
        """

        result = session.run(query)
        record = result.single()

        if not record:
            raise HTTPException(status_code=400, detail="Failed to block")
        else:
            return PopBlockedResponse(
                message=f"'{pop_blocked_request.block_edge_id}' dropped"
            )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()
