import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';
import type { AxiosResponse } from 'axios';

const camelToSnake = (str: string): string => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
};

export function axiosResponseToCamel<T>(response: AxiosResponse): AxiosResponse<T> {
  if (typeof response.data === 'object' && response.data !== null) {
    const camelData = camelcaseKeys(response.data as Record<string, unknown>, { deep: true });
    response.data = camelData as T;
  }
  return response;
}

export function toSnake<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
  return snakecaseKeys(data, { deep: true });
}

export const formDataWithSnakeKeys = (original: FormData): FormData => {
  const newFormData = new FormData();

  for (const [key, value] of original.entries()) {
    const snakeKey = camelToSnake(key);
    newFormData.append(snakeKey, value);
  }

  return newFormData;
};
