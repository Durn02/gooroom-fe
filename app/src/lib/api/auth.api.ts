'use client';

import apiClient from './axiosApiClient';
import { SignupRequestData,SendVerificationCodeRequestData } from '@/src/types/request/auth.type';

export const signup = async (payload: SignupRequestData) => {
  const { data } = await apiClient.post('/domain/auth/signup', payload);
  return data;
};

export const sendVerificationCode = async (payload: SendVerificationCodeRequestData) => {
  const { data } = await apiClient.post('/domain/auth/send-verification-code', payload);
  return data;
};

export const verifyAccessToken = async () => {
  const { data } = await apiClient.get('/domain/auth/verify-access-token');
  return data;
};
