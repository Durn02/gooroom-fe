from pydantic import BaseModel


class RefreshAccTokenResponse(BaseModel):
    message: str = "access token refreshed successfully"
