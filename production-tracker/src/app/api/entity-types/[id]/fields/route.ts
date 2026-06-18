import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { addFieldAsync, getEntityTypeAsync } from "@/lib/custom-data-store";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

const fieldSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1),
  key: z.string().trim().min(1),
  type: z.string().trim().min(1),
  required: z.boolean().default(false),
  defaultValue: z.unknown().optional(),
  options: z.array(z.record(z.string(), z.unknown())).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  order: z.number().int().optional(),
  width: z.number().int().optional(),
  hidden: z.boolean().optional(),
  readOnly: z.boolean().optional(),
});

export async function GET(_: Request, ctx: RouteParams<{ id: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { id } = await getRouteParams(ctx);
  const entity = await getEntityTypeAsync(id);
  return entity ? ok(entity.fields) : fail("Entity type not found.", 404);
}

export async function POST(request: Request, ctx: RouteParams<{ id: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { id } = await getRouteParams(ctx);
  const parsed = fieldSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid field payload.", 422);

  const field = await addFieldAsync(id, parsed.data as never);
  return field ? ok(field) : fail("Entity type not found.", 404);
}
