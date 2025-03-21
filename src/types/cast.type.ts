export type CastsByUser = {
  [userId: string]: {
    content: {
      message: string;
      duration: number;
      created_at: string;
      node_id: string;
    }[];
  };
};

export interface Cast {
  message: string;
  duration: number;
  created_at: string;
  node_id: string;
  creator: string;
}
