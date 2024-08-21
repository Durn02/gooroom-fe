# backend/domain/service/content/content.py
import asyncio, json
from fastapi import HTTPException, APIRouter, Depends, Body, Request
from utils import verify_access_token, Logger
from config.connection import get_session
from typing import List
from datetime import datetime, timedelta, timezone
from .request import (
    CreateStickerRequest,
    GetStickersRequest,
    DeleteStickerRequest,
    CreatePostRequest,
    GetPostsRequest,
    ModifyMyPostRequest,
    DeleteMyPostRequest,
    SendCastRequest,
)
from .response import (
    CreateStickerResponse,
    GetStickersResponse,
    GetMyStickersResponse,
    DeleteStickerResponse,
    CreatePostResponse,
    GetPostsResponse,
    DeleteMyPostResponse,
    SendCastResponse,
    GetCastsResponse,
)

logger = Logger(__file__)
router = APIRouter()
access_token = "access_token"


@router.post("/sticker/create", response_model=CreateStickerResponse)
async def create_sticker(
    request: Request,
    session=Depends(get_session),
    create_sticker_request: CreateStickerRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    datetimenow = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

    try:
        query = f"""
        MATCH (u:User {{node_id: '{user_node_id}'}})
        CREATE (s:Sticker {{
                content : '{create_sticker_request.content}',
                image_url : {create_sticker_request.image_url},
                created_at : '{datetimenow}',
                node_id : randomUUID()
            }})
        CREATE (s)-[is_sticker:is_sticker]->(u)
        RETURN is_sticker
        """

        result = session.run(query)
        record = result.single()

        if not record:
            raise HTTPException(status_code=404, detail=f"no such user {user_node_id}")

        return CreateStickerResponse()

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


# @router.post("/sticker/get-contents", response_model=List[GetStickersResponse])
@router.post("/sticker/get-contents")
async def get_contents(
    request: Request,
    session=Depends(get_session),
    get_sticker_request: GetStickersRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        OPTIONAL MATCH (me: User {{node_id: '{user_node_id}'}})
        OPTIONAL MATCH (friend:User {{node_id: '{get_sticker_request.user_node_id}'}})
        OPTIONAL MATCH (me)<-[b:is_blocked]->(friend)
        OPTIONAL MATCH (me)-[m:mute]->(friend)
        OPTIONAL MATCH (friend)<-[:is_sticker]-(sticker)
        WITH friend, me, b, m, collect(sticker) AS stickers
        RETURN 
        CASE 
            WHEN me IS NULL THEN "no such node {user_node_id}"
            WHEN friend IS NULL THEN "no such node {get_sticker_request.user_node_id}"
            WHEN b IS NOT NULL THEN "is_blocked exists"
            WHEN m IS NOT NULL THEN "mute exists"
            ELSE "get stickers"
        END AS message, 
        stickers
        """

        result = session.run(query)
        record = result.single()

        if record['message'] != "get stickers":
            raise HTTPException(status_code=404, detail=record['message'])

        print(record['stickers'])
        for sticker in record['stickers']:
            print(dict(sticker))
        return [GetStickersResponse.from_data(dict(sticker)) for sticker in record['stickers']]

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.get("/sticker/get-my-contents", response_model=List[GetMyStickersResponse])
async def get_my_contents(request: Request, session=Depends(get_session)):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        MATCH (me: User {{node_id: '{user_node_id}'}})
        OPTIONAL MATCH (me)<-[:is_sticker]-(sticker)
        RETURN collect(sticker) AS stickers
        """

        result = session.run(query)
        record = result.single()

        if not record:
            raise HTTPException(status_code=404, detail=f"invalid user_node_id {user_node_id}")

        return [GetMyStickersResponse.from_data(dict(sticker)) for sticker in record['stickers']]

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()

@router.delete("/sticker/delete",response_model=DeleteStickerResponse)
async def delete_sticker(
    request: Request,
    session=Depends(get_session),
    delete_sticker_request: DeleteStickerRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        OPTIONAL MATCH (me:User {{node_id: '{user_node_id}'}})
        OPTIONAL MATCH (s:Sticker {{node_id: '{delete_sticker_request.sticker_node_id}'}})
        OPTIONAL MATCH (s)-[r:is_sticker]->(me)
        WITH me, s, r
        CALL apoc.do.case(
        [
            me is NULL, 'RETURN "User does not exist" As message',
            s IS NULL, 'RETURN "Sticker does not exist" AS message',
            r IS NULL, 'RETURN "Relationship does not exist" AS message'
        ],
        'DETACH DELETE s RETURN "Sticker and relationship deleted" AS message',
        {{s: s, r: r}}
        ) YIELD value
        RETURN value.message AS message
        """

        result = session.run(query)
        record = result.single()

        print(record)

        if record['message']!='Sticker and relationship deleted':        
            raise HTTPException(status_code=500, detail=record['message'])
        
        return DeleteStickerResponse(message=record['message'])
            

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


async def delete_old_stickers():
    current_time = datetime.now(timezone.utc)
    delete_before = current_time - timedelta(hours=24)
    delete_before_timestamp = delete_before.isoformat()

    session = get_session()

    try:
        print("delete_before_timestamp : ", delete_before_timestamp)
        query = f"""
        g.V().hasLabel('sticker').has('created_at', lte('{delete_before_timestamp}')).as('old_stickers')
            .sideEffect(store('old_stickers').by(valueMap(true))).drop().cap('old_stickers')
        """

        future_result_set = session.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        logger.info(f"delete_old_stickers : '{results}'")

    except Exception as e:
        raise e
    finally:
        session.close()


@router.post("/post/create", response_model=CreatePostResponse)
async def create_post(
    request: Request,
    session=Depends(get_session),
    create_post_request: CreatePostRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        g.addV('post')
            .property('content','{create_post_request.content}')
            .property('image_url','{create_post_request.image_url}')
            .property('is_public','{create_post_request.is_public}')
            .property('title','{create_post_request.title}')
            .property('tag','{json.dumps(create_post_request.tag)}')
            .property('created_at','{datetime.now(timezone.utc)}')
            .as('new_post')
        .addE('is_post').from(V('{user_node_id}')).to('new_post')
        """

        future_result_set = session.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        print(results)
        if not results:
            raise HTTPException(status_code=404, detail="results is empty")

        return CreatePostResponse

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.post("/post/get-content", response_model=List[GetPostsResponse])
async def get_posts(
    request: Request,
    client=Depends(get_session),
    create_post_request: GetPostsRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        g.V('{create_post_request.user_node_id}').outE('block').where(inV().hasId('{user_node_id}')).fold()
        .coalesce(
            unfold().constant("empty posts"),
            V('{create_post_request.user_node_id}').outE('is_post').inV().has('is_public','True').valueMap(true)
        """

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        print(results)
        if not (results) or results == ["empty posts"]:
            return []

        response = [GetPostsResponse.from_data(result) for result in results]
        return response

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()


@router.get("/post/get-my-content", response_model=List[GetPostsResponse])
async def get_my_posts(
    request: Request,
    client=Depends(get_session),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        g.V('{user_node_id}').outE('is_post').inV().valueMap(true)
        """

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        print(results)

        response = [GetPostsResponse.from_data(result) for result in results]
        return response

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()


@router.post("/post/modify-my-content", response_model=GetPostsResponse)
async def modify_my_post(
    request: Request,
    client=Depends(get_session),
    modify_my_post_request: ModifyMyPostRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]
    post_node_id = modify_my_post_request.post_node_id
    new_content = modify_my_post_request.new_content
    new_image_url = modify_my_post_request.new_image_url
    new_is_public = modify_my_post_request.new_is_public
    new_title = modify_my_post_request.new_title
    new_tag = modify_my_post_request.new_tag

    try:
        query = f"g.V('{user_node_id}').outE('is_post').inV().hasId('{post_node_id}')"
        if new_content:
            query += f".property(single,'content','{new_content}')"
        if new_image_url:
            query += f".property(single,'image_url','{new_image_url}')"
        if new_is_public:
            query += f".property(single,'is_public','{new_is_public}')"
        if new_title:
            query += f".property(single,'title','{new_title}')"
        if new_tag:
            query += f".property(single,'tag','{json.dumps(new_tag)}')"
        query += ".valueMap(true)"

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        print("results :", results)
        if not results:
            raise HTTPException(
                status_code=404,
                detail=f"no such post '{post_node_id}' in user '{user_node_id}'",
            )
        response = GetPostsResponse.from_data(results[0])
        return response

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()


@router.delete("/post/delete-my-content", response_model=DeleteMyPostResponse)
async def delete_my_post(
    request: Request,
    client=Depends(get_session),
    delete_my_post_request: DeleteMyPostRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        g.V('{user_node_id}').outE('is_post').inV().hasId('{delete_my_post_request.post_node_id}').fold()
        .coalesce(
            unfold().sideEffect(V('{delete_my_post_request.post_node_id}').drop()).constant('dropped'),
            constant('not exist')
        )
        """

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        print(results)

        if results == ["not exist"]:
            return DeleteMyPostResponse(message="not exist")
        else:
            return DeleteMyPostResponse(
                message=f"'{delete_my_post_request.post_node_id}' dropped"
            )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()


@router.post("/cast/send", response_model=SendCastResponse)
async def send_cast(
    request: Request,
    client=Depends(get_session),
    send_cast_request: SendCastRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        g.V('{user_node_id}').as('user')
        """
        for friend in send_cast_request.friends:
            query += f""".sideEffect(addE('cast').from('user').to(V('{friend}'))
            .property(single,'message','{send_cast_request.message}')
            .property(single,'created_at','{datetime.now(timezone.utc)}'))
            """

        print("query :", query)

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        if not results:
            raise HTTPException(
                status_code=404, detail="there's invalid friend in friends"
            )

        return SendCastResponse()

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()


async def delete_old_casts():
    current_time = datetime.now(timezone.utc)
    delete_before = current_time - timedelta(hours=1)
    delete_before_timestamp = delete_before.isoformat()

    client = get_session()

    print("delete_old_casts")

    try:
        query = f"""
        g.V().hasLabel('cast').has('created_at', lte('{delete_before_timestamp}')).as('old_casts')
        .sideEffect(store('old_casts').by(valueMap(true))).drop().cap('old_casts')
        """

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        logger.info(f"delete_old_casts : '{results}'")

    except Exception as e:
        raise e
    finally:
        client.close()


@router.get("/cast/get-contents", response_model=List[GetCastsResponse])
async def get_casts(
    request: Request,
    client=Depends(get_session),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        g.V('{user_node_id}').inE('cast').where(not(outV().outE('block'))).valueMap(true)
        """

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        print(results)

        response = [GetCastsResponse.from_data(result) for result in results]
        return response

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()
