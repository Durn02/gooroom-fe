export interface RoomMateEdge {
  memo: string;
  edgeId: string;
  group: string;
}

export interface KnockEdge {
  edgeId: string;
  nickname: string;
}

export interface User {
  myMemo: string;
  nickname: string;
  nodeId: string;
  tags: string[];
  username: string;
  groups: string[];
}

export interface RoommateWithNeighbors {
  roommate: User;
  roommateEdge: RoomMateEdge;
  neighbors: string[];
}

interface BlockList {
  block_edge_id: string;
  user_id: string;
  user_nick_name: string;
}

interface MuteList {
  muteEdgeId: string;
  userId: string;
  userNickName: string;
}

export interface BlockMuteList {
  blockList: BlockList[];
  muteList: MuteList[];
}

export interface SearchedUser {
  nickname: string;
  username: string;
  profileImageUrl: string | null;
  nodeId: string;
  isRoommate: boolean;
  sentKnock: boolean;
}
