import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import dotenv from 'dotenv';

dotenv.config();

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_BUCKET_NAME,
} = process.env;

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !AWS_BUCKET_NAME) {
  throw new Error('Missing AWS configuration in .env file');
}

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = async (file: Express.Multer.File): Promise<{ Location: string }> => {
  const uploadParams = {
    Bucket: AWS_BUCKET_NAME,
    Key: file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const upload = new Upload({
      client: s3Client,
      params: uploadParams,
    });

    const data = await upload.done();
    console.log('File uploaded successfully:', data);
    return { Location: `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${uploadParams.Key}` };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};
