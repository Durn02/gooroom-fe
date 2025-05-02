import { GetContentsResponse } from "./response/landing.type";

export type CastsByUser = {
  [userId: string]: {
    content: {
      message: string;
      duration: number;
      createdAt: string;
      nodeId: string;
    }[];
  };
};

export interface DomainContentData {
  castData: CastsByUser;
  stickeredRoommates: string[];
  stickeredNeighbors: string[];
}

export const mapGetContentsResponseToDomain = (
  response: GetContentsResponse
): DomainContentData => {
  const castData: CastsByUser = {};

  response.casts.forEach((cast) => {
    const { creator, message, duration, created_at, node_id } = cast;

    if (!castData[creator]) {
      castData[creator] = { content: [] };
    }

    castData[creator].content.push({ message, duration, createdAt, nodeId });
  });

  return {
    castData,
    stickeredRoommates: response.stickered_roommates,
    stickeredNeighbors: response.stickered_neighbors,
  };
};