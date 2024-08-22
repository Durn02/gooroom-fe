from pydantic import BaseModel,Field
from typing import List

class CreatePostRequest(BaseModel):
    content:str = Field(..., min_length=1)
    image_url:List[str]
    is_public:bool = True
    title:str = Field(..., min_length=1)
    tag:List[str] = Field(..., min_items=1) 
