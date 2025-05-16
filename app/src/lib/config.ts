export const IS_DEV = process.env.NODE_ENV === 'development';
export const IS_PROD = process.env.NODE_ENV === 'production';

export const API_URL_DEV = 'http://localhost:8000';
export const API_URL_PROD = process.env.BACKEND_URL;
export const API_URL = IS_DEV ? API_URL_DEV : API_URL_PROD;
