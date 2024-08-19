from pydantic import BaseModel


class VerifyAccessTokenResponse(BaseModel):
    message: str = "access token validation check successfull"
