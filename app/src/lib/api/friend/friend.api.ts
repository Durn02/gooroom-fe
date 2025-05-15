import { API_URL } from '../../config';
import apiClient from '../axiosApiClient';
import {
  MemoModifyRequest,
  GetUserRequest,
  BlockRequest,
  MuteRequest,
  UnblockRequest,
  UnmuteRequest,
} from '@/src/types/request/friend';

export const fetchFriendInfo = async (payload: GetUserRequest) => {
  try {
    const { data } = await apiClient.post('/domain/friend/get-member', payload);
    return data;
  } catch (error) {
    console.error('사용자 정보를 불러오는데 실패했습니다.', error);
    window.location.href = '/';
    throw error;
  }
};

export const blockFreind = async (payload: BlockRequest) => {
  try {
    const response = await apiClient.post('/domain/block/add_member', payload);
    if (response.status === 200) {
      alert('사용자를 차단했습니다.');
      return response.data;
    }
  } catch (error) {
    console.error('사용자 차단에 실패했습니다.', error);
    throw error;
  }
};

export const unblockFriend = async (payload: UnblockRequest) => {
  try {
    const response = await apiClient.delete('/domain/block/pop-members', {
      data: payload,
    });
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error('사용자 차단 해제에 실패했습니다.', error);
    throw error;
  }
};

export const muteFreind = async (payload: MuteRequest) => {
  try {
    const response = await apiClient.post('/domain/mute/add_member', payload);
    if (response.status === 200) {
      if (response.data?.message === 'muted successfully') {
        alert('사용자를 음소거했습니다.');
      } else if (response.data?.message === 'already muted') {
        alert('이미 사용자를 음소거했습니다.');
      }
      return response.data;
    }
  } catch (error) {
    console.error('사용자 음소거에 실패했습니다.', error);
    throw error;
  }
};

export const unmuteFriend = async (payload: UnmuteRequest) => {
  try {
    const response = await apiClient.delete('/domain/mute/pop-members', {
      data: payload,
    });
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error('사용자 음소거 해제에 실패했습니다.', error);
    throw error;
  }
};

export const modifyMemo = async (payload: MemoModifyRequest) => {
  try {
    const { data } = await apiClient.post('/domain/friend/memo/modify', payload);
    return data;
  } catch (error) {
    console.error('메모 수정에 실패했습니다.', error);
  }
};

export const getGroupsNameAndNumber = async () => {
  try {
    const { data } = await apiClient.get(`${API_URL}/domain/friend/group/get-groups-name-and-number`);
    return data;
  } catch (error) {
    console.error('그룹 멤버 수를 불러오는데 실패했습니다.', error);
    throw error;
  }
};

export const modifyMyGroups = async (groups) => {
  try {
    const { data } = await apiClient.put(`${API_URL}/domain/user/my/groups/change`, {
      groups,
    });
    return data;
  } catch (error) {
    console.error('그룹에 사용자를 추가하는데 실패했습니다.', error);
    throw error;
  }
};
