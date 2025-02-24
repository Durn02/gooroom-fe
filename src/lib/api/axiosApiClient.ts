import axios from 'axios';
import { API_URL } from '../config';
import { logout } from '../sign';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let refreshTokenPromise: Promise<void> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      const errorMessage = error.response.data.detail;

      if (errorMessage === 'token has expired' && !originalRequest._retry) {
        originalRequest._retry = true;

        // 현재재 진행중인 refresh 요청이 없으면 refresh 요청을 수행시킴
        if (!refreshTokenPromise) {
          refreshTokenPromise = axios
            .post(`${API_URL}/domain/auth/refresh-acc-token`, {}, { withCredentials: true })
            .then(() => {
              refreshTokenPromise = null;
            })
            .catch((refreshError) => {
              refreshTokenPromise = null;
              console.log('Failed to refresh access token:', refreshError);
              logout();
              return Promise.reject(refreshError);
            });
        }

        // 수행중인 refresh 요청이 있으면 결과를 기다림림
        await refreshTokenPromise;
        return apiClient(originalRequest);
      }

      if (errorMessage === 'invalid token' || errorMessage === 'Access token is missing') {
        logout();
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
