# from fastapi import FastAPI
# import paramiko
# from gremlin_python.driver import client, serializer
# from starlette.requests import Request
# from sshtunnel import SSHTunnelForwarder

# app = FastAPI()
# ssh_client = None
# gremlin_client = None


# class NeptuneConnection:
#     def __init__(
#         self,
#         ssh_host,
#         ssh_port,
#         ssh_user,
#         ssh_key,
#         neptune_endpoint,
#         neptune_port,
#         local_port,
#     ):
#         self.ssh_host = ssh_host
#         self.ssh_port = ssh_port
#         self.ssh_user = ssh_user
#         self.ssh_key = ssh_key
#         self.neptune_endpoint = neptune_endpoint
#         self.neptune_port = neptune_port
#         self.local_port = local_port
#         self.ssh_client = None
#         self.tunnel = None

#     def start_ssh_tunnel(self):
#         self.ssh_client = paramiko.SSHClient()
#         self.ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
#         self.ssh_client.connect(
#             self.ssh_host,
#             port=self.ssh_port,
#             username=self.ssh_user,
#             key_filename=self.ssh_key,
#         )
#         self.tunnel = self.ssh_client.get_transport().open_channel(
#             "direct-tcpip",
#             (self.neptune_endpoint, self.neptune_port),
#             ("localhost", self.local_port),
#         )

#     def close_ssh_tunnel(self):
#         if self.tunnel:
#             self.tunnel.close()
#         if self.ssh_client:
#             self.ssh_client.close()

#     def get_gremlin_client(self):
#         return client.Client(
#             f"soohwan-cluster.cluster-c5was46486j3.ap-northeast-2.neptune.amazonaws.com",
#             "g",
#             message_serializer=serializer.GraphSONSerializersV2d0(),
#         )
