# backend/domain/service/friend/friend.py
import asyncio
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
    from_user_node_id = (verify_access_token(token))["user_node_id"]
    to_user_node_id = send_knock_request.to_user_node_id

    try:
        query = f"""g.V('{from_user_node_id}')
        .outE('knock').where(inV().hasId('{to_user_node_id}')).fold()
        .coalesce(
            unfold().constant('already knock exists'),
            addE('knock').from(V('{from_user_node_id}')).to(V('{to_user_node_id}'))
        )
        """

        edge_result_set = session.submitAsync(query).result().all()
        edge_result = await asyncio.wrap_future(edge_result_set)
        print("edge_result : ", edge_result)

        if edge_result:
            if edge_result[0] == "already knock exists":
                raise HTTPException(status_code=400, detail="already knock exists")
            return SendKnockResponse()
        else:
            raise HTTPException(
                status_code=404,
                detail=f"no such user {send_knock_request.to_user_node_id}",
            )
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
        query = f"g.V('{user_node_id}').inE('knock').as('knock').outV().as('from_user_node').select('knock', 'from_user_node').by(valueMap(true))"
        future_result_set = session.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        print(results)

        result_list = ListKnockResponse(knocks=[])
        for result in results:
            edge_id = result["knock"][T.id]
            nickname = ""
            if result["from_user_node"]["nickname"]:
                nickname = result["from_user_node"]["nickname"][0]
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
    verify_access_token(token)["user_node_id"]

    try:
        query = f"g.E('{reject_knock_request.knock_id}').drop()"
        future_result_set = session.submitAsync(query).result().all()
        await asyncio.wrap_future(future_result_set)
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
    verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        g.E('{accept_knock_request.knock_id}').fold()
        .coalesce(
        unfold().as('knock').inV().as('from_user_node')
        .select('knock').outV().as('current_user_node')
        .addE('is_roommate').from('from_user_node').to('current_user_node').property('memo','')
        .addE('is_roommate').from('current_user_node').to('from_user_node').property('memo','')
        .sideEffect(__.select('knock').drop()),
        constant('Edge not found'))
        """

        future_result_set = session.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)
        print("solved_future_result_set : ", results[0])
        if results[0] == "Edge not found":
            raise HTTPException(status_code=400, detail="no such knock_edge")
        else:
            return AcceptKnockResponse()
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

    current_time = datetime.now(timezone.utc)
    expired = current_time + timedelta(hours=24)

    knock_id = str(uuid.uuid4())
    knock_data = f"{knock_id},{expired}"
    print(knock_data)

    try:
        query = f"g.V('{user_node_id}').in('is_info').property(single,'invite_info','{knock_data}')"
        future_result_set = session.submitAsync(query).result().all()
        await asyncio.wrap_future(future_result_set)

        return "https://gooroom/domain/friend/knock/accept_by_link:" + knock_id
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
        query = f"""
        g.V().hasLabel('PrivateData').has('invite_info',TextP.startingWith('{knock_id}')).values('invite_info')
        """

        future_result_set = session.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        if not results:
            HTTPException(status_code=404, detail="no corresponding data")

        expired = (results[0].split(","))[1]
        current_time = datetime.now(timezone.utc).isoformat()
        if expired < current_time:
            HTTPException(status_code=403, detail="expired link")

        query = f"""
        g.V().hasLabel('PrivateData').has('invite_info',TextP.startingWith('{knock_id}')).out('is_info').as('from_user')
        .choose(
            coalesce(
                V('{user_node_id}').outE('is_roommate').where(inV().as('from_user')),
                V('{user_node_id}').inE('is_roommate').where(outV().as('from_user')),
                V('{user_node_id}').outE('knock').where(inV().as('from_user')),
                V('{user_node_id}').inE('knock').where(inV().as('from_user'))
            ),
            constant('is_roommate or knock already exists'),
            addE('is_roommate').from(V('{user_node_id}')).to('from_user').property('memo','')
            .addE('is_roommate').from('from_user').to(V('{user_node_id}')).property('memo','')
            .constant('knock accepted successfully')
        )
        """

        future_result_set = session.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        if not results:
            HTTPException(status_code=404, detail="no corresponding data")

        return AcceptKnockResponse(message=results[0])

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

    try:
        query = f"""
        g.V('{user_node_id}').outE('is_roommate').where(inV().hasId('{delete_friend_request.user_node_id}')).fold()
        .coalesce(
            unfold().sideEffect(drop())
            .V('{delete_friend_request.user_node_id}').outE('is_roommate').where(inV().hasId('{user_node_id}')).sideEffect(drop())
            .constant('Edge deleted'),
            constant('{delete_friend_request.user_node_id} is not roommate')
        )
        """

        future_result_set = session.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        if not len(results):
            raise HTTPException(
                status_code=404,
                detail=f"no such friend {delete_friend_request.user_node_id}",
            )

        return DeleteFriendResponse(message=results[0])

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
