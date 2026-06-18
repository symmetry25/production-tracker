import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { deleteDashboard, getDashboard, updateDashboard } from "@/lib/dashboard-builder";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

const patchDashboardSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional().nullable(),
  projectId: z.string().trim().optional().nullable(),
  isShared: z.boolean().optional(),
});

export async function GET(_: Request, ctx: RouteParams<{ dashboardId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { dashboardId } = await getRouteParams(ctx);
  const dashboard = getDashboard(dashboardId);
  return dashboard ? ok(dashboard) : fail("Dashboard not found.", 404);
}

export async function PATCH(request: Request, ctx: RouteParams<{ dashboardId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { dashboardId } = await getRouteParams(ctx);
  const parsed = patchDashboardSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid dashboard payload.", 422);

  const dashboard = updateDashboard(dashboardId, parsed.data);
  return dashboard ? ok(dashboard) : fail("Dashboard not found.", 404);
}

export async function DELETE(_: Request, ctx: RouteParams<{ dashboardId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { dashboardId } = await getRouteParams(ctx);
  const dashboard = deleteDashboard(dashboardId);
  return dashboard ? ok(dashboard) : fail("Dashboard not found.", 404);
}
