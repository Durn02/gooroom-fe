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

interface BlockList {
  block_edge_id: string;
  user_id: string;
  user_nickname: string;
}

interface MuteList {
  mute_edge_id: string;
  user_id: string;
  user_nickname: string;
}

export interface BlockMuteList {
  blockList: BlockList[];
  muteList: MuteList[];
}
