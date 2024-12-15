import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { AWS_REGION, S3BUCKET, S3CLIENT } from '@/lib/utils/config';

export const deleteFromS3 = async (url: string) => {
  const key = url.split('/').slice(3).join('/');
  try {
    const command = new DeleteObjectCommand({
      Bucket: S3BUCKET,
      Key: key,
    });

    const res = await S3CLIENT.send(command);
    console.log(res);
    console.log(`File ${key} deleted successfully from S3`);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};

export const uploadToS3 = async (file: File, fileIndex: number, userNodeId: string) => {
  try {
    const currentTime = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const fileName = `${userNodeId}/sticker/${currentTime}/${fileIndex}_${file.name}`;
    const command = new PutObjectCommand({
      Bucket: S3BUCKET,
      Key: fileName,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    });
    await S3CLIENT.send(command);
    return `https://${S3BUCKET}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
};
