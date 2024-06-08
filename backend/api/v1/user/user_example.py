from fastapi import APIRouter, HTTPException


router = APIRouter()


@router.get("/items/")
async def read_items():
    return [{"item_id": "foo"}, {"item_id": "bar"}]
