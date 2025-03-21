import { GetContentsResponse, GetNewContentsResponse } from '../../types/response/landing.type';

export const DEFAULT_CONTENTS: GetContentsResponse = {
  casts: [],
  stickered_roommates: [],
  stickered_neighbors: [],
};

export const DEFAULT_NEW_CONTENTS: GetNewContentsResponse = {
  new_roommates: [],
  casts_received: [],
  stickers_from: [],
};
