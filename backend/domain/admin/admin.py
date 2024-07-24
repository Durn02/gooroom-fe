# backend/domain/admin/admin.py
from fastapi import APIRouter, HTTPException, Depends, Request, Response
from config.connection import create_gremlin_client
from gremlin_python.driver.client import Client
from gremlin_python.process.traversal import T
from utils import (
    hash_password,
    verify_password,
    create_access_token,
    verify_access_token,
    Logger,
)
logger = Logger(__file__)

router = APIRouter()

access_token = "access_token"


@router.post("/admin/user/delete")
async def delete_user(
    response: Response,
    request: Request,
    client=Depends(create_gremlin_client),
):
    logger.info("admin delete user")
    try:
        token = request.cookies.get("access_token")
        print("token :", token)
        if not access_token:
            raise HTTPException(status_code=401, detail="Access token missing")

        token_payload = verify_access_token(token)
        uuid = token_payload.get("uuid")
        print(uuid)

        if not uuid:
            raise HTTPException(status_code=400, detail="Invalid input")

        delete_user_query = f"""
            g.V('{uuid}').fold().coalesce(
                unfold().as('p').out('is_info').hasLabel('User').as('u')
                .sideEffect(select('u').unfold().drop()).sideEffect(select('p').unfold().drop())
                .constant('User deleted successfully'), constant('User not found')
            )
        """

        future_result_set = client.submitAsync(delete_user_query).result().all()
        results = await asyncio.wrap_future(future_result_set)
        print(results)
        if results[0] == "User not found":
            raise HTTPException(status_code=404, detail="User not found")
        if results[0] == "User deleted successfully":
            response.delete_cookie(key="access_token")
            return SignOutResponse()
        else:
            raise HTTPException(status_code=500, detail="Failed to sign out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))