import { GetContentsResponse, GetNewContentsResponse } from '../../types/response/landing.type';

export const DEFAULT_CONTENTS: GetContentsResponse = {
  casts: [],
  stickeredRoommates: [],
  stickeredNeighbors: [],
};

export const DEFAULT_NEW_CONTENTS: GetNewContentsResponse = {
  newRoommates: [],
  castsReceived: [],
  stickersFrom: [],
};
