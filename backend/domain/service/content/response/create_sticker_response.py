from pydantic import BaseModel

class CreateStickerResponse(BaseModel):
    message:str = "sticker created successfully"
    
