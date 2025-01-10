'use client';

import { User, RoommateWithNeighbors } from '@/lib/types/landingPage.type';
import { API_URL } from '@/lib/utils/config';

export const fetchFriendsInManager = async (): Promise<{
  loggedInUser: User | undefined;
  neighborsData: User[];
  roommatesWithNeighbors: RoommateWithNeighbors[];
}> => {
  const APIURL = API_URL;
  try {
    const response = await fetch(`${APIURL}/domain/friend/get-members`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (response.ok) {
      let data = await response.json();
      if (data.length > 0) {
        data = data[0];
        console.log('data : ', data);
        return {
          loggedInUser: data.me,
          neighborsData: data.pure_neighbors,
          roommatesWithNeighbors: data.roommatesWithNeighbors,
        };
      }
    }
    // If response is not OK or data is not as expected, return empty values
    return {
      loggedInUser: undefined,
      neighborsData: [],
      roommatesWithNeighbors: [],
    };
  } catch (error) {
    alert(`Failed to fetch friends: ${error}`);
    return {
      loggedInUser: undefined,
      neighborsData: [],
      roommatesWithNeighbors: [],
    };
  }
};
