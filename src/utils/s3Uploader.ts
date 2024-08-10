// import { S3Client, PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";

// export const uploadToS3 = async (buffer: Buffer, key: string): Promise<string> => {
// console.log('AWS Region:', process.env.AWS_REGION);
// console.log('AWS Bucket Name:', process.env.AWS_BUCKET_NAME);

//   const client = new S3Client({ region: process.env.AWS_REGION });
  
//   const params: PutObjectCommandInput = {
//     Bucket: process.env.AWS_BUCKET_NAME,
//     Key: key,
//     Body: buffer,
//     ContentType: "image/jpeg",
//     // ACL: "public-read" // Ensure ACL is set if needed
//   };

//   try {
//     const command = new PutObjectCommand(params);
//     const data = await client.send(command);
//     console.log("Successfully uploaded to S3", data);

//     const url = `https://${params.Bucket}.s3.${client.config.region}.amazonaws.com/${params.Key}`;
//     console.log("Profile Image URL:", url);

//     return url;
//   } catch (error) {
//     console.error("Error uploading to S3:", error);
//     throw error;
//   }
// };

import { S3Client, PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";

export const uploadToS3 = async (buffer: Buffer, key: string): Promise<string> => {
  // Log environment variables
  console.log('AWS Region:', process.env.AWS_REGION);
  console.log('AWS Bucket Name:', process.env.AWS_BUCKET_NAME);

  // Validate environment variables
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_BUCKET_NAME;

  if (!region) {
    throw new Error("AWS_REGION is not defined");
  }
  if (!bucket) {
    throw new Error("AWS_BUCKET_NAME is not defined");
  }

  // Create an S3 client
  const client = new S3Client({ region });

  // Set parameters for the PutObjectCommand
  const params: PutObjectCommandInput = {
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: "image/jpeg",
    // ACL: "public-read" // Ensure ACL is set if needed
  };

  try {
    // Create and send the PutObjectCommand
    const command = new PutObjectCommand(params);
    const data = await client.send(command);

    // Log success
    console.log("Successfully uploaded to S3", data);

    // Generate the correct URL
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    console.log("Profile Image URL:", url);

    return url;
  } catch (error) {
    // Log error
    console.error("Error uploading to S3:", error);
    throw error;
  }
};
