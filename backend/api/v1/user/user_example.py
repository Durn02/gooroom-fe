# app/api/v1/endpoints/domain1/subdomain.py
from fastapi import APIRouter
from ....config import database


# sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath)(__file__))))
# from config import database

router = APIRouter()


@router.get("/items/")
async def read_items():
    return [{"item_id": "foo"}, {"item_id": "bar"}]

@router.get("/graph")
async def get_graph():
    graph = database.get_graph_traversal()
    return graph
