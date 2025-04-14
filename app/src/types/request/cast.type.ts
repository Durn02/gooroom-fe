interface Reply {
  content: string;
  created_at: string;
  type: string;
  node_id: string;
}

interface Replier {
  nickname: string;
  node_id: string;
}

export interface GetCastRepliesRequest {
  cast_node_id: string;
}

export interface GetCastRepliesResponse {
  reply: Reply;
  replier: Replier;
}
