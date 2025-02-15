'use client';

import apiClient from '../api/axiosApiClient';
import { KnockEdge, User } from '@/src/types/landingPage.type';

export const getKnocks = async (): Promise<{
  knocks: KnockEdge[];
}> => {
  try {
    const { data } = await apiClient.post('/domain/friend/knock/get-members');
    return data;
  } catch (error) {
    console.error('Failed to fetch knocks:', error);
    throw error;
  }
};

export const acceptKnock = async (
  knockId: string,
): Promise<{
  newRoommate: User;
  newNeighbors: User[];
}> => {
  try {
    const { data } = await apiClient.post('/domain/friend/knock/accept', {
      knock_id: knockId,
    });

    if (data.length > 0) {
      const knockData = data[0];
      console.log('data:', knockData);
      return {
        newRoommate: knockData.new_roommate,
        newNeighbors: knockData.new_neighbors,
      };
    }

    return {
      newRoommate: {} as User,
      newNeighbors: [],
    };
  } catch (error) {
    console.error('Failed to accept knock:', error);
    throw error;
  }
};

export const rejectKnock = async (knockId: string) => {
  try {
    const response = await apiClient.post('/domain/friend/knock/reject', {
      knock_id: knockId,
    });
    return response;
  } catch (error) {
    console.error('Failed to reject knock:', error);
    throw error;
  }
};

export const sendKnock = async (nodeId: string) => {
  try {
    const response = await apiClient.post('/domain/friend/knock/send', {
      to_user_node_id: nodeId,
    });
    return response;
  } catch (error) {
    console.error('Failed to send knock:', error);
    throw error;
  }
};
