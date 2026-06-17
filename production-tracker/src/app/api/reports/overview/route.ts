import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getDashboardStats } from "@/lib/dashboard-data";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return fail("projectId is required.", 422);
  }

  try {
    const stats = await getDashboardStats(projectId);
    return ok({
      counts: stats.counts,
      shotStatus: stats.shotStatus,
      assetStatus: stats.assetStatus,
      taskStatus: stats.taskStatus,
      versionStatus: stats.versionStatus,
      pctFinalByDept: stats.pctFinalByDept,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to load overview report.", 500);
  }
}
