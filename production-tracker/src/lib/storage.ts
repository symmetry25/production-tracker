import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export type StoredFile = {
  key: string;
  publicUrl: string;
  storage: "local" | "s3";
};

type StoreFileInput = {
  file: File;
  keyPrefix: string;
  fileName: string;
};

let s3Client: S3Client | null = null;

export async function storeUploadedFile({ file, keyPrefix, fileName }: StoreFileInput): Promise<StoredFile> {
  const safeKeyPrefix = normalizeKeyPrefix(keyPrefix);
  const safeFileName = safeFilename(fileName);
  const objectKey = `${safeKeyPrefix}/${Date.now()}-${safeFileName}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (shouldUseS3Storage()) {
    const bucket = requiredEnv("S3_BUCKET_NAME");
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: bytes,
        ContentType: file.type || "application/octet-stream",
      }),
    );

    return {
      key: objectKey,
      publicUrl: buildS3PublicUrl(objectKey),
      storage: "s3",
    };
  }

  const absoluteRoot = resolveLocalUploadRoot();
  const targetPath = path.join(absoluteRoot, objectKey);

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, bytes);

  return {
    key: objectKey,
    publicUrl: `/uploads/${objectKey}`,
    storage: "local",
  };
}

export function shouldUseS3Storage() {
  return process.env.USE_S3 === "true";
}

export function safeFilename(filename: string) {
  const extension = path.extname(filename);
  const baseName = path.basename(filename, extension).replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "") || "upload";
  return `${baseName}${extension.toLowerCase()}`;
}

function getS3Client() {
  s3Client ??= new S3Client({
    region: requiredEnv("AWS_REGION"),
  });
  return s3Client;
}

function buildS3PublicUrl(objectKey: string) {
  const publicBaseUrl = process.env.S3_PUBLIC_URL?.replace(/\/+$/, "");
  if (publicBaseUrl) return `${publicBaseUrl}/${objectKey}`;

  const region = requiredEnv("AWS_REGION");
  const bucket = requiredEnv("S3_BUCKET_NAME");
  return `https://${bucket}.s3.${region}.amazonaws.com/${objectKey}`;
}

function normalizeKeyPrefix(prefix: string) {
  return prefix.split("/").map((part) => part.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "")).filter(Boolean).join("/");
}

function resolveLocalUploadRoot() {
  const uploadRoot = process.env.UPLOAD_DIR || "public/uploads";
  const normalized = uploadRoot.replace(/^\.?\//, "");
  const uploadPrefix = "public/uploads";
  const subdir = normalized.startsWith(`${uploadPrefix}/`) ? normalized.slice(uploadPrefix.length + 1) : "";
  return path.join(process.cwd(), "public", "uploads", subdir);
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required when USE_S3=true.`);
  return value;
}
