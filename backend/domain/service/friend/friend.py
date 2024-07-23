# backend/domain/service/friend/friend.py
import asyncio
from fastapi import HTTPException, APIRouter, Depends, Body, Request
from utils import verify_access_token
from config.connection import create_gremlin_client
from .request import SendKnockRequest,RejectKnockRequest,AcceptKnockRequest,GetFriendRequest,DeleteFriendRequest,GetMemoRequest,ModifyMemoRequest
from .response import ListKnockResponse,SendKnockResponse,AcceptKnockResponse,GetFriendResponse,DeleteFriendResponse,GetMemoResponse, ModifyMemoResponse
from gremlin_python.process.traversal import T

router = APIRouter()
access_token = "access_token"

@router.post("/knock/send",  response_model=SendKnockResponse)
async def send_knock(
    request: Request,
    client=Depends(create_gremlin_client),
    send_knock_request: SendKnockRequest = Body(...),
):
    token = request.cookies.get(access_token)
    from_user_node_id = (verify_access_token(token))['user_node_id']
    to_user_node_id = send_knock_request.to_user_node_id

    try:
        query = f"""g.V('{from_user_node_id}')
        .outE('knock').where(inV().hasId('{to_user_node_id}')).fold()
        .coalesce(
            unfold().constant('already knock exists'),
            addE('knock').from(V('{from_user_node_id}')).to(V('{to_user_node_id}'))
        )
        """

        edge_result_set = client.submitAsync(query).result().all()
        edge_result = await asyncio.wrap_future(edge_result_set)
        print("edge_result : ", edge_result)

        if edge_result :
            if edge_result[0] == 'already knock exists':
                raise HTTPException(status_code=400, detail="already knock exists")
            return SendKnockResponse()
        else :
            raise HTTPException(status_code=404, detail=f"no such user {send_knock_request.to_user_node_id}")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()

@router.post("/knock/list",response_model=ListKnockResponse)
async def list_knock(
    request: Request,
    client=Depends(create_gremlin_client),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)['user_node_id']
    print('user_node_id : ', user_node_id)

    try:
        query = f"g.V('{user_node_id}').inE('knock').as('knock').outV().as('from_user_node').select('knock', 'from_user_node').by(valueMap(true))"
        future_result_set = client.submitAsync(query).result().all()
        results =  await asyncio.wrap_future(future_result_set)

        print(results)

        result_list = ListKnockResponse(knocks=[])
        for result in results:
            edge_id = result['knock'][T.id]
            nickname = ''
            if result['from_user_node']['nickname'] :
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
        query = f"g.E('{reject_knock_request.knock_id}').drop()"
        future_result_set = client.submitAsync(query).result().all()
        await asyncio.wrap_future(future_result_set)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()

@router.post("/knock/accept", response_model=AcceptKnockResponse)
async def accept_knock(
    request: Request,
    client=Depends(create_gremlin_client),
    accept_knock_request: AcceptKnockRequest = Body(...),
):
    token = request.cookies.get(access_token)
    verify_access_token(token)['user_node_id']

    try:
        query = f"""
        g.E('{accept_knock_request.knock_id}').fold()
        .coalesce(
        unfold().as('knock').inV().as('from_user_node')
        .select('knock').outV().as('current_user_node')
        .addE('is_roommate').from('from_user_node').to('current_user_node')
        .addE('is_roommate').from('current_user_node').to('from_user_node')
        .sideEffect(__.select('knock').drop()),
        constant('Edge not found'))
        """

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)
        print("solved_future_result_set : " , results[0])
        if results[0] == 'Edge not found' :
            raise HTTPException(status_code=400, detail="no such knock_edge")
        else :
            return AcceptKnockResponse()
    except HTTPException as e :
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()

