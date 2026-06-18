import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { deleteEntityType, getEntityType, updateEntityType } from "@/lib/custom-data-store";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

const patchEntityTypeSchema = z.object({
  name: z.string().trim().min(1).optional(),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional(),
  industry: z.enum(["vfx", "retail", "manufacturing", "hr", "generic"]).optional(),
  icon: z.string().trim().optional(),
  color: z.string().trim().optional(),
  projectId: z.string().trim().optional().nullable(),
});

export async function GET(_: Request, ctx: RouteParams<{ id: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { id } = await getRouteParams(ctx);
  const entity = getEntityType(id);
  return entity ? ok(entity) : fail("Entity type not found.", 404);
}

export async function PATCH(request: Request, ctx: RouteParams<{ id: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { id } = await getRouteParams(ctx);
  const parsed = patchEntityTypeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid entity type payload.", 422);

  const entity = updateEntityType(id, parsed.data);
  return entity ? ok(entity) : fail("Entity type not found.", 404);
}

export async function DELETE(_: Request, ctx: RouteParams<{ id: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { id } = await getRouteParams(ctx);
  const entity = deleteEntityType(id);
  return entity ? ok(entity) : fail("Entity type not found.", 404);
}
