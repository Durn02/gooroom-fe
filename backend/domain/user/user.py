# backend/domain/user/user.py
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def read_items():
    return [{"item_id": "foo"}, {"item_id": "bar"}]
