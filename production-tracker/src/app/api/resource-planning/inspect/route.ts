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
  const weekStart = searchParams.get("weekStart");

  try {
    const data = await getResourcePlanningData(projectId, searchParams.get("start") ?? undefined, searchParams.get("end") ?? undefined);
    const windowLabel = weekStart ? data.weeks.find((week) => week.key === weekStart)?.label ?? weekStart : "All weeks";

    if (groupBy === "user") {
      return ok({
        groupBy,
        weekStart: weekStart ?? null,
        windowLabel,
        rows: data.users.map((user) => ({
          name: user.name,
          department: user.department,
          capacity: weekStart ? user.weeks.find((week) => week.weekKey === weekStart)?.capacity ?? 0 : user.totalCapacity,
          workload: weekStart ? user.weeks.find((week) => week.weekKey === weekStart)?.workload ?? 0 : user.totalWorkload,
          daysOverUnder: weekStart ? user.weeks.find((week) => week.weekKey === weekStart)?.delta ?? 0 : user.delta,
        })),
      });
    }

    return ok({
      groupBy: "department",
      weekStart: weekStart ?? null,
      windowLabel,
      rows: data.departments.map((department) => {
        const weeks = weekStart ? department.weeks.filter((week) => week.weekKey === weekStart) : department.weeks;
        const capacity = weeks.reduce((sum, week) => sum + week.capacity, 0);
        const workload = weeks.reduce((sum, week) => sum + week.workload, 0);

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
