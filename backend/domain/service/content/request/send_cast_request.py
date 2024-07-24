from pydantic import BaseModel
from typing import List

class SendCastRequest(BaseModel):
    friends: List[str]
    message:str
