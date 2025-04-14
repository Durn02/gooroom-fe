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
    const response = await apiClient.post('/domain/friend/knock/accept', {
      knock_id: knockId,
    });

    return {
      newRoommate: response.data?.new_roommate,
      newNeighbors: response.data?.new_neighbors,
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
    return response.data;
  } catch (error) {
    console.error('Failed to send knock:', error);
    throw error;
  }
};

export const createKnockLink = async () => {
  try {
    const response = await apiClient.post('/domain/friend/knock/create-link');
    return response.data;
  } catch (error) {
    console.error('Failed to create knock link:', error);
    throw error;
  }
};

export const acceptKnockLink = async (linkId: string) => {
  try {
    const response = await apiClient.post(`/domain/friend/knock/accept-by-link/${linkId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to accept knock link:', error);
    throw error;
  }
};
