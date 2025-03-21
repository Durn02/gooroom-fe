'use client';

import apiClient from '../api/axiosApiClient';
import { GetCastRepliesRequest, GetCastRepliesResponse } from '@/src/types/request/cast.type';

interface CastProps {
  message: string;
  friends: string[];
  duration: number;
}

export const createCast = async ({ message, friends, duration }: CastProps) => {
  try {
    const response = await apiClient.post('/domain/content/cast/create', {
      friends: friends,
      message: message,
      duration: duration,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create cast:', error);
    throw error;
  }
};

export const getCastReplies = async (getCastRepliesRequest: GetCastRepliesRequest) => {
  try {
    const response: GetCastRepliesResponse[] = await apiClient.post(
      '/domain/content/cast/reply/get-members',
      getCastRepliesRequest,
    );
    return response;
  } catch (error) {
    console.error('Failed to get cast replies:', error);
    throw error;
  }
};
