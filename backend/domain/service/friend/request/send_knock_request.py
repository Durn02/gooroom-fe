from pydantic import BaseModel

class SendKnockRequest(BaseModel):
    to_user_node_id:str
    
