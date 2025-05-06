import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';
import type { AxiosResponse } from 'axios';

export function axiosResponseToCamel<T>(response: AxiosResponse): AxiosResponse<T> {
  const camelData = camelcaseKeys(response.data, { deep: true });
  return {
    ...response,
    data: camelData,
  } as AxiosResponse<T>;
}

export function toSnake<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
  return snakecaseKeys(data, { deep: true });
}
