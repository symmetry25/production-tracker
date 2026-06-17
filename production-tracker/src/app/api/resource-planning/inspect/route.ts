import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getResourcePlanningData } from "@/lib/resource-planning";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") ?? "demo-mkali-mission";
  const groupBy = searchParams.get("groupBy") ?? "department";

  try {
    const data = await getResourcePlanningData(projectId, searchParams.get("start") ?? undefined, searchParams.get("end") ?? undefined);

    if (groupBy === "user") {
      return ok({
        groupBy,
        rows: data.users.map((user) => ({
          name: user.name,
          department: user.department,
          capacity: user.totalCapacity,
          workload: user.totalWorkload,
          daysOverUnder: user.delta,
        })),
      });
    }

    return ok({
      groupBy: "department",
      rows: data.departments.map((department) => {
        const capacity = department.weeks.reduce((sum, week) => sum + week.capacity, 0);
        const workload = department.weeks.reduce((sum, week) => sum + week.workload, 0);

        return {
          name: department.department,
          capacity,
          workload,
          daysOverUnder: Math.round((workload - capacity) * 10) / 10,
        };
      }),
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to inspect resource planning data.", 500);
  }
}
