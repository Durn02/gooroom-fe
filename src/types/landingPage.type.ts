export interface User {
  my_memo: string;
  nickname: string;
  node_id: string;
  concern: string[];
  username: string;
}

export interface RoommateWithNeighbors {
  roommate: User;
  neighbors: User[];
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
  concern: string[];
}

export interface GetCastsResponse {
  cast_node: CastNode;
  creator: Creator;
}
