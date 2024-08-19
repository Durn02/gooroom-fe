# backend/domain/service/friend/friend.py
import asyncio
from fastapi import HTTPException, APIRouter, Depends, Body, Request
from utils import verify_access_token, Logger
import random, string
from config.connection import get_session
from .request import (
    SendKnockRequest,
    RejectKnockRequest,
    AcceptKnockRequest,
    GetFriendRequest,
    DeleteFriendRequest,
    GetMemoRequest,
    ModifyMemoRequest,
)
from .response import (
    ListKnockResponse,
    SendKnockResponse,
    AcceptKnockResponse,
    GetFriendResponse,
    DeleteFriendResponse,
    GetMemoResponse,
    ModifyMemoResponse,
    RejectKnockResponse,
)
from datetime import datetime, timedelta, timezone
import uuid

router = APIRouter()
access_token = "access_token"
logger = Logger(__file__)


@router.post("/knock/send", response_model=SendKnockResponse)
async def send_knock(
    request: Request,
    session=Depends(get_session),
    send_knock_request: SendKnockRequest = Body(...),
):
    token = request.cookies.get(access_token)
    from_user_node_id = verify_access_token(token)["user_node_id"]
    to_user_node_id = send_knock_request.to_user_node_id
    knock_edge_id = str(uuid.uuid4())
    print(knock_edge_id)

    try:
        # Cypher 쿼리를 사용하여 knock 관계를 생성하거나 확인합니다.
        query = f"""
        MATCH (from_user:User {{node_id: '{from_user_node_id}'}})
        MATCH (to_user:User {{node_id: '{to_user_node_id}'}})
        WHERE from_user.node_id <> to_user.node_id
        OPTIONAL MATCH (from_user)-[r:is_roommate]->(to_user)
        WITH from_user, to_user, r
        WHERE r IS NULL
        OPTIONAL MATCH (from_user)-[k:knock]->(to_user)
        WITH from_user, to_user, k
        WHERE k IS NULL AND NOT (from_user)-[:is_blocked]-(to_user) AND NOT (to_user)-[:is_blocked]-(from_user)
        CREATE (from_user)-[nk:knock]->(to_user)
        SET nk.edge_id = '{knock_edge_id}'
        RETURN "knock created" AS message, nk.edge_id AS knock_edge_id

        """

        result = session.run(query)
        record = result.single()
        print(record)
        if not record:
            raise HTTPException(
                status_code=404,
                detail=f"No such user {to_user_node_id} or already sent.",
            )

        return SendKnockResponse()

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.post("/knock/list", response_model=ListKnockResponse)
async def list_knock(
    request: Request,
    session=Depends(get_session),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]
    print("user_node_id : ", user_node_id)
    try:
        query = f"""
        MATCH (u:User {{node_id: '{user_node_id}'}})<-[k:knock]-(from_user:User)
        RETURN k.edge_id AS knock_edge_id, from_user.nickname AS nickname
        """

        result = session.run(query)
        records = result.data()

        print(records)

        result_list = ListKnockResponse(knocks=[])
        for record in records:
            edge_id = record["knock_edge_id"]
            nickname = record.get("nickname", "")
            result_list.append_knock(edge_id, nickname)

        return result_list

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.post("/knock/reject")
async def reject_knock(
    request: Request,
    session=Depends(get_session),
    reject_knock_request: RejectKnockRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        MATCH (from_user:User)-[k:knock]->(to_user:User {{node_id: '{user_node_id}'}})
        WHERE k.edge_id = '{reject_knock_request.knock_id}'
        DELETE k
        RETURN "knock deleted successfully" AS message
        """
        result = session.run(query)
        record = result.single()
        print(record)
        if not record:
            raise HTTPException(status_code=400, detail="no such knock_edge")

        return RejectKnockResponse(message=record["message"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.post("/knock/accept", response_model=AcceptKnockResponse)
async def accept_knock(
    request: Request,
    session=Depends(get_session),
    accept_knock_request: AcceptKnockRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        edge_id_1 = str(uuid.uuid4())
        edge_id_2 = str(uuid.uuid4())

        # Cypher 쿼리
        query = f"""
        MATCH (to_user:User {{node_id: '{user_node_id}'}})<-[k1:knock]-(from_user:User)
        WHERE k1.edge_id = '{accept_knock_request.knock_id}'
        WITH from_user, to_user, k1
        OPTIONAL MATCH (from_user)-[r:is_roommate]->(to_user)
        WITH from_user, to_user, r, k1
        WHERE r IS NULL
        OPTIONAL MATCH (from_user)<-[k2:knock]-(to_user)
        WITH from_user, to_user, k1, k2
        WHERE from_user <> to_user
        CREATE (from_user)-[:is_roommate {{memo: '', edge_id: '{edge_id_1}'}}]->(to_user)
        CREATE (to_user)-[:is_roommate {{memo: '', edge_id: '{edge_id_2}'}}]->(from_user)
        DELETE k1, k2
        RETURN "Roommate relationship created" AS message
        """

        result = session.run(query)
        record = result.single()
        print(record)
        if not record:
            raise HTTPException(status_code=400, detail="no such knock_edge")

        return AcceptKnockResponse(message=record["message"])

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.get("/knock/create_link")
async def create_knock_by_link(
    request: Request,
    session=Depends(get_session),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    link_code = str(uuid.uuid4())

    expiration_time = datetime.now() + timedelta(hours=24)
    link_info = link_code + " : " + expiration_time.replace(microsecond=0).isoformat()

    try:
        query = f"""
        MATCH (u:User {{node_id: '{user_node_id}'}})<-[:is_info]-(p:PrivateData)
        WITH p
        WHERE p.link_count < 5
        SET p.link_count = p.link_count + 1, 
            p.link_info = '{link_info}'
        RETURN 'knock link created' AS message

        """

        result = session.run(query)
        record = result.single()
        print(record)
        if not record:
            raise HTTPException(status_code=400, detail="failed to create link")

        return f"https://gooroom/domain/friend/knock/accept_by_link:{link_code}"

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.post("/knock/accept_by_link/{knock_id}", response_model=AcceptKnockResponse)
async def accept_knock_by_link(
    knock_id: str,
    request: Request,
    session=Depends(get_session),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        datetimenow = datetime.now().replace(microsecond=0).isoformat()
        edge_id_1 = str(uuid.uuid4())
        edge_id_2 = str(uuid.uuid4())
        print(datetimenow)
        query = f"""
            MATCH (u:User)<-[:is_info]-(p:PrivateData)
            WHERE left(p.link_info, 36) = '{knock_id}'
            WITH p, u, right(p.link_info, 19) AS expiration_time_str
            WITH p, u, expiration_time_str, datetime(expiration_time_str) AS expiration_time
            WHERE expiration_time > datetime("{datetimenow}")
            MATCH (from_user:User {{node_id: u.node_id}}), (to_user:User {{node_id: '{user_node_id}'}})
            WHERE NOT (from_user)-[:is_roommate]-(to_user)
            AND NOT (from_user)-[:knock]-(to_user)
            AND NOT (from_user)-[:is_blocked]-(to_user)
            AND NOT (to_user)-[:is_blocked]-(from_user)
            CREATE (from_user)-[:is_roommate {{memo: '', edge_id: '{edge_id_1}'}}]->(to_user)
            CREATE (to_user)-[:is_roommate {{memo: '', edge_id: '{edge_id_2}'}}]->(from_user)
            RETURN 'Knock accepted successfully' AS message, expiration_time_str, expiration_time
            """

        result = session.run(query)
        record = result.single()
        print(record)
        if not record:
            raise HTTPException(
                status_code=400, detail="Cannot create is_roommate relationship"
            )

        return AcceptKnockResponse(message=record["message"])

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.post("/get-members")
async def get_members(
    request: Request,
    session=Depends(get_session),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]
    try:

        query = f"""
        MATCH (u:User {{node_id: '{user_node_id}'}})
        OPTIONAL MATCH (u)-[:is_roommate]->(roommates:User)
        WHERE NOT (u)-[:block]->(roommates)
        WITH collect(DISTINCT roommates) AS roommate_list, u 
        OPTIONAL MATCH (roommates)-[:is_roommate]->(all_neighbors:User)
        WHERE NOT (roommates)-[:block]->(all_neighbors)
        AND NOT (u)-[:block]->(all_neighbors)
        AND all_neighbors <> u
        AND NOT all_neighbors IN roommate_list

        WITH u, roommates, all_neighbors,roommate_list
        OPTIONAL MATCH (roommates)-[:is_roommate]->(neighbors:User)
        WHERE NOT (roommates)-[:block]->(neighbors)
        AND neighbors <> u
        WITH roommates,roommate_list, all_neighbors,collect(DISTINCT neighbors) AS is_roommate_with
        RETURN
        roommate_list AS roommates,
        collect(DISTINCT all_neighbors) AS neighbors,
        collect(DISTINCT {{
            roommate_node: roommates {{.*}},
            is_roommate_with: is_roommate_with
        }}) AS roommates_info
        """

        result = session.run(query)
        record = result.data()

        return record

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.post("/get-member", response_model=GetFriendResponse)
async def get_member(
    request: Request,
    session=Depends(get_session),
    get_friend_request: GetFriendRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:

        query = f"""g.V('{get_friend_request.user_node_id}').valueMap(true).as('friend_node')
        .coalesce(
        V('{get_friend_request.user_node_id}').inE('is_roommate').where(outV().hasId('{user_node_id}')).properties('memo').value(),
        __.constant(''))
        .as('memo')
        .select('friend_node', 'memo')
        """

        future_result_set = session.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        if not len(results):
            raise HTTPException(
                status_code=404,
                detail=f"no such friend {get_friend_request.user_node_id}",
            )

        return GetFriendResponse.from_data(
            results[0]["friend_node"], results[0]["memo"]
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.delete("/delete-member", response_model=DeleteFriendResponse)
async def delete_member(
    request: Request,
    session=Depends(get_session),
    delete_friend_request: DeleteFriendRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]
    print(user_node_id)
    try:
        query = f"""
        MATCH (u:User)-[r:is_roommate]->(f:User {{node_id: '{delete_friend_request.user_node_id}'}})
        WHERE u.node_id = '{user_node_id}'
        DELETE r
        WITH u, f
        MATCH (f)-[r2:is_roommate]->(u)
        DELETE r2
        RETURN 'Edge deleted' AS message
        """

        result = session.run(query)
        record = result.single()
        print(record)
        if not record:
            raise HTTPException(
                status_code=404,
                detail=f"No such friend {delete_friend_request.user_node_id} to delete relationship",
            )

        return DeleteFriendResponse(message=record["message"])

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.post("/memo/get-content", response_model=GetMemoResponse)
async def get_memo(
    request: Request,
    session=Depends(get_session),
    get_memo_request: GetMemoRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        MATCH (u:User)-[r:is_roommate]->(f:User {{node_id: '{get_memo_request.user_node_id}'}})
        WHERE f.node_id = '{user_node_id}'
        RETURN r.memo AS memo
        """
        result = session.run(query)
        record = result.single()

        if not record:
            raise HTTPException(
                status_code=404,
                detail=f"No memo found for friend {get_memo_request.user_node_id}",
            )

        return GetMemoResponse(memo=record["memo"])

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.post("/memo/modify", response_model=ModifyMemoResponse)
async def modify_memo(
    request: Request,
    session=Depends(get_session),
    modify_memo_request: ModifyMemoRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        MATCH (u:User)-[r:is_roommate]->(f:User {{node_id: '{modify_memo_request.user_node_id}'}})
        WHERE u.node_id = '{user_node_id}'
        SET r.memo = '{modify_memo_request.new_memo}'
        RETURN r.memo AS memo
        """

        result = session.run(query)
        record = result.single()

        if not record:
            raise HTTPException(
                status_code=404,
                detail=f"No such friend {modify_memo_request.user_node_id} to modify memo",
            )

        return ModifyMemoResponse()

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()
