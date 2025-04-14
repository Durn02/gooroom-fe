import { User } from '../landingPage.type';
import { Cast } from '../cast.type';

export interface GetContentsResponse {
  casts: Cast[];
  stickered_roommates: string[];
  stickered_neighbors: string[];
}

interface NewRoommate {
  new_roommate: User;
  neighbors: User[];
}

export interface GetNewContentsResponse {
  new_roommates: NewRoommate[];
  casts_received: Cast[];
  stickers_from: string[];
}
