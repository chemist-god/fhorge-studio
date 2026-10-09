import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerEnv } from "@/lib/env";

let client: S3Client | undefined;

function getR2Client(): S3Client {
  const env = getServerEnv();
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
  return client;
}

export async function createMediaUploadUrl(input: {
  objectKey: string;
  contentType: string;
}): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: getServerEnv().R2_BUCKET,
    Key: input.objectKey,
    ContentType: input.contentType,
  });
  return getSignedUrl(getR2Client(), command, { expiresIn: 300 });
}

export function getPublicMediaUrl(objectKey: string): string {
  return `${getServerEnv().R2_PUBLIC_URL}/${objectKey}`;
}
