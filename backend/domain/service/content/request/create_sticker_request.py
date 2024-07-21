from pydantic import BaseModel,Field

class CreateStickerRequest(BaseModel):
    content:str = Field(..., min_length=1)
    image_url:str
    
