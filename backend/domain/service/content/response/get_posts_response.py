from pydantic import BaseModel
from typing import List,Dict

class GetPostsResponse(BaseModel):
    post_node_id:str
    content:str
    image_url:List[str]
    created_at:str
    tag:List[str]
    title:str

    @classmethod
    def from_data(cls, post: Dict[str,List[str]|str] ):
        return cls(
            post_node_id = post.get('node_id',''),
            content=post.get("content", ''),
            image_url=post.get("image_url", []),
            created_at=post.get("created_at",''),
            tag=post.get("tag",[]),
            title=post.get("title","")
        )