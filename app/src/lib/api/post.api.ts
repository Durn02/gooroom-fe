// the word 'post' means '게시글' in gooroom, not method 'POST'
import apiClient from './axiosApiClient';
import { DeleteMyPostRequest } from '@/src/types/request/post';

export const fetchPosts = async () => {
  try {
    const { data } = await apiClient.get('/domain/content/post/get-my-contents');
    return data;
  } catch (error) {
    console.error('게시글을 불러오는데 실패했습니다.', error);
    // window.location.href = '/';
    throw error;
  }
};

export const createPost = async (formData: FormData) => {
  try {
    const response = await apiClient.post('/domain/content/post/create', formData);
    return response.data;
  } catch (error) {
    console.error('게시글 생성 실패:', error);
    throw error;
  }
};

export const deletePost = async (payload: DeleteMyPostRequest) => {
  try {
    const { postNodeId, postImageUrls } = payload;

    const response = await apiClient.delete('/domain/content/post/delete-my-content', {
      data: {
        postNodeId,
        postImageUrls: postImageUrls.toString(), // string[] → comma-separated string
      },
    });

    return response.data;
  } catch (error) {
    console.error('포스트 삭제 실패', error);
    throw error;
  }
};
