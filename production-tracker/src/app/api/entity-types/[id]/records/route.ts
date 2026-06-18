import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { createEntityRecordAsync, listRecordsAsync } from "@/lib/custom-data-store";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

const createRecordSchema = z.object({
  data: z.record(z.string(), z.unknown()),
  createdBy: z.string().trim().optional(),
});

export async function GET(request: Request, ctx: RouteParams<{ id: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { id } = await getRouteParams(ctx);
  const { searchParams } = new URL(request.url);
  const records = await listRecordsAsync(id, {
    q: searchParams.get("filter") ?? searchParams.get("q"),
    sort: searchParams.get("sort"),
    dir: searchParams.get("dir") === "asc" ? "asc" : "desc",
    page: Number(searchParams.get("page") ?? 1),
  });
  return records ? ok(records) : fail("Entity type not found.", 404);
}

export async function POST(request: Request, ctx: RouteParams<{ id: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { id } = await getRouteParams(ctx);
  const parsed = createRecordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid record payload.", 422);

  try {
    const record = await createEntityRecordAsync(id, parsed.data.data, parsed.data.createdBy ?? session.user.name ?? "当前用户");
    return record ? ok(record) : fail("Entity type not found.", 404);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create record.", 422);
  }
}
