import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getCurrentProjectId } from "@/lib/current-project";
import { getResourcePlanningData } from "@/lib/resource-planning";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const projectId = await getCurrentProjectId(searchParams.get("projectId"));
  const userId = searchParams.get("userId");
  const weekStart = searchParams.get("weekStart");

  if (!projectId) {
    return fail("No active project.", 404);
  }

  if (!userId || !weekStart) {
    return fail("userId and weekStart are required.", 422);
  }

  try {
    const data = await getResourcePlanningData(projectId, searchParams.get("start") ?? undefined, searchParams.get("end") ?? undefined);
    const user = data.users.find((item) => item.id === userId);
    const week = user?.weeks.find((item) => item.weekKey === weekStart);

    return ok({
      user: user ? { id: user.id, name: user.name, department: user.department } : null,
      weekStart,
      capacity: week?.capacity ?? 0,
      totalDays: week?.workload ?? 0,
      tasks: week?.tasks ?? [],
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to load user week tasks.", 500);
  }
}
