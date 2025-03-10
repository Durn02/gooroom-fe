import apiClient from './axiosApiClient';
import { logout } from '../sign';
import { BlockMuteList } from '@/src/types/landingPage.type';
import axios from 'axios';
import { API_URL } from '../config';

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

export const getBlockMuteList = async (): Promise<{
  blockMuteList: BlockMuteList;
}> => {
  try {
    const block_list_response = await apiClient.post('/domain/block/get-members');
    const mute_list_response = await apiClient.post('/domain/mute/get-members');
    const data = {
      blockMuteList: {
        blockList: block_list_response.data || [],
        muteList: mute_list_response.data || [],
      },
    };
    return data;
  } catch (error) {
    console.error('차단/음소거 목록을 불러오는데 실패했습니다.', error);
    throw error;
  }
};

export const checkLogin = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_URL}/domain/auth/verify-access-token`, {
      withCredentials: true,
    });
    if (response.status === 200) {
      return true;
    }
    return false;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.log('로그인이 필요합니다');
    return false;
  }
};
