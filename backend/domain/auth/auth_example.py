from fastapi import HTTPException, APIRouter, Depends
import sys, os
from utils.jwt_utils import create_access_token, verify_access_token

sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)

from config.connection import create_gremlin_client, get_persons

router = APIRouter()

@router.get("/signup", signUpResponse=SingUpResponse)
async def signup(clinet=Depends(create_gremlin_client), signUpRequest=SignUpRequest):
    
    # email, 비밀번호 형식 등 검증해야함d
    # 
    # 
    jwt_access_token = jwt_utils.create_access_token(signUpInfo=signUpRequest)
    
    try:
        query = ""
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        clinet.close()

@router.get("/nodes")
async def get_nodes(client=Depends(create_gremlin_client)):
    try:
        query = "g.V()"
        result = client.submit(query).all().result()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()
