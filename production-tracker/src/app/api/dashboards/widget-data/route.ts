import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getWidgetDataAsync } from "@/lib/dashboard-builder";

const widgetDataSchema = z.object({
  entityTypeId: z.string().trim().min(1),
  filters: z.array(z.record(z.string(), z.unknown())).optional(),
  groupBy: z.string().optional(),
  aggregation: z.object({ field: z.string(), fn: z.enum(["count", "sum", "avg", "min", "max"]) }).optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  limit: z.number().int().positive().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const parsed = widgetDataSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid widget data payload.", 422);

  return ok(await getWidgetDataAsync(parsed.data as never));
}
