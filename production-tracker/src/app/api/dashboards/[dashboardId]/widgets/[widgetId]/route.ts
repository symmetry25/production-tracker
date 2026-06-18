import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { deleteDashboardWidgetAsync, updateDashboardWidgetAsync } from "@/lib/dashboard-builder";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

const patchWidgetSchema = z.record(z.string(), z.unknown());

export async function PATCH(request: Request, ctx: RouteParams<{ dashboardId: string; widgetId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { dashboardId, widgetId } = await getRouteParams(ctx);
  const parsed = patchWidgetSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("Invalid widget payload.", 422);

  const widget = await updateDashboardWidgetAsync(dashboardId, widgetId, parsed.data as never);
  return widget ? ok(widget) : fail("Widget not found.", 404);
}

export async function DELETE(_: Request, ctx: RouteParams<{ dashboardId: string; widgetId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { dashboardId, widgetId } = await getRouteParams(ctx);
  const widget = await deleteDashboardWidgetAsync(dashboardId, widgetId);
  return widget ? ok(widget) : fail("Widget not found.", 404);
}
