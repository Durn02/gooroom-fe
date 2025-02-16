import { Cast, User } from '../landingPage.type';

export interface GetContentsResponse {
  casts: Cast[];
  stickered_roommates: string[];
  stickered_neighbors: string[];
}

interface NewRoommate {
  new_rooomate: User;
  neighbors: User[];
}

export interface GetNewContentsResponse {
  new_roommates: NewRoommate[];
  casts_received: Cast[];
  stickers_from: string[];
}
