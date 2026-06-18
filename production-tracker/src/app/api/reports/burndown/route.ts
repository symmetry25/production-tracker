import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getDashboardStats, type DashboardStats } from "@/lib/dashboard-data";

export async function GET(request: Request) {
  return getBurndownReport(request, { auth, getDashboardStats });
}

export async function getBurndownReport(
  request: Request,
  deps: {
    auth: typeof auth;
    getDashboardStats: (projectId: string) => Promise<DashboardStats>;
  },
) {
  const session = await deps.auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return fail("projectId is required.", 422);
  }

  try {
    const stats = await deps.getDashboardStats(projectId);
    const totalDeliverables = Math.max(1, stats.counts.tasks);
    let completed = 0;

    return ok(
      stats.velocity.map((week) => {
        completed += week.approved + week.final;
        return {
          week: week.week,
          completed,
          remaining: Math.max(0, totalDeliverables - completed),
        };
      }),
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to load burndown report.", 500);
  }
}
