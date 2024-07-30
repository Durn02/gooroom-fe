from pydantic import BaseModel

class DeleteMyPostRequest(BaseModel):
    post_node_id:str