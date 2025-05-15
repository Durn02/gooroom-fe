import { GetContentsResponse } from '../response/landing.type';

export type CastsByUser = {
  [userId: string]: {
    content: {
      message: string;
      duration: number;
      createdAt: string;
    }[];
  };
};

export interface DomainContentData {
  castData: CastsByUser;
  stickeredRoommates: string[];
  stickeredNeighbors: string[];
}

export const toDomainContents = (response: GetContentsResponse): DomainContentData => {
  const castData: CastsByUser = {};

  response.casts.forEach((cast) => {
    const { creator, message, duration, createdAt } = cast;

    if (!castData[creator]) {
      castData[creator] = { content: [] };
    }

    castData[creator].content.push({ message, duration, createdAt });
  });

  return {
    castData,
    stickeredRoommates: response.stickeredRoommates,
    stickeredNeighbors: response.stickeredNeighbors,
  };
};
