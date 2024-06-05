# app/api/v1/endpoints/domain1/subdomain.py

from fastapi import APIRouter

router = APIRouter()


@router.get("/items/")
async def read_items():
    return [{"item_id": "foo"}, {"item_id": "bar"}]
