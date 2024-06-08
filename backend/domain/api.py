# app/domain/api.py
from fastapi import APIRouter
from domain.auth import auth_example as auth
from domain.user import user_example as user

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(user.router, prefix="/user", tags=["user"])
