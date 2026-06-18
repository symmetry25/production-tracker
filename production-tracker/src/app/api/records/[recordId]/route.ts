import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { deleteEntityRecord, getRecord, updateEntityRecord } from "@/lib/custom-data-store";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

const patchRecordSchema = z.object({
  data: z.record(z.string(), z.unknown()),
});

export async function GET(_: Request, ctx: RouteParams<{ recordId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { recordId } = await getRouteParams(ctx);
  const record = getRecord(recordId);
  return record ? ok(record) : fail("Record not found.", 404);
}

export async function PATCH(request: Request, ctx: RouteParams<{ recordId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { recordId } = await getRouteParams(ctx);
  const parsed = patchRecordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid record payload.", 422);

  try {
    const record = updateEntityRecord(recordId, parsed.data.data);
    return record ? ok(record) : fail("Record not found.", 404);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update record.", 422);
  }
}

export async function DELETE(_: Request, ctx: RouteParams<{ recordId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { recordId } = await getRouteParams(ctx);
  const record = deleteEntityRecord(recordId);
  return record ? ok(record) : fail("Record not found.", 404);
}
