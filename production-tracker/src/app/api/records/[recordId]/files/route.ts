import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { addRecordFileAsync, getRecordAsync } from "@/lib/custom-data-store";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

const fileSchema = z.object({
  filename: z.string().trim().min(1),
  fileUrl: z.string().trim().min(1),
  fileType: z.string().trim().min(1),
  fileSize: z.number().int().min(0),
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
  const parsed = fileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid file payload.", 422);

  const file = await addRecordFileAsync(recordId, parsed.data);
  return file ? ok(file) : fail("Record not found.", 404);
}
