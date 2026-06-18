import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { addRecordNote, getRecord } from "@/lib/custom-data-store";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

const noteSchema = z.object({
  content: z.string().trim().min(1),
  authorId: z.string().trim().optional(),
});

export async function GET(_: Request, ctx: RouteParams<{ recordId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { recordId } = await getRouteParams(ctx);
  const record = getRecord(recordId);
  return record ? ok(record.notes) : fail("Record not found.", 404);
}

export async function POST(request: Request, ctx: RouteParams<{ recordId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { recordId } = await getRouteParams(ctx);
  const parsed = noteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid note payload.", 422);

  const note = addRecordNote(recordId, { content: parsed.data.content, authorId: parsed.data.authorId ?? session.user.id ?? "demo-admin" });
  return note ? ok(note) : fail("Record not found.", 404);
}
