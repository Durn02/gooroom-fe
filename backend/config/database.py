from gremlin_python.structure.graph import Graph
from gremlin_python.driver.driver_remote_connection import DriverRemoteConnection

# Global variables to hold the graph traversal source and connection
g = None
connection = None


def get_graph_traversal():
    return g


def connect_to_db():
    global g, connection
    connection = DriverRemoteConnection(
        "wss://soohwan-cluster.cluster-c5was46486j3.ap-northeast-2.neptune.amazonaws.com:8182/gremlin",
        "g",
    )
    graph = Graph()
    g = graph.traversal().withRemote(connection)
    print(g.V().limit(2).toList())


def close_db_connection():
    global connection
    if connection is not None:
        connection.close()
