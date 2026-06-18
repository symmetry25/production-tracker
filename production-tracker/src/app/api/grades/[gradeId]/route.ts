import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { updateGradeAsync } from "@/lib/scoring";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

const patchGradeSchema = z.record(z.string(), z.unknown());

export async function PATCH(request: Request, ctx: RouteParams<{ gradeId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);
  const { gradeId } = await getRouteParams(ctx);
  const parsed = patchGradeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("Invalid grade payload.", 422);
  const grade = await updateGradeAsync(gradeId, parsed.data as never);
  return grade ? ok(grade) : fail("Grade not found.", 404);
}
