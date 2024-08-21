# domain/service/friend/__init__.py
from .block import block_router
from .mute import mute_router
from .friend import router as friend_router

__all__ = ["friend_router", "block_router", "mute_router"]
# __all__ = ["block_router", "mute_router", "friend_router"]
