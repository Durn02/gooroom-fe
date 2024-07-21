# backend/domain/service/content/content.py
import asyncio,json
from fastapi import HTTPException, APIRouter, Depends, Body, Request
from utils import verify_access_token, Logger
from config.connection import create_gremlin_client
from gremlin_python.process.traversal import T
from typing import List
from datetime import datetime, timedelta, timezone
from .request import CreateStickerRequest,GetStickersRequest,DeleteStickerRequest,CreatePostRequest
from .response import CreateStickerResponse,GetStickersResponse,GetMyStickersResponse,DeleteStickerResponse,CreatePostResponse

logger = Logger(__file__)
router = APIRouter()
access_token = "access_token"

@router.post("/sticker/create",response_model=CreateStickerResponse)
async def create_sticker(
    request: Request,
    client=Depends(create_gremlin_client),
    create_sticker_request: CreateStickerRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)['user_node_id']

    try:
        query = f"""
        g.addV('sticker')
            .property('content','{create_sticker_request.content}')
            .property('image_url','{create_sticker_request.image_url}')
            .property('created_at','{datetime.now(timezone.utc)}')
            .as('new_sticker')
        .addE('is_sticker').from(V('{user_node_id}')).to('new_sticker')
        """

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        if not results:
            raise HTTPException(status_code=404, detail='results is empty')

        print(results[0])
        return CreateStickerResponse()

    except HTTPException as e :
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()

@router.post("/sticker/get-content",response_model = List[GetStickersResponse])
async def get_contents(
    request: Request,
    client=Depends(create_gremlin_client),
    get_sticker_request: GetStickersRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)['user_node_id']

    try:
        query = f"""
        g.V('{get_sticker_request.user_node_id}').outE('block').where(inV().hasId('{user_node_id}')).fold()
        .coalesce(
            unfold().constant("empty stickers"),
            V('{get_sticker_request.user_node_id}').outE('is_sticker').inV().valueMap(true)
        )
        """

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        print(results)
        if not (results) or results==["empty stickers"]:
            return []

        response = [GetStickersResponse.from_data(result) for result in results]
        return response

    except HTTPException as e :
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()

@router.post("/sticker/get-my-content",response_model = List[GetMyStickersResponse])
async def get_my_contents(
    request: Request,
    client=Depends(create_gremlin_client)
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)['user_node_id']

    try:
        query = f"""
        g.V('{user_node_id}').outE('is_sticker').inV().valueMap(true)
        """

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        print(results)

        response = [GetMyStickersResponse.from_data(result) for result in results]
        return response

    except HTTPException as e :
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()

@router.delete("/sticker/delete")
async def delete_sticker(
    request: Request,
    client=Depends(create_gremlin_client),
    delete_sticker_request: DeleteStickerRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)['user_node_id']

    try:
        query = f"""
        g.V('{user_node_id}').outE('is_sticker').inV().hasId('{delete_sticker_request.sticker_node_id}').fold()
        .coalesce(
            unfold().constant('not exist'),
            V('{delete_sticker_request.sticker_node_id}').drop()
        )
        """

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        print(results)

        if results== ['not exist']:
            return DeleteStickerResponse(message='not exist')
        else :
            return DeleteStickerResponse(message=f"'{delete_sticker_request.sticker_node_id}' dropped")

    except HTTPException as e :
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()

async def delete_old_stickers():
    current_time = datetime.now(timezone.utc)
    delete_before = current_time - timedelta(hours=24)
    delete_before_timestamp = delete_before.isoformat()

    client = create_gremlin_client()

    try:
        print("delete_before_timestamp : ",delete_before_timestamp)
        query = f"""
        g.V().hasLabel('sticker').has('created_at', lte('{delete_before_timestamp}')).drop()
        """

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        logger.info(f"delete_old_stickers : '{results}'")

    except Exception as e:
        raise e
    finally:
        client.close()

@router.post("/post/create",response_model = CreatePostResponse)
async def create_post(
    request: Request,
    client=Depends(create_gremlin_client),
    create_post_request: CreatePostRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)['user_node_id']

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

        future_result_set = client.submitAsync(query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        print(results)
        if not results:
            raise HTTPException(status_code=404, detail='results is empty')

        return CreatePostResponse

    except HTTPException as e :
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()