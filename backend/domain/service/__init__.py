# domain/service/__init__.py
# from .friend import block_router, mute_router, friend_router
<<<<<<< HEAD
from .content import content_router
from .friend import friend_router

__all__ = ["friend_router","content_router"]
# __all__ = ["block_router", "mute_router", "content_router", "friend_router"]
=======
# from .content import content_router
from .friend import friend_router, block_router


__all__ = ["friend_router", "block_router"]
# __all__ = ["", "mute_router", "content_router", "friend_router"]
>>>>>>> 94fb9da0eaeb4497882e49463636048ca6228ab2
