import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getUserScorecardAsync, upsertUserScoreAsync } from "@/lib/scoring";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

const scoreSchema = z.object({
  dimensionId: z.string().trim().min(1),
  score: z.number().min(0),
  comment: z.string().trim().optional().nullable(),
  period: z.string().trim().optional(),
});

export async function GET(request: Request, ctx: RouteParams<{ userId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);
  const { userId } = await getRouteParams(ctx);
  const { searchParams } = new URL(request.url);
  const scorecard = await getUserScorecardAsync(userId, searchParams.get("period") ?? undefined);
  return scorecard ? ok(scorecard) : fail("User not found.", 404);
}

export async function POST(request: Request, ctx: RouteParams<{ userId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);
  const { userId } = await getRouteParams(ctx);
  const parsed = scoreSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid score payload.", 422);
  return ok(await upsertUserScoreAsync(userId, { ...parsed.data, scoredById: session.user.id ?? "demo-admin" }));
}
