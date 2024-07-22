from pydantic import BaseModel

class GetPostsRequest(BaseModel):
    user_node_id:str
