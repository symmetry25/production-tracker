export const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;

export const reviewVersionMimeTypes = ["video/mp4", "video/quicktime", "image/jpeg", "image/png", "image/webp"] as const;
export const recordAttachmentMimeTypes = [
  ...reviewVersionMimeTypes,
  "application/pdf",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;
export const workbookMimeTypes = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

const reviewVersionMimeTypeSet = new Set<string>(reviewVersionMimeTypes);
const recordAttachmentMimeTypeSet = new Set<string>(recordAttachmentMimeTypes);
const workbookMimeTypeSet = new Set<string>(workbookMimeTypes);

export type UploadValidationKind = "review-version" | "record-attachment" | "workbook";

export function validateUploadFile(file: File, kind: UploadValidationKind) {
  const allowedMimeTypes = getAllowedMimeTypes(kind);

  if (!allowedMimeTypes.has(file.type)) {
    return { valid: false as const, message: unsupportedMessage(kind) };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return { valid: false as const, message: "文件不能超过 500MB。" };
  }

  return { valid: true as const };
}

export function isAllowedRecordAttachmentMimeType(type: string) {
  return recordAttachmentMimeTypeSet.has(type);
}

function getAllowedMimeTypes(kind: UploadValidationKind) {
  if (kind === "review-version") return reviewVersionMimeTypeSet;
  if (kind === "workbook") return workbookMimeTypeSet;
  return recordAttachmentMimeTypeSet;
}

function unsupportedMessage(kind: UploadValidationKind) {
  if (kind === "review-version") return "只支持 mp4、mov、jpg、png、webp。";
  if (kind === "workbook") return "只支持 xlsx、xls、csv 表格文件。";
  return "只支持视频、图片、PDF、Word、Excel、CSV 附件。";
}
