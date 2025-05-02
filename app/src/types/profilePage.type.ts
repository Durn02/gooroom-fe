export interface UserInfo {
  my_memo: string;
  nickname: string;
  username: string;
  node_id: string;
  tags: string[];
  remove_profile_image: boolean;
  profile_image_url: File;
}

export interface FriendInfo {
  my_memo: string;
  nickname: string;
  username: string;
  node_id: string;
  tags: string[];
  profile_image_url: string;
}

export interface Sticker {
  sticker_node_id: string;
  content: string;
  image_url: string[];
  created_at: string;
}

export interface Post {
  post_node_id: string;
  content: string;
  image_url: string[];
  created_at: string;
  tags: string[];
  title: string;
}
