# domain/service/friend/__init__.py
from .block import block_router
from .mute import mute_router

__all__ = ["block_router", "mute_router"]
