import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { createDashboardAsync, listDashboardsAsync } from "@/lib/dashboard-builder";

const createDashboardSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional().nullable(),
  projectId: z.string().trim().optional().nullable(),
  isShared: z.boolean().optional(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  return ok(await listDashboardsAsync(searchParams.get("projectId")));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const parsed = createDashboardSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid dashboard payload.", 422);

  return ok(await createDashboardAsync(parsed.data));
}
