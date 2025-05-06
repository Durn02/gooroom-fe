import { User } from '../landingPage.type';

interface Cast {
  message: string;
  duration: number;
  createdAt: string;
  nodeId: string;
  creator: string;
}

export interface GetContentsResponse {
  casts: Cast[];
  stickeredRoommates: string[];
  stickeredNeighbors: string[];
}

interface NewRoommate {
  newRoommate: User;
  neighbors: User[];
}

export interface GetNewContentsResponse {
  newRoommates: NewRoommate[];
  castsReceived: Cast[];
  stickersFrom: string[];
}
