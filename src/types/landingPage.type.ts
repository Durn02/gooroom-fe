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

export interface Cast {
  message: string;
  duration: number;
  created_at: string;
  node_id: string;
  creator: string;
}
