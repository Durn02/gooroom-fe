# backend/domain/service/content/content.py
import asyncio
from fastapi import HTTPException, APIRouter, Depends, Body, Request
from utils import verify_access_token
from config.connection import create_gremlin_client
from gremlin_python.process.traversal import T
from typing import List
from .request import CreateStickerRequest,GetStickersRequest
from .response import CreateStickerResponse,GetStickersResponse


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
        g.addV('sticker').property('content','{create_sticker_request.content}').property('image_url','{create_sticker_request.image_url}').as('new_sticker')
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
