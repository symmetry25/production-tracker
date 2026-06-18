import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { setUserGradeAsync } from "@/lib/scoring";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

const setGradeSchema = z.object({
  gradeId: z.string().trim().min(1),
});

export async function PATCH(request: Request, ctx: RouteParams<{ userId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);
  const { userId } = await getRouteParams(ctx);
  const parsed = setGradeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid grade payload.", 422);
  const result = await setUserGradeAsync(userId, parsed.data.gradeId, session.user.id ?? "demo-admin");
  return result ? ok(result) : fail("User or grade not found.", 404);
}
