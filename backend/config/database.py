from gremlin_python import statics
from gremlin_python.structure.graph import Graph
from gremlin_python.process.graph_traversal import __
from gremlin_python.process.strategies import *
from gremlin_python.driver.driver_remote_connection import DriverRemoteConnection
import nest_asyncio
import asyncio

# Global variables to hold the graph traversal source and connection
g = None
connection = None

nest_asyncio.apply()


def get_graph_traversal():
    return g


async def connect_to_db():
    global g, connection
    loop = asyncio.get_event_loop()
    try:
        connection = await loop.run_in_executor(
            None,
            lambda: DriverRemoteConnection(
                "wss://soohwan-cluster.cluster-c5was46486j3.ap-northeast-2.neptune.amazonaws.com:8182/gremlin",
                "g",
            ),
        )
        graph = Graph()
        g = graph.traversal().withRemote(connection)
        print("Connected to Gremlin Server")
    except Exception as e:
        print(f"Error connecting to Gremlin Server: {e}")
        g = None


def close_db_connection():
    global connection
    if connection is not None:
        connection.close()
