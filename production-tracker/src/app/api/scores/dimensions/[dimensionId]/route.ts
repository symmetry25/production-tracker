import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { updateScoreDimensionAsync } from "@/lib/scoring";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

const patchDimensionSchema = z.record(z.string(), z.unknown());

export async function PATCH(request: Request, ctx: RouteParams<{ dimensionId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);
  const { dimensionId } = await getRouteParams(ctx);
  const parsed = patchDimensionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("Invalid dimension payload.", 422);
  const dimension = await updateScoreDimensionAsync(dimensionId, parsed.data as never);
  return dimension ? ok(dimension) : fail("Dimension not found.", 404);
}
