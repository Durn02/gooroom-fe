# domain/service/__init__.py
from .friend import block_router, mute_router
from .content import content_router

__all__ = ["block_router", "mute_router", "content_router"]
