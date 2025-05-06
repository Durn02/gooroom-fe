export interface UserInfo {
  myMemo: string;
  nickname: string;
  username: string;
  nodeId: string;
  tags: string[];
  removeProfileImage: boolean;
  profileImageUrl: File;
}

export interface FriendInfo {
  myMemo: string;
  nickname: string;
  username: string;
  nodeId: string;
  tags: string[];
  profileImageUrl: string;
  group: string;
}

export interface Sticker {
  stickerNodeId: string;
  content: string;
  imageUrl: string[];
  createdAt: string;
}

export interface Post {
  postNodeId: string;
  content: string;
  imageUrl: string[];
  createdAt: string;
  tags: string[];
  title: string;
}
