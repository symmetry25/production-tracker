import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import type { DashboardStats } from "@/lib/dashboard-data";
import { getDashboardSlice } from "@/lib/dashboard-data";

type ProjectRouteContext = {
  params: Promise<{ projectId: string }>;
};

export function dashboardSliceRoute<T extends keyof DashboardStats>(key: T) {
  return async function GET(_: Request, ctx: ProjectRouteContext) {
    const session = await auth();

    if (!session?.user) {
      return fail("Unauthorized", 401);
    }

    const { projectId } = await ctx.params;

    try {
      return ok(await getDashboardSlice(projectId, key));
    } catch (error) {
      return fail(error instanceof Error ? error.message : "Unable to load dashboard data.", 500);
    }
  };
}
