'use client';

import { DEFAULT_CONTENTS, DEFAULT_NEW_CONTENTS } from '@/src/constants/landing/default';
import apiClient from '@/src/lib/api/axiosApiClient';
import { DomainContentData, toDomainContents } from '@/src/types/DomainObject/cast.type';
import { User, RoommateWithNeighbors } from '@/src/types/DomainObject/landingPage.type';
import { GetContentsResponse, GetNewContentsResponse } from '@/src/types/response/landing.type';

export const fetchFriends = async (): Promise<{
  loggedInUser: User | undefined;
  neighborsData: User[];
  roommatesWithNeighbors: RoommateWithNeighbors[];
}> => {
  try {
    const response = await apiClient.get('/domain/friend/get-members');
    console.log('response in fetchFriends : ', response);
    if (response?.data?.length > 0) {
      const friendsData = response.data[0];
      return {
        loggedInUser: friendsData.me,
        neighborsData: friendsData.pureNeighbors,
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

export const fetchContents = async (): Promise<DomainContentData> => {
  try {
    const response = await apiClient.get('/domain/content/get-contents');
    const data: GetContentsResponse = response?.data ?? DEFAULT_CONTENTS;
    return toDomainContents(data);
  } catch (error) {
    console.error('Failed to fetch contents:', error);
    throw error;
  }
};

export const fetchNewContents = async (): Promise<GetNewContentsResponse> => {
  try {
    const response = await apiClient.get('/domain/content/get-new-contents');

    return response?.data ?? DEFAULT_NEW_CONTENTS;
  } catch (error) {
    console.error('Failed to fetch newContents:', error);
    throw error;
  }
};
