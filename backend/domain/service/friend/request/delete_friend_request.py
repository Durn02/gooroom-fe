from pydantic import BaseModel

class DeleteFriendRequest(BaseModel):
    user_node_id:str
    
