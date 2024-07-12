from pydantic import BaseModel

class RejectKnockRequest(BaseModel):
    knock_id:str
    
