# app/domain/api.py

from fastapi import APIRouter

# from domain.auth import auth_example as auth
# from domain.user import user_example as user
from .admin import admin_router as admin
from .auth import auth_router as auth
from .service import (
    block_router as block,
    mute_router as mute,
)
from .user import user_router as user

router = APIRouter()

router.include_router(admin, prefix="/admin", tags=["admin"])
router.include_router(auth, prefix="/auth", tags=["auth"])
router.include_router(block, prefix="/block", tags=["block"])
router.include_router(mute, prefix="/mute", tags=["mute"])
router.include_router(user, prefix="/user", tags=["user"])
