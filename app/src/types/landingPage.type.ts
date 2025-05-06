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
}

export interface RoommateWithNeighbors {
  roommate: User;
  roommateedge: RoomMateEdge;
  neighbors: string[];
}

interface BlockList {
  blockEdgeId: string;
  userId: string;
  userNickname: string;
}

interface MuteList {
  muteEdgeId: string;
  userId: string;
  userNickname: string;
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
