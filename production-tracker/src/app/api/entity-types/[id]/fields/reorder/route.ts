import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { reorderFieldsAsync } from "@/lib/custom-data-store";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

const reorderSchema = z.object({
  fieldIds: z.array(z.string().trim().min(1)),
});

export async function POST(request: Request, ctx: RouteParams<{ id: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { id } = await getRouteParams(ctx);
  const parsed = reorderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid reorder payload.", 422);

  const fields = await reorderFieldsAsync(id, parsed.data.fieldIds);
  return fields ? ok(fields) : fail("Entity type not found.", 404);
}
