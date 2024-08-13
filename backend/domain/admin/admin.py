# backend/domain/admin/admin.py
import asyncio
from fastapi import HTTPException, APIRouter, Depends, Body, Request, Response
from utils import (
    verify_access_token,
    Logger,
)
from .response import DeleteUserResponse
from .request import DeleteUserRequest

logger = Logger(__file__)

router = APIRouter()

access_token = "access_token"


@router.post("/admin/user/delete")
async def delete_user(
    response: Response,
    request: Request,
    client=Depends(create_gremlin_client),
    delete_user_request: DeleteUserRequest = Body(...),
):
    logger.info("admin delete user")
    try:
        token = request.cookies.get(access_token)
        print("token :", token)
        if not access_token:
            raise HTTPException(status_code=401, detail="Access token missing")

        token_payload = verify_access_token(token)
        user_node_id = token_payload.get("user_node_id")

        if not user_node_id:
            raise HTTPException(status_code=400, detail="Invalid input")

        deleted_user_node_id = delete_user_request.deletedUserNodeId
        delete_user_query = f"""
        g.V('{user_node_id}').has('grant', 'admin').fold().coalesce(
            unfold().V('{deleted_user_node_id}').has('grant', 'member').fold().coalesce(
                unfold().as('p').inE('is_info').outV().as('u')
                .sideEffect(select('u').drop())
                .sideEffect(select('p').drop())
                .constant('User deleted successfully'),
                constant('User not found')
            ),
            constant('Cannot delete this user')
        )
        """

        future_result_set = client.submitAsync(delete_user_query).result().all()
        results = await asyncio.wrap_future(future_result_set)

        if not results:
            raise HTTPException(status_code=404, detail="Not verified")
        if results[0] == "User deleted successfully":
            response.delete_cookie(key=access_token)
            return DeleteUserResponse()
        else:
            raise HTTPException(status_code=500, detail="{results[0]}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
