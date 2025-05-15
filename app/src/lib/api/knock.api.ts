'use client';

import apiClient from '../api/axiosApiClient';
import { KnockEdge, User } from '@/src/types/DomainObject/landingPage.type';

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
  selectedGroup: string,
): Promise<{
  newRoommate: User;
  newNeighbors: User[];
}> => {
  try {
    const response = await apiClient.post('/domain/friend/knock/accept', {
      knockId: knockId,
      group: selectedGroup,
    });

    return {
      newRoommate: response.data?.newRoommate,
      newNeighbors: response.data?.newNeighbors,
    };
  } catch (error) {
    console.error('Failed to accept knock:', error);
    throw error;
  }
};

export const rejectKnock = async (knockId: string) => {
  try {
    const response = await apiClient.post('/domain/friend/knock/reject', {
      knockId: knockId,
    });
    return response;
  } catch (error) {
    console.error('Failed to reject knock:', error);
    throw error;
  }
};

export const sendKnock = async (nodeId: string, group: string) => {
  try {
    const response = await apiClient.post('/domain/friend/knock/send', {
      toUserNodeId: nodeId,
      group: group,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to send knock:', error);
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
