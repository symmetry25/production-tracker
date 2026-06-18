import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { addDashboardWidget, getDashboard } from "@/lib/dashboard-builder";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

const widgetSchema = z.object({
  type: z.string().trim().min(1),
  title: z.string().trim().min(1),
  dataSource: z.record(z.string(), z.unknown()),
  style: z.record(z.string(), z.unknown()).optional(),
  layout: z.record(z.string(), z.unknown()).optional(),
  refreshInterval: z.number().int().optional(),
});

export async function GET(_: Request, ctx: RouteParams<{ dashboardId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { dashboardId } = await getRouteParams(ctx);
  const dashboard = getDashboard(dashboardId);
  return dashboard ? ok(dashboard.widgets) : fail("Dashboard not found.", 404);
}

export async function POST(request: Request, ctx: RouteParams<{ dashboardId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { dashboardId } = await getRouteParams(ctx);
  const parsed = widgetSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid widget payload.", 422);

  const widget = addDashboardWidget(dashboardId, parsed.data as never);
  return widget ? ok(widget) : fail("Dashboard not found.", 404);
}
