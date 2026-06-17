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
  const start = searchParams.get("start") ?? undefined;
  const end = searchParams.get("end") ?? undefined;

  try {
    const data = await getResourcePlanningData(projectId, start, end);
    return ok({
      weeks: data.capacity,
      totals: data.totals,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to load resource planning overview.", 500);
  }
}
