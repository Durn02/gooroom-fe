from fastapi import APIRouter, HTTPException
import sys
import os
import asyncio


import sys, os

sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)

from config import database

router = APIRouter()


@router.get("/items/")
async def read_items():
    return [{"item_id": "foo"}, {"item_id": "bar"}]


@router.get("/graph")
async def get_graph():
    try:
        g = database.get_graph_traversal()
        if g is None:
            raise HTTPException(
                status_code=500, detail="Database connection not established"
            )

        loop = asyncio.get_event_loop()

        vertices = await loop.run_in_executor(None, lambda: g.V().toList())
        edges = await loop.run_in_executor(None, lambda: g.E().toList())

        vertex_list = [
            {"id": v.id, "label": v.label, "properties": v.properties} for v in vertices
        ]
        edge_list = [
            {
                "id": e.id,
                "label": e.label,
                "outV": e.outV,
                "inV": e.inV,
                "properties": e.properties,
            }
            for e in edges
        ]

        return {"vertices": vertex_list, "edges": edge_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
