import {
  CreateBucketCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env.ts";

// Private object storage (MinIO in dev). The bucket is never public: clients get short-lived presigned
// URLs, and the database stores only object keys.

const client = (endpoint: string) =>
  new S3Client({
    endpoint,
    region: "us-east-1", // MinIO ignores it; the SDK requires one
    forcePathStyle: true,
    credentials: { accessKeyId: env.s3.accessKey, secretAccessKey: env.s3.secretKey },
  });

const s3 = client(env.s3.endpoint);
const signer = client(env.s3.publicEndpoint);
const Bucket = env.s3.bucket;

export async function ensureBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket }));
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket }));
  }
}

// Type and size are signed, so the upload must match what the client declared.
export const uploadUrl = (key: string, contentType: string, contentLength: number) =>
  getSignedUrl(signer, new PutObjectCommand({ Bucket, Key: key, ContentType: contentType, ContentLength: contentLength }), {
    expiresIn: 600,
    signableHeaders: new Set(["content-type", "content-length"]),
  });

export const downloadUrl = (key: string) =>
  getSignedUrl(signer, new GetObjectCommand({ Bucket, Key: key }), { expiresIn: 300 });

// S3 deletes at most 1000 keys per request; missing keys are not an error.
export async function deleteObjects(keys: string[]) {
  for (let i = 0; i < keys.length; i += 1000) {
    const Objects = keys.slice(i, i + 1000).map((Key) => ({ Key }));
    await s3.send(new DeleteObjectsCommand({ Bucket, Delete: { Objects, Quiet: true } }));
  }
}
