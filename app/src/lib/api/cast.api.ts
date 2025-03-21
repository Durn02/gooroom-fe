'use client';

import apiClient from '../api/axiosApiClient';

interface CastProps {
  message: string;
  friends: string[];
  duration: number;
}


export const createCast = async ({message, friends, duration}: CastProps) => {
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