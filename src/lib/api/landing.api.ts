'use client';

import { DEFAULT_CONTENTS, DEFAULT_NEW_CONTENTS } from '@/src/constants/landing/default';
import apiClient from '@/src/lib/api/axiosApiClient';
import { User, RoommateWithNeighbors } from '@/src/types/landingPage.type';
import { GetContentsResponse, GetNewContentsResponse } from '@/src/types/response/landing.type';

export const fetchFriends = async (): Promise<{
  loggedInUser: User | undefined;
  neighborsData: User[];
  roommatesWithNeighbors: RoommateWithNeighbors[];
}> => {
  try {
    const { data } = await apiClient.get('/domain/friend/get-members');

    if (data.length > 0) {
      const friendsData = data[0];
      console.log('data:', friendsData);
      return {
        loggedInUser: friendsData.me,
        neighborsData: friendsData.pure_neighbors,
        roommatesWithNeighbors: friendsData.roommatesWithNeighbors,
      };
    }

    return {
      loggedInUser: undefined,
      neighborsData: [],
      roommatesWithNeighbors: [],
    };
  } catch (error) {
    console.error('Failed to fetch friends:', error);
    throw error;
  }
};
export const fetchContents = async (): Promise<GetContentsResponse> => {
  try {
    const { data } = await apiClient.get('/domain/content/get-contents');
    console.debug('Fetched contents:', data);

    return data ?? DEFAULT_CONTENTS;
  } catch (error) {
    console.error('Failed to fetch contents:', error);
    throw error;
  }
};

export const fetchNewContents = async (): Promise<GetNewContentsResponse> => {
  try {
    const { data } = await apiClient.get('/domain/content/get-new-contents');
    console.debug('Fetched new contents:', data);

    return data ?? DEFAULT_NEW_CONTENTS;
  } catch (error) {
    console.error('Failed to fetch newContents:', error);
    throw error;
  }
};
