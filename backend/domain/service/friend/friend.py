# backend/domain/service/friend/friend.py
from fastapi import HTTPException, APIRouter, Depends, Body, Request
from utils import verify_access_token, Logger
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
    logger.info("send_knock")
    token = request.cookies.get(access_token)
    from_user_node_id = verify_access_token(token)["user_node_id"]
    to_user_node_id = send_knock_request.to_user_node_id
    knock_edge_id = str(uuid.uuid4())
    print(knock_edge_id)

    try:
        query = f"""
        MATCH (from_user:User {{node_id: '{from_user_node_id}'}})
        MATCH (to_user:User {{node_id: '{to_user_node_id}'}})
        WHERE from_user.node_id <> to_user.node_id
        OPTIONAL MATCH (from_user)-[r:is_roommate]->(to_user)
        WITH from_user, to_user, r
        WHERE r IS NULL
        OPTIONAL MATCH (from_user)-[k:knock]->(to_user)
        WITH from_user, to_user, k
        WHERE k IS NULL AND NOT (from_user)-[:block]-(to_user) AND NOT (to_user)-[:block]-(from_user)
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
                detail=f"Cannot send.",
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
    logger.info("list_knock")
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
    logger.info("reject_knock")
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
    logger.info("accept_knock")
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        edge_id_1 = str(uuid.uuid4())
        edge_id_2 = str(uuid.uuid4())

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
    logger.info("create_knock_by_link")
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
    logger.info("accept_knock_by_link")
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        datetimenow = datetime.now().replace(microsecond=0).isoformat()
        edge_id_1 = str(uuid.uuid4())
        edge_id_2 = str(uuid.uuid4())

        query = f"""
            MATCH (u:User)<-[:is_info]-(p:PrivateData)
            WHERE left(p.link_info, 36) = '{knock_id}'
            WITH p, u, right(p.link_info, 19) AS expiration_time_str
            WITH p, u, expiration_time_str, datetime(expiration_time_str) AS expiration_time
            WHERE expiration_time > datetime("{datetimenow}")
            MATCH (from_user:User {{node_id: u.node_id}}), (to_user:User {{node_id: '{user_node_id}'}})
            WHERE NOT (from_user)-[:is_roommate]-(to_user)
            AND NOT (from_user)-[:block]-(to_user)
            AND NOT (to_user)-[:block]-(from_user)
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


@router.get("/get-members")
async def get_members(
    request: Request,
    session=Depends(get_session),
):
    logger.info("get_members")
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]
    try:
        query = f"""
        MATCH (u:User {{node_id: '{user_node_id}'}})-[:is_roommate]->(roommate:User)
        WITH u,collect(roommate) AS roommates
        UNWIND roommates AS roommate
        OPTIONAL MATCH (roommate)-[:is_roommate]->(neighbor:User)
        WHERE NOT (u)-[:block]->(neighbor)
        AND neighbor <> u
        with u,roommate,roommates, collect(neighbor) AS neighbors
        RETURN
            u,
            collect({{roommate:roommate,neighbors:neighbors}}) AS roommates_with_neighbors, 
            roommates,
            [n IN apoc.coll.toSet(apoc.coll.flatten(COLLECT(neighbors))) WHERE NOT n IN roommates] AS neighbors
        """

        result = session.run(query)
        record = result.data()

        print("record : ", record)
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
    logger.info("get_member")
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        OPTIONAL MATCH (friend:User {{node_id: '{get_friend_request.user_node_id}'}})
        OPTIONAL MATCH (me:User {{node_id: '{user_node_id}'}})
        OPTIONAL MATCH (friend)<-[b:block]->(me)
        OPTIONAL MATCH (me)-[r:is_roommate]->(friend)
        OPTIONAL MATCH (friend)<-[:is_sticker]-(sticker:Sticker)
        WITH friend, b , r,  collect(sticker) AS stickers
        OPTIONAL MATCH (friend)<-[:is_post]-(post:Post)
        WITH friend, b , r, stickers, collect(post) AS posts
        OPTIONAL MATCH (friend)-[c:cast]->(:User)
        WITH friend, b , r, stickers,posts, {{casts : apoc.map.groupBy(collect(c), 'cast_id')}} AS casts
        RETURN 
        CASE 
            WHEN friend IS NULL THEN "no such node {get_friend_request.user_node_id}"
            WHEN b IS NOT NULL THEN "block exists"
            ELSE "welcome my friend"
        END AS message,
        friend , r, stickers,posts, casts
        """

        result = session.run(query)
        record = result.single()

        if record["message"] != "welcome my friend":
            raise HTTPException(status_code=404, detail=record["message"])

        return GetFriendResponse.from_data(
            dict(record["friend"]),
            dict(record["r"]),
            record["stickers"],
            record["posts"],
            record["casts"],
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
    logger.info("delete_member")
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
    logger.info("get_memo")
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
    logger.info("modify_memo")
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
