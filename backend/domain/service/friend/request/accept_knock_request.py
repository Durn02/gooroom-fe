from pydantic import BaseModel

class AcceptKnockRequest(BaseModel):
    knock_id:str
    