@router.post("/get-members")
async def get_members(
    request: Request,
    client=Depends(create_gremlin_client),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)['user_node_id']
    
    try:
        query = f"""g.V('{user_node_id}').out('is_roommate')
        .where(not(__.inE('block').outV().hasId('{user_node_id}')))
        .group().by(id())
        .by(
        project('roommate', 'posts', 'stickers')
        .by(valueMap(true))
        .by(out('is_post').id().fold())
        .by(out('is_sticker').id().fold())
        )
        .aggregate('roommates')
        .V('{user_node_id}').out('is_roommate').out('is_roommate')
        .where(not(__.inE('block').outV().hasId('{user_node_id}')))
        .where(not(hasId('{user_node_id}'))).dedup()
        .group().by(id())
        .by(
        project('neighbor', 'posts', 'stickers')
        .by(valueMap(true))
        .by(out('is_post').id().fold())
        .by(out('is_sticker').id().fold())
        ).aggregate('neighbors').cap('roommates', 'neighbors')
        """

        friend_result_set = client.submitAsync(query).result().all()
        friend_results = await asyncio.wrap_future(friend_result_set)

        friends = friend_results[0]
        print("friends : ", friends)
        print("len(friends['roommates']) : ", len(friends['roommates']))
        if not len(friends['roommates']):
            roommates = {} 
        else : 
            roommates = friends['roommates'][0]
        if not len(friends['neighbors']):
            neighbors = {} 
        else : 
            neighbors = friends['neighbors'][0]

        print("roommates : ", roommates)
        print("neighbors : ", neighbors)
        for k in roommates.keys():
            neighbors.pop(k,None)

        print("pure_neighbors : ", neighbors)

        response = {
            'roommates': roommates,
            'neighbors': neighbors
        }
        return response

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()

@router.post("/get-member", response_model = GetFriendResponse)
async def get_member(
    request: Request,
    client=Depends(create_gremlin_client),
    get_friend_request: GetFriendRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)['user_node_id']

    try:

        query = f"""g.V('{get_friend_request.user_node_id}').valueMap(true).as('friend_node')
        .coalesce(
        V('{get_friend_request.user_node_id}').inE('is_roommate').where(outV().hasId('{user_node_id}')).properties('memo').value(),
        __.constant(''))
        .as('memo')
        .select('friend_node', 'memo')
        """

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        if not len(results):
            raise HTTPException(status_code=404, detail=f'no such friend {get_friend_request.user_node_id}')

        return GetFriendResponse.from_data(results[0]['friend_node'], results[0]['memo'])

    except HTTPException as e :
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()

@router.delete("/delete-member" , response_model=DeleteFriendResponse)
async def delete_member(
    request: Request,
    client=Depends(create_gremlin_client),
    delete_friend_request: DeleteFriendRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)['user_node_id']

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

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        if not len(results):
            raise HTTPException(status_code=404, detail=f'no such friend {delete_friend_request.user_node_id}')

        return DeleteFriendResponse(message=results[0])

    except HTTPException as e :
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()

@router.post("/memo/get-content",  response_model=GetMemoResponse)
async def get_memo(
    request: Request,
    client=Depends(create_gremlin_client),
    get_memo_request: GetMemoRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)['user_node_id']

    try:
        query = f"""
        g.V('{user_node_id}').outE('is_roommate').where(inV().hasId('{get_memo_request.user_node_id}'))
        .properties('memo').value()
        """

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        if not len(results):
            raise HTTPException(status_code=404, detail=f'no such friend {get_memo_request.user_node_id}')

        print(results[0])
        return GetMemoResponse(memo=results[0])

    except HTTPException as e :
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()

@router.post("/memo/modify",response_model=ModifyMemoResponse)
async def modify_memo(
    request: Request,
    client=Depends(create_gremlin_client),
    modify_memo_request: ModifyMemoRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)['user_node_id']

    try:
        query = f"""
        g.V('{user_node_id}').outE('is_roommate').where(inV().hasId('{modify_memo_request.user_node_id}'))
        .property('memo','{modify_memo_request.new_memo}')
        """

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        if not len(results):
            raise HTTPException(status_code=404, detail=f'no such friend {modify_memo_request.user_node_id}')

        print(results[0])
        return ModifyMemoResponse()

    except HTTPException as e :
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()
