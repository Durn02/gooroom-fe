export interface RoomMateEdge {
  memo: string;
  edge_id: string;
  group: string;
}

export interface KnockEdge {
  edge_id: string;
  nickname: string;
}

export interface User {
  my_memo: string;
  nickname: string;
  node_id: string;
  tags: string[];
  username: string;
}

export interface RoommateWithNeighbors {
  roommate: User;
  roommate_edge: RoomMateEdge;
  neighbors: string[];
}

interface CastNode {
  duration: number;
  created_at: string;
  message: string;
  deleted_at: string;
  node_id: string;
}

interface Creator {
  my_memo: string;
  nickname: string;
  username: string;
  node_id: string;
  tags: string[];
}

export interface GetCastsResponse {
  cast_node: CastNode;
  creator: Creator;
}
