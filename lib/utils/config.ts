import { S3Client } from '@aws-sdk/client-s3';

export const IS_DEV = process.env.NODE_ENV === 'development';
export const IS_PROD = process.env.NODE_ENV === 'production';

export const API_URL_DEV = 'http://localhost:8000';
export const API_URL_PROD = 'test.com';
export const API_URL = IS_DEV ? API_URL_DEV : API_URL_PROD;

//aws configuration
export const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION;
//s3 configuration
export const S3BUCKET = process.env.NEXT_PUBLIC_AMPLIFY_BUCKET;
export const S3CLIENT = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY as string,
  },
});
