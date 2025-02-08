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

export const muteFreind = async (userNodeId: string) => {
  try {
    const response = await apiClient.post('/domain/mute/add_member', {
      user_node_id: userNodeId,
    });
    if (response.status === 200) {
      alert('사용자를 음소거했습니다.');
      return response.data;
    }
  } catch (error) {
    console.error('사용자 음소거에 실패했습니다.', error);
    throw error;
  }
};
