# backend/domain/auth/auth.py
import os
import sys
from fastapi import HTTPException, APIRouter, Depends
from config.connection import create_gremlin_client
from utils.logger import Logger

logger = Logger("domain.auth").get_logger()

sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)

router = APIRouter()


# 노드 정보 조회(테스트용)
@router.get("/")
async def get_nodes(client=Depends(create_gremlin_client)):
    logger.info("노드 정보 조회")
    try:
        query = "g.V()"
        result = client.submit(query).all().result()
        logger.info("/nodes 200 ok")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        client.close()
