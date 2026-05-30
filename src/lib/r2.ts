import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const createR2Client = () =>
  new S3Client({
    region: "auto",
    endpoint: import.meta.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: import.meta.env.R2_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.R2_SECRET_ACCESS_KEY,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });

export const generatePresignedUploadUrl = async (
  folder: string,
  filename: string,
  contentType: string,
  expiresInSeconds = 300,
) => {
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const r2Key = `${folder}/${Date.now()}-${sanitized}`;

  const command = new PutObjectCommand({
    Bucket: import.meta.env.R2_BUCKET_NAME,
    Key: r2Key,
    ContentType: contentType,
  });

  const client = createR2Client();
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  const publicUrl = `${import.meta.env.R2_PUBLIC_URL}/${r2Key}`;

  return { uploadUrl, publicUrl, r2Key };
};
