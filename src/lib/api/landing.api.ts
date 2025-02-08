'use client';

import apiClient from '@/src/lib/api/axiosApiClient';
import { User, RoommateWithNeighbors } from '@/src/types/landingPage.type';

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
