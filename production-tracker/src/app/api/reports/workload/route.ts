import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getDashboardStats, type DashboardStats } from "@/lib/dashboard-data";

export async function GET(request: Request) {
  return getWorkloadReport(request, { auth, getDashboardStats });
}

export async function getWorkloadReport(
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
  const projectId = searchParams.get("projectId") ?? "demo-mkali-mission";

  try {
    const stats = await deps.getDashboardStats(projectId);
    return ok(stats.crew);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to load workload report.", 500);
  }
}
