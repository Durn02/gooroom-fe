import axios from 'axios';
import { API_URL } from '../config';
import { logout } from '../sign';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      const errorMessage = error.response.data.detail;
      console.log('401 Unauthorized:', errorMessage);

      if (errorMessage === 'token has expired' && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          await axios.post(`${API_URL}/auth/verify-refresh-token`, {}, { withCredentials: true });

          return apiClient(originalRequest);
        } catch (refreshError) {
          console.log('Failed to refresh access token:', refreshError);
          logout();
        }
      }

      if (errorMessage === 'invalid token' || errorMessage === 'Access token is missing') {
        console.log('Invalid or missing token, redirecting to login...');
        logout();
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
