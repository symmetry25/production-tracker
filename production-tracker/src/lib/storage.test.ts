import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@aws-sdk/client-s3", () => ({
  PutObjectCommand: vi.fn().mockImplementation(function PutObjectCommandMock(input) {
    return { input };
  }),
  S3Client: vi.fn().mockImplementation(function S3ClientMock() {
    return { send: vi.fn().mockResolvedValue({}) };
  }),
}));

import { S3Client } from "@aws-sdk/client-s3";
import { mkdir, writeFile } from "node:fs/promises";

import { safeFilename, storeUploadedFile } from "@/lib/storage";

describe("storage adapter", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  it("stores files in the local upload directory by default", async () => {
    process.env.USE_S3 = "false";
    process.env.UPLOAD_DIR = "./public/uploads";

    const stored = await storeUploadedFile({
      file: new File(["hello"], "invoice.pdf", { type: "application/pdf" }),
      keyPrefix: "records/record-1",
      fileName: "invoice.pdf",
    });

    expect(stored.storage).toBe("local");
    expect(stored.publicUrl).toMatch(/^\/uploads\/records\/record-1\/\d+-invoice\.pdf$/);
    expect(mkdir).toHaveBeenCalled();
    expect(writeFile).toHaveBeenCalled();
  });

  it("stores files in S3 when USE_S3 is enabled", async () => {
    process.env.USE_S3 = "true";
    process.env.AWS_REGION = "ap-southeast-1";
    process.env.S3_BUCKET_NAME = "production-tracker-media";
    process.env.S3_PUBLIC_URL = "https://cdn.example.com/media";

    const stored = await storeUploadedFile({
      file: new File(["hello"], "clip.mp4", { type: "video/mp4" }),
      keyPrefix: "versions/task-1",
      fileName: "clip.mp4",
    });

    expect(stored.storage).toBe("s3");
    expect(stored.publicUrl).toMatch(/^https:\/\/cdn\.example\.com\/media\/versions\/task-1\/\d+-clip\.mp4$/);
    expect(S3Client).toHaveBeenCalledWith({ region: "ap-southeast-1" });
  });

  it("normalizes unsafe filenames", () => {
    expect(safeFilename("供应商 合同 FINAL.PDF")).toBe("FINAL.pdf");
    expect(safeFilename("../../bad name.mov")).toBe("bad_name.mov");
  });
});
