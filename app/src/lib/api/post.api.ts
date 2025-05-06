// the word 'post' means '게시글' in gooroom, not method 'POST'
import apiClient from './axiosApiClient';

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

export const deletePost = async (postNodeId: string, postImageUrls: string[]) => {
  try {
    const stringImageUrl = postImageUrls.toString();
    const {data} = await apiClient.delete('/domain/content/post/delete-my-content',{
        data: {
          post_node_id: postNodeId,
          post_image_urls: stringImageUrl
        },}
    )
  }
}