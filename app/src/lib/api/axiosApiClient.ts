import axios from 'axios';
import { API_URL } from '../config';
import { logout } from '../sign';
import { axiosResponseToCamel, toSnake } from '@/src/utils/camel-snake';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let refreshTokenPromise: Promise<void> | null = null;
let isLoggingOut = false;

apiClient.interceptors.request.use((config) => {
  if (config.data && typeof config.data === 'object') {
    config.data = toSnake(config.data);
  }

  if (config.params && typeof config.params === 'object') {
    config.params = toSnake(config.params);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (response?.data) {
      response.data = axiosResponseToCamel(response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      const errorMessage = error.response.data.detail;

      if (errorMessage === 'token has expired' && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!refreshTokenPromise) {
          refreshTokenPromise = axios
            .post(`${API_URL}/domain/auth/refresh-acc-token`, {}, { withCredentials: true })
            .then(() => {
              refreshTokenPromise = null;
            })
            .catch((refreshError) => {
              refreshTokenPromise = null;

              if (!isLoggingOut) {
                isLoggingOut = true;
                logout();
              }
              return Promise.reject(refreshError);
            });
        }

        await refreshTokenPromise;
        return apiClient(originalRequest);
      }

      if ((errorMessage === 'invalid token' || errorMessage === 'Access token is missing') && !isLoggingOut) {
        isLoggingOut = true;
        logout();
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
