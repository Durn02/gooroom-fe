# domain/api.py

from fastapi import APIRouter

from domain import (
    admin_router as admin,
    auth_router as auth,
    block_router as block,
    mute_router as mute,
    content_router as content,
    user_router as user,
    friend_router as friend,
    test_router as test,
)

router = APIRouter()

router.include_router(admin, prefix="/admin", tags=["admin"])
router.include_router(auth, prefix="/auth", tags=["auth"])
router.include_router(block, prefix="/block", tags=["block"])
router.include_router(mute, prefix="/mute", tags=["mute"])
router.include_router(content, prefix="/content", tags=["content"])
router.include_router(user, prefix="/user", tags=["user"])
router.include_router(friend, prefix="/friend", tags=["friend"])
router.include_router(test, prefix="/test", tags=["test"])
