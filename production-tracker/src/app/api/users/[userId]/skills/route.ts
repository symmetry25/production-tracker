import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getUserSkills, updateUserSkillsAsync } from "@/lib/scoring";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

const updateSkillsSchema = z.object({
  skills: z.array(z.object({ skillId: z.string(), level: z.number().int().min(1).max(5), verifiedBy: z.string().optional().nullable() })),
});

export async function GET(_: Request, ctx: RouteParams<{ userId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);
  const { userId } = await getRouteParams(ctx);
  return ok(getUserSkills(userId));
}

export async function PATCH(request: Request, ctx: RouteParams<{ userId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);
  const { userId } = await getRouteParams(ctx);
  const parsed = updateSkillsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid skills payload.", 422);
  return ok(await updateUserSkillsAsync(userId, parsed.data.skills));
}
