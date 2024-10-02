export interface RoomMateEdge {
  memo: string;
  edge_id: string;
  group: string;
}

export interface User {
  my_memo: string;
  nickname: string;
  node_id: string;
  tags: string[];
  username: string;
  groups: string;
}

export interface RoomMateData {
  roommate: User;
  is_roommate_edge: RoomMateEdge;
}
export interface RoommateWithNeighbors {
  roommate: string;
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

export interface Group {
  group_name: string;
  group_color: string;
}