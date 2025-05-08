import apiClient from './axiosApiClient';

export const fetchMyStickers = async () => {
  try {
    const { data } = await apiClient.get('/domain/content/sticker/get-my-contents');
    return data;
  } catch (error) {
    console.error('스티커를 불러오는데 실패했습니다.', error);
    // window.location.href = '/';
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
    // window.location.href = '/';
    throw error;
  }
};

export const createSticker = async (formData: FormData) => {
  try {
    const response = await apiClient.post('/domain/content/sticker/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('스티커 생성 실패:', error);
    throw error;
  }
};

export const deleteStickers = async (stickerNodeId: string, stickerImageUrls: string[]) => {
  try {
    const stringImageUrl = stickerImageUrls.toString();
    const { data } = await apiClient.delete('domain/content/sticker/delete', {
      data: {
        sticker_node_id: stickerNodeId,
        sticker_image_url: stringImageUrl,
      },
    });
    return data;
  } catch (error) {
    console.error('스티커 삭제 실패', error);
    throw error;
  }
};
