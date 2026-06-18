import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { updateDashboardLayout } from "@/lib/dashboard-builder";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

const layoutSchema = z.object({
  layouts: z.array(z.object({ widgetId: z.string(), layout: z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() }) })),
});

export async function POST(request: Request, ctx: RouteParams<{ dashboardId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { dashboardId } = await getRouteParams(ctx);
  const parsed = layoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid layout payload.", 422);

  const widgets = updateDashboardLayout(dashboardId, parsed.data.layouts);
  return widgets ? ok(widgets) : fail("Dashboard not found.", 404);
}
