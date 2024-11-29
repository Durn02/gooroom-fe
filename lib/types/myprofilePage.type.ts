export interface UserInfo {
  my_memo: string;
  nickname: string;
  username: string;
  node_id: string;
  tags: string[];
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
  tag: string[];
  title: string;
}
