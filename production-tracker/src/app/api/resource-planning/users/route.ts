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
  const department = searchParams.get("department");

  if (!projectId) {
    return fail("No active project.", 404);
  }

  try {
    const data = await getResourcePlanningData(projectId, searchParams.get("start") ?? undefined, searchParams.get("end") ?? undefined);
    const users = department ? data.users.filter((user) => user.department === department) : data.users;

    return ok({
      weeks: data.weeks,
      users,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to load resource planning users.", 500);
  }
}
