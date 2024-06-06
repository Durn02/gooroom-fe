from fastapi import HTTPException, APIRouter, Depends
import sys, os

sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)

from config.connection import create_gremlin_client, get_persons

router = APIRouter()


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
