import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { previewImport } from "@/lib/custom-data-store";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

const importPreviewSchema = z.object({
  sourceText: z.string().min(1),
  mapping: z.record(z.string(), z.string()).optional(),
});

export async function POST(request: Request, ctx: RouteParams<{ id: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { id } = await getRouteParams(ctx);
  const parsed = importPreviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid import preview payload.", 422);

  const preview = previewImport(id, parsed.data);
  return preview ? ok(preview) : fail("Entity type not found.", 404);
}
