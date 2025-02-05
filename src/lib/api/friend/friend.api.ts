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
