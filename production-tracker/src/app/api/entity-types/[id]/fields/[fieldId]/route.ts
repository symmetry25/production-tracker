import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { deleteField, updateField } from "@/lib/custom-data-store";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

const patchFieldSchema = z.record(z.string(), z.unknown());

export async function PATCH(request: Request, ctx: RouteParams<{ id: string; fieldId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { id, fieldId } = await getRouteParams(ctx);
  const parsed = patchFieldSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("Invalid field payload.", 422);

  const field = updateField(id, fieldId, parsed.data);
  return field ? ok(field) : fail("Field not found.", 404);
}

export async function DELETE(_: Request, ctx: RouteParams<{ id: string; fieldId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { id, fieldId } = await getRouteParams(ctx);
  const field = deleteField(id, fieldId);
  return field ? ok(field) : fail("Field not found.", 404);
}
