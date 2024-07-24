from pydantic import BaseModel
from typing import List,Dict
from gremlin_python.process.traversal import T

class GetPostsResponse(BaseModel):
    post_node_id:str
    content:List[str]
    image_url:List[str]
    created_at:str
    tag:List[str]
    title:str

    @classmethod
    def from_data(cls, post: Dict[str|T,List[str]|str] ):
        return cls(
            post_node_id = post.get(T.id,''),
            content=post.get("content", []),
            image_url=post.get("image_url", []),
            created_at=post.get("created_at")[0] if post.get("created_at",[]) else "",
            tag=post.get("tag",[]),
            title=post.get("title","")[0] if post.get("title","") else ""
        )