# domain/service/__init__.py
# from .friend import block_router, mute_router, friend_router

# __all__ = ["block_router", "mute_router", "content_router", "friend_router"]

from .content import content_router
from .friend import friend_router, block_router, mute_router


__all__ = ["friend_router", "content_router", "block_router", "mute_router"]
