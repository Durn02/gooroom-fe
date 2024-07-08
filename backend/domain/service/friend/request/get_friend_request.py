from pydantic import BaseModel

class GetFriendRequest(BaseModel):
    user_node_id:str
    
