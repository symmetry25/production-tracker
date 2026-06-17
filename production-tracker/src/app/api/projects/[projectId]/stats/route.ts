import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getDashboardStats } from "@/lib/dashboard-data";

type ProjectRouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function GET(_: Request, ctx: ProjectRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { projectId } = await ctx.params;

  try {
    return ok(await getDashboardStats(projectId));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to load project stats.", 500);
  }
}
