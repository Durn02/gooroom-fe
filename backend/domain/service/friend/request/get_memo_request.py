from pydantic import BaseModel

class GetMemoRequest(BaseModel):
    user_node_id:str
    
