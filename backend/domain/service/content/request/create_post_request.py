from pydantic import BaseModel,Field
from typing import List

class CreatePostRequest(BaseModel):
    content:str = Field(..., min_length=1)
    image_url:str
    is_public:bool
    title:str = Field(..., min_length=1)
    tag:List[str]
