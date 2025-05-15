'use client';

import apiClient from './axiosApiClient';
import {
  SignupRequest,
  SigninRequest,
  SendVerificationCodeRequest,
  VerifyCodeRequest,
} from '@/src/types/request/auth.type';

export const signup = async (payload: SignupRequest) => {
  const { data } = await apiClient.post('/domain/auth/signup', payload);
  return data;
};

export const signin = async (payload: SigninRequest) => {
  const { data } = await apiClient.post('/domain/auth/signin', payload);
  return data;
};

export const signout = async () => {
  try {
    const { data } = await apiClient.post('/domain/auth/signout');
    return data;
  } catch (error) {
    console.error('회원탈퇴 요청 실패:', error);
    throw error;
  }
};

export const RequestLogout = async () => {
  try {
    const { data } = await apiClient.post('/domain/auth/logout');
    return data;
  } catch (error) {
    console.error('로그아웃 요청 실패:', error);
    throw error;
  }
};

export const sendVerificationCode = async (payload: SendVerificationCodeRequest) => {
  const { data } = await apiClient.post('/domain/auth/send-verification-code', payload);
  return data;
};

export const verifySMTPCode = async (payload: VerifyCodeRequest) => {
  const { data } = await apiClient.post('domain/auth/verify-code', payload);
  return data;
};

export const verifyAccessToken = async () => {
  const { data } = await apiClient.get('/domain/auth/verify-access-token');
  return data;
};
