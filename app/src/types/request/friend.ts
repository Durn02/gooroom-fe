export interface GetUserRequest {
  userNodeId: string;
}

export interface BlockRequest {
  userNodeId: string;
}

export interface UnblockRequest {
  blockEdgeId: string;
}

export interface MuteRequest {
  userNodeId: string;
}

export interface UnmuteRequest {
  muteEdgeId: string;
}

export interface MemoModifyRequest {
  userNodeId: string;
  newMemo: string;
}
