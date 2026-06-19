import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { addRecordFileAsync, getRecordAsync } from "@/lib/custom-data-store";
import { getRouteParams, type RouteParams } from "@/lib/route-context";
import { safeFilename, storeUploadedFile } from "@/lib/storage";
import { isAllowedRecordAttachmentMimeType, validateUploadFile } from "@/lib/upload-validation";

const fileSchema = z.object({
  filename: z.string().trim().min(1),
  fileUrl: z.string().trim().min(1),
  fileType: z.string().trim().refine(isAllowedRecordAttachmentMimeType, "只支持视频、图片、PDF、Word、Excel、CSV 附件。"),
  fileSize: z.number().int().min(0).max(500 * 1024 * 1024, "文件不能超过 500MB。"),
});

export async function GET(_: Request, ctx: RouteParams<{ recordId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { recordId } = await getRouteParams(ctx);
  const record = await getRecordAsync(recordId);
  return record ? ok(record.files) : fail("Record not found.", 404);
}

export async function POST(request: Request, ctx: RouteParams<{ recordId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { recordId } = await getRouteParams(ctx);
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData().catch(() => null);
    if (!form) return fail("Invalid multipart payload.", 422);

    const file = form.get("file");
    if (!(file instanceof File)) return fail("File is required.", 422);

    const fileValidation = validateUploadFile(file, "record-attachment");
    if (!fileValidation.valid) return fail(fileValidation.message, 422);

    const safeName = safeFilename(file.name || "attachment");
    const storedFile = await storeUploadedFile({
      file,
      keyPrefix: `records/${recordId}`,
      fileName: safeName,
    });

    const uploaded = await addRecordFileAsync(recordId, {
      filename: safeName,
      fileUrl: storedFile.publicUrl,
      fileType: file.type,
      fileSize: file.size,
    });

    return uploaded ? ok(uploaded) : fail("Record not found.", 404);
  }

  const parsed = fileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid file payload.", 422);

  const file = await addRecordFileAsync(recordId, parsed.data);
  return file ? ok(file) : fail("Record not found.", 404);
}
