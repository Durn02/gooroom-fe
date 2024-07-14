from pydantic import BaseModel

class BlockFriendResponse(BaseModel):
    message:str = "blocked succesfully"
    
