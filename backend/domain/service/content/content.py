# backend/domain/service/content/content.py
from fastapi import HTTPException, APIRouter, Depends, Body, Request
from utils import verify_access_token, Logger
from config.connection import get_session
from typing import List
from datetime import datetime, timezone
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
import uuid

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
                deleted_at : '',
                node_id : randomUUID()
            }})
        CREATE (s)-[is_sticker:is_sticker {{edge_id : randomUUID()}}]->(u)
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


@router.post("/sticker/get-contents", response_model=List[GetStickersResponse])
async def get_stickers(
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
        OPTIONAL MATCH (me)<-[b:block]->(friend)
        OPTIONAL MATCH (me)-[m:mute]->(friend)
        OPTIONAL MATCH (friend)<-[:is_sticker]-(sticker:Sticker)
        WHERE sticker.delete_at IS NULL 
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

        return [GetStickersResponse.from_data(dict(sticker)) for sticker in record['stickers']]

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.get("/sticker/get-my-contents", response_model=List[GetMyStickersResponse])
async def get_my_stickers(request: Request, session=Depends(get_session)):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        MATCH (me: User {{node_id: '{user_node_id}'}})
        OPTIONAL MATCH (me)<-[:is_sticker]-(sticker:Sticker)
        WHERE sticker.delete_at IS NULL 
        RETURN collect(sticker) AS stickers
        """

        result = session.run(query)
        record = result.single()

        if not record:
            raise HTTPException(status_code=404, detail=f"no such user {user_node_id}")

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

    datetimenow = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

    try:
        query = f"""
        OPTIONAL MATCH (me:User {{node_id: '{user_node_id}'}})
        OPTIONAL MATCH (s:Sticker {{node_id: '{delete_sticker_request.sticker_node_id}'}})
        OPTIONAL MATCH (s)-[r:is_sticker]->(me)
        WITH me, s, r
        CALL apoc.do.case(
        [
            me IS NULL, 'RETURN "User does not exist" AS message',
            s IS NULL, 'RETURN "Sticker does not exist" AS message',
            r IS NULL, 'RETURN "Relationship does not exist" AS message'
        ],
        'SET s.delete_at = "{datetimenow}"  RETURN "Sticker and relationship deleted" AS message',
        {{s: s}}
        ) YIELD value
        RETURN value.message AS message
        """

        result = session.run(query)
        record = result.single()

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
    session = get_session()
    datetimenow = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

    try:
        query = f"""
        MATCH (s:Sticker)
        WHERE datetime(s.created_at) <= datetime() - duration({{hours: 24}})
        SET s.delete_at = '{datetimenow}'
        RETURN s
        """

        result = session.run(query)
        record = result.single()
        logger.info(f"delete_old_stickers : {record}")

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
    datetimenow = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

    try:
        query = f"""
        MATCH (u:User {{node_id: '{user_node_id}'}})
        CREATE (p:Post {{
                content : '{create_post_request.content}',
                image_url : {create_post_request.image_url},
                is_public : {create_post_request.is_public},
                title : '{create_post_request.title}',
                tag : {create_post_request.tag},
                created_at : '{datetimenow}',
                node_id : randomUUID()
            }})
        CREATE (p)-[is_post:is_post {{edge_id : randomUUID()}}]->(u)
        RETURN is_post
        """

        result = session.run(query)
        record = result.single()

        if not record:
            raise HTTPException(status_code=404, detail=f"no such user {user_node_id}")

        return CreatePostResponse

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.post("/post/get-contents", response_model=List[GetPostsResponse])
async def get_posts(
    request: Request,
    session=Depends(get_session),
    get_post_request: GetPostsRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        OPTIONAL MATCH (me: User {{node_id: '{user_node_id}'}})
        OPTIONAL MATCH (friend:User {{node_id: '{get_post_request.user_node_id}'}})
        OPTIONAL MATCH (me)<-[b:block]->(friend)
        OPTIONAL MATCH (me)-[m:mute]->(friend)
        OPTIONAL MATCH (friend)<-[:is_post]-(post:Post {{is_public : true}})
        WITH friend, me, b, m, collect(post) AS posts
        RETURN 
        CASE 
            WHEN me IS NULL THEN "no such user {user_node_id}"
            WHEN friend IS NULL THEN "no such friend {get_post_request.user_node_id}"
            WHEN b IS NOT NULL THEN "is_blocked exists"
            WHEN m IS NOT NULL THEN "mute exists"
            ELSE "get posts"
        END AS message, 
        posts
        """

        result = session.run(query)
        record = result.single()

        if record['message'] != "get posts":
            raise HTTPException(status_code=404, detail=record['message'])

        return [GetPostsResponse.from_data(dict(post)) for post in record['posts']]

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.get("/post/get-my-contents", response_model=List[GetPostsResponse])
async def get_my_posts(
    request: Request,
    session=Depends(get_session),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        MATCH (me: User {{node_id: '{user_node_id}'}})
        OPTIONAL MATCH (me)<-[:is_post]-(post:Post)
        RETURN collect(post) AS posts
        """

        result = session.run(query)
        record = result.single()

        if not record:
            raise HTTPException(status_code=404, detail=f"invalid user_node_id {user_node_id}")

        return [GetPostsResponse.from_data(dict(post)) for post in record['posts']]

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.post("/post/modify-my-content", response_model=GetPostsResponse)
async def modify_my_post(
    request: Request,
    session=Depends(get_session),
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
        query = f"""
        OPTIONAL MATCH (me:User {{node_id : '{user_node_id}'}})
        OPTIONAL MATCH (p:Post {{node_id : '{post_node_id}'}})
        OPTIONAL MATCH (me)<-[is_post:is_post]-(p)
        WITH me,p,is_post

        CALL apoc.do.case(
        [
            me is NULL, 'RETURN "no such user" As result',
            p IS NULL, 'RETURN "no such post" AS result',
            is_post IS NULL, 'RETURN "the user is not owner of the post" AS result'
        ],
        'SET 
            p.content = $new_content,
            p.image_url = $new_image_url,
            p.is_public = $new_is_public,
            p.title = $new_title,
            p.tag = $new_tag
        RETURN p AS result',
        {{
            p:p,
            new_content: '{new_content}',
            new_image_url: {new_image_url}, 
            new_is_public: {new_is_public}, 
            new_title: '{new_title}', 
            new_tag: {new_tag}
        }}
        ) YIELD value
        RETURN value.result AS result
        """

        result = session.run(query)
        record = result.single()

        if type(record['result']) == str :
            raise HTTPException(status_code=404,detail=record['result'])

        return GetPostsResponse.from_data(dict(record['result']))

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.delete("/post/delete-my-content", response_model=DeleteMyPostResponse)
async def delete_my_post(
    request: Request,
    session=Depends(get_session),
    delete_my_post_request: DeleteMyPostRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        OPTIONAL MATCH (me:User {{node_id: '{user_node_id}'}})
        OPTIONAL MATCH (p:Post {{node_id: '{delete_my_post_request.post_node_id}'}})
        OPTIONAL MATCH (p)-[is_post:is_post]->(me)
        WITH me, p, is_post
        CALL apoc.do.case(
        [
            me IS NULL, 'RETURN "User does not exist" AS message',
            p IS NULL, 'RETURN "Sticker does not exist" AS message',
            is_post IS NULL, 'RETURN "Relationship does not exist" AS message'
        ],
        'DETACH DELETE p RETURN "Sticker and relationship deleted" AS message',
        {{p: p}}
        ) YIELD value
        RETURN value.message AS message
        """

        result = session.run(query)
        record = result.single()

        if record['message']!='Sticker and relationship deleted':        
            raise HTTPException(status_code=500, detail=record['message'])
        
        return DeleteStickerResponse(message=record['message'])
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@router.post("/cast/send", response_model=SendCastResponse)
async def send_cast(
    request: Request,
    session=Depends(get_session),
    send_cast_request: SendCastRequest = Body(...),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]
    datetimenow = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    cast_id = uuid.uuid4()

    try:
        query = f"""
        MATCH (me:User {{node_id: '{user_node_id}'}})
        UNWIND {send_cast_request.friends} AS friend_node_id
        MATCH (friend:User {{node_id: friend_node_id}})
        WHERE NOT (friend)-[:mute]->(me)
        CREATE (me)-[c:cast 
            {{edge_id: randomUUID(),created_at:'{datetimenow}',message:'{send_cast_request.message}', deleted_at:'',cast_id:'{cast_id}'}}]
        ->(friend)
        RETURN collect(c) AS friends
        """

        result = session.run(query)
        record = result.single()

        if not record:
            raise HTTPException(
                status_code=404, detail=f"no such user {user_node_id} or no any valid friends"
            )

        return SendCastResponse()

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


async def delete_old_casts():
    session = get_session()
    datetimenow = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

    try:
        query = f"""
        MATCH ()-[c:cast]->() 
        WHERE datetime(c.created_at) <= datetime() - duration({{hours: 1}})
        SET c.delete_at = '{datetimenow}'
        """
        result = session.run(query)
        record = result.single()

        logger.info(f"delete_old_casts : {record}")

    except Exception as e:
        raise e
    finally:
        session.close()


@router.get("/cast/get-contents", response_model=List[GetCastsResponse])
async def get_casts(
    request: Request,
    session=Depends(get_session),
):
    token = request.cookies.get(access_token)
    user_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        MATCH (me: User {{node_id: '{user_node_id}'}})
        MATCH (me)<-[c:cast]-(friend:User)
        WHERE NOT (me)-[:mute]->(friend)
        AND c.delete_at is NULL
        RETURN {{content:properties(c),from:friend}} AS cast
        """

        result = session.run(query)
        records = result.data()

        if not records:
            raise HTTPException(status_code=500, detail=f"no such user {user_node_id} or no any valid friends")

        response = [GetCastsResponse.from_data(cast['content'], cast['from']) for r in records if (cast := r['cast'])]
        return response

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()
