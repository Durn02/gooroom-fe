from pydantic import BaseModel,Field
from typing import List

class ModifyMyPostRequest(BaseModel):
    post_node_id:str = Field(..., min_length=1)
    new_content:str
    new_image_url:str
    new_is_public:bool
    new_title:str
    new_tag:List[str]
