import apiClient from './axiosApiClient';
import { BlockMuteList } from '@/src/types/DomainObject/landingPage.type';
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

export const getBlockMuteList = async (): Promise<{
  blockMuteList: BlockMuteList;
}> => {
  try {
    const blockListResponse = await apiClient.post('/domain/block/get-members');
    const muteListResponse = await apiClient.post('/domain/mute/get-members');
    const data = {
      blockMuteList: {
        blockList: blockListResponse.data || [],
        muteList: muteListResponse.data || [],
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

export const updateMyInfo = async (formData: FormData) => {
  try {
    const response = await apiClient.put('/domain/user/my/info/change', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('프로필 저장 실패:', error);
    throw error;
  }
};
