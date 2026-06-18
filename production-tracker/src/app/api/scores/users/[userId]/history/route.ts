import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getUserScoreHistory } from "@/lib/scoring";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

export async function GET(_: Request, ctx: RouteParams<{ userId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);
  const { userId } = await getRouteParams(ctx);
  return ok(getUserScoreHistory(userId));
}
