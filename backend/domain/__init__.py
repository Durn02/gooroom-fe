# domain/__init__.py
from .admin import admin_router
from .auth import auth_router

from .service import block_router

# mute_router, content_router, friend_router
from .user import user_router
from .test import test_router
from .service import friend_router, content_router, mute_router, block_router

__all__ = [
    "admin_router",
    "auth_router",
    "block_router",
    "mute_router",
    "content_router",
    "user_router",
    "friend_router",
    "test_router",
]
