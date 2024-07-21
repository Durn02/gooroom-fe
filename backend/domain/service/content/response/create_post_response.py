from pydantic import BaseModel

class CreatePostResponse(BaseModel):
    message:str = "post created successfully"
    