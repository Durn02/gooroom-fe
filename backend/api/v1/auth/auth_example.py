# app/api/v1/endpoints/domain2/subdomain.py

from fastapi import APIRouter

router = APIRouter()


@router.get("/users/")
async def read_users():
    return [{"user_id": "alice"}, {"user_id": "bob"}]
