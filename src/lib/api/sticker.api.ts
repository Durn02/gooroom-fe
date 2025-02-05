import apiClient from './axiosApiClient';

export const fetchMyStickers = async () => {
  try {
    const { data } = await apiClient.get('/domain/content/sticker/get-my-contents');
    return data;
  } catch (error) {
    console.error('스티커를 불러오는데 실패했습니다.', error);
    window.location.href = '/';
    throw error;
  }
};

export const fetchStickers = async (userNodeId: string) => {
  try {
    const { data } = await apiClient.post('/domain/content/sticker/get-members', {
      user_node_id: userNodeId,
    });
    return data;
  } catch (error) {
    console.error('스티커를 불러오는데 실패했습니다.', error);
    window.location.href = '/';
    throw error;
  }
};
