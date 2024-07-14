from pydantic import BaseModel

class BlockFriendRequest(BaseModel):
    user_node_id:str
    
