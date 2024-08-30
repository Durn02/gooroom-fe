# backend/domain/service/friend/block/block.py
from typing import List
from utils import verify_access_token, Logger
from config.connection import get_session
from .request import MuteFriendRequest, PopMutedRequest
from .response import MuteFriendResponse, GetMutedResponse, PopMutedResponse
from fastapi import APIRouter, HTTPException, APIRouter, Depends, Body, Request

router = APIRouter()
access_token = "access_token"

logger = Logger(__file__)


@router.post("/add_member", response_model=MuteFriendResponse)
async def mute_friend(
    request: Request,
    session=Depends(get_session),
    mute_friend_request: MuteFriendRequest = Body(...),
):
    logger.info("mute_friend")
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
            MATCH (from_user:User {{node_id: '{user_node_id}'}}), (to_user:User {{node_id: '{mute_friend_request.user_node_id}'}})
            OPTIONAL MATCH (from_user)-[m:mute]->(to_user)
            WITH from_user, to_user, m
            WHERE m IS NULL
            MERGE (from_user)-[:mute {{edge_id: randomUUID()}}]->(to_user)
            RETURN 
                CASE WHEN m IS NULL THEN 'User muted successfully' ELSE 'failed' END AS message
            """

        result = session.run(query)
        record = result.single()

        if not record:
            raise HTTPException(status_code=400, detail="Failed to block")
        return MuteFriendResponse(message=record["message"])

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.post("/get-members", response_model=List[GetMutedResponse])
async def get_muteed(
    request: Request,
    session=Depends(get_session),
):
    logger.info("get_muted")
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        MATCH (u:User {{node_id: '{user_node_id}'}})-[m:mute]->(muted_user:User)
        RETURN m.edge_id, muted_user
        """

        result = session.run(query)
        records = result.data()
        print(records)
        response = [
            GetMutedResponse.from_data(record["m.edge_id"], record["muted_user"])
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
async def pop_muted(
    request: Request,
    session=Depends(get_session),
    pop_muted_request: PopMutedRequest = Body(...),
):
    logger.info("pop_muted")
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        MATCH (from_user:User {{node_id: '{user_node_id}'}})-[m:mute {{edge_id: '{pop_muted_request.mute_edge_id}'}}]->(to_user:User)
        DELETE m
        RETURN m
        """

        result = session.run(query)
        record = result.single()

        if not record:
            raise HTTPException(status_code=400, detail="Failed to mute")
        else:
            return PopMutedResponse(
                message=f"'{pop_muted_request.block_edge_id}' dropped"
            )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()
