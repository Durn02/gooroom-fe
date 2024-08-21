from pydantic import BaseModel


class MuteFriendRequest(BaseModel):
    user_node_id: str
