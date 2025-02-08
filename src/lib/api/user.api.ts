import apiClient from './axiosApiClient';
import { logout } from '../sign';
import axios from 'axios';

export const fetchMyInfo = async () => {
  try {
    const { data } = await apiClient.get('/domain/user/my/info');
    return data;
  } catch (error) {
    console.error('사용자 정보를 불러오는데 실패했습니다.', error);
    throw error;
  }
};

export const onSignoutButtonClickHandler = async () => {
  const isSignout = window.confirm('정말 회원탈퇴를 진행하시겠습니까?');
  if (!isSignout) return;
  alert('회원탈퇴를 진행합니다!');
  try {
    const { data } = await apiClient.post('/domain/auth/signout');
    if (data.message === 'signout success') {
      alert('회원탈퇴가 완료되었습니다.');
      logout();
    }
  } catch (error) {
    console.error('회원탈퇴 중 오류 발생:', error);
    alert('회원탈퇴 중 문제가 발생했습니다.');
  }
};

export const onLogoutButtonClickHandler = async () => {
  try {
    const { data } = await apiClient.post('/domain/auth/logout');

    if (data.message === 'logout success') {
      logout();
    }
  } catch (error) {
    console.error('로그아웃 중 오류 발생:', error);
    alert('로그아웃 중 문제가 발생했습니다.');
  }
};

// export const checkLogin = async () => {
//   try {
//     await apiClient.get('domain/auth/verify-access-token');
//     return true;
//   } catch (error) {
//     console.error('access token 검증 실패', error);
//     throw error;
//   }
// };
