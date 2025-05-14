import { API_URL } from '../../config';
import apiClient from '../axiosApiClient';

export const fetchFriendInfo = async (userNodeId: string) => {
  try {
    const { data } = await apiClient.post('/domain/friend/get-member', {
      user_node_id: userNodeId,
    });
    return data;
  } catch (error) {
    console.error('사용자 정보를 불러오는데 실패했습니다.', error);
    window.location.href = '/';
    throw error;
  }
};

export const blockFreind = async (userNodeId: string) => {
  try {
    const response = await apiClient.post('/domain/block/add_member', {
      user_node_id: userNodeId,
    });
    if (response.status === 200) {
      alert('사용자를 차단했습니다.');
      return response.data;
    }
  } catch (error) {
    console.error('사용자 차단에 실패했습니다.', error);
    throw error;
  }
};

export const unblockFriend = async (blockEdgeId: string) => {
  try {
    const response = await apiClient.delete('/domain/block/pop-members', {
      data: { block_edge_id: blockEdgeId },
    });
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error('사용자 차단 해제에 실패했습니다.', error);
    throw error;
  }
};

export const muteFreind = async (userNodeId: string) => {
  try {
    const response = await apiClient.post('/domain/mute/add_member', {
      user_node_id: userNodeId,
    });
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

export const unmuteFriend = async (muteEdgeId: string) => {
  try {
    const response = await apiClient.delete('/domain/mute/pop-members', {
      data: { mute_edge_id: muteEdgeId },
    });
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error('사용자 음소거 해제에 실패했습니다.', error);
    throw error;
  }
};

export const getGroupsNameAndNumber = async () => {
  try {
    const { data } = await apiClient.get(`${API_URL}/domain/friend/group/get-members`);
    return data;
  } catch (error) {
    console.error('그룹 멤버 수를 불러오는데 실패했습니다.', error);
    throw error;
  }
};
