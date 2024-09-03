# backend/domain/admin/admin.py
import asyncio
from fastapi import HTTPException, APIRouter, Depends, Body, Request, Response
from utils import (
    verify_access_token,
    Logger,
)
from .response import DeleteUserResponse
from .request import DeleteUserRequest
from config.connection import get_session

logger = Logger(__file__)

router = APIRouter()

access_token = "access_token"


@router.post("/admin/user/delete")
async def delete_user(
    response: Response,
    request: Request,
    session=Depends(get_session),
    delete_user_request: DeleteUserRequest = Body(...),
):
    logger.info("admin delete user")

    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Access token is missing")

    admin_node_id = verify_access_token(token)["user_node_id"]

    try:
        query = f"""
        MATCH (u:User {{node_id: '{admin_node_id}'}})<-[:is_info]-(p:PrivateData {{grant: 'admin'}})
        RETURN p
        """
        result = session.run(query, admin_node_id=admin_node_id)
        record = result.single()

        if not record:
            raise HTTPException(
                status_code=403,
                detail="Access denied. User does not have admin privileges.",
            )

        delete_query = f"""
        MATCH (u:User {{node_id: '{delete_user_request.node_id}'}})
        OPTIONAL MATCH (u)<-[r:is_info]-(p:PrivateData)
        DETACH DELETE u, p
        RETURN COUNT(u) AS deleted_count
        """
        delete_result = session.run(delete_query)
        delete_record = delete_result.single()

        if delete_record["deleted_count"] == 0:
            raise HTTPException(
                status_code=400, detail="User not found or failed to delete"
            )

        return DeleteUserResponse()

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
