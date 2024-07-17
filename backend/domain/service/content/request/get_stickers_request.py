from pydantic import BaseModel

class GetStickersRequest(BaseModel):
    user_node_id:str
    
