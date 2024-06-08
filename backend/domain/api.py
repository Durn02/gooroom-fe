# app/api/v1/api.py

from fastapi import APIRouter
from api.v1.auth import auth_example as auth
from api.v1.user import user_example as user

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(user.router, prefix="/user", tags=["user"])
