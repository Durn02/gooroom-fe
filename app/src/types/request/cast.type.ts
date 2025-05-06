interface Reply {
  content: string;
  createdAt: string;
  type: string;
  nodeId: string;
}

interface Replier {
  nickname: string;
  nodeId: string;
}

export interface GetCastRepliesRequest {
  castNodeId: string;
}

export interface GetCastRepliesResponse {
  reply: Reply;
  replier: Replier;
}
