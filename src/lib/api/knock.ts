'use client';

import { KnockEdge, User } from '@/src/types/landingPage.type';
import { API_URL } from '@/src/lib/config';

export const getKnocks = async (): Promise<{
  knocks: KnockEdge[];
}> => {
  const APIURL = API_URL;
  try {
    const response = await fetch(`${APIURL}/domain/friend/knock/get-members`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.length > 0) {
        console.log('data : ', data);
        return {
          knocks: data,
        };
      }
    }
  } catch (error) {
    alert(`Failed to acceptKnock : ${error}`);
  }
};

export const acceptKnock = async (
  knockId: string,
): Promise<{
  newRoommate: User;
  newNeighbors: User[];
}> => {
  const APIURL = API_URL;
  try {
    const response = await fetch(`${APIURL}/domain/friend/knock/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ knock_id: knockId }),
      credentials: 'include',
    });

    if (response.ok) {
      let data = await response.json();
      if (data.length > 0) {
        data = data[0];
        console.log('data : ', data);
        return {
          newRoommate: data.new_roommate,
          newNeighbors: data.new_neighbors,
        };
      }
    }
  } catch (error) {
    alert(`Failed to acceptKnock : ${error}`);
  }
};
