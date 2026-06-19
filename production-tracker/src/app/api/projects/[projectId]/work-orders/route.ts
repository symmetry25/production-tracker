import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getProjectWorkOrders } from "@/lib/phase-work-order-data";
import { getPrisma } from "@/lib/prisma";

const workOrderStatuses = ["open", "scheduled", "review", "approved", "blocked", "closed"] as const;

const createWorkOrderSchema = z.object({
  title: z.string().trim().min(2),
  description: z.string().trim().optional(),
  status: z.enum(workOrderStatuses).default("open"),
});

type ProjectRouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function GET(_: Request, ctx: ProjectRouteContext) {
  const session = await auth();

  if (!session?.user) return fail("Unauthorized", 401);

  const { projectId } = await ctx.params;
  return ok(await getProjectWorkOrders(projectId));
}

export async function POST(request: Request, ctx: ProjectRouteContext) {
  const session = await auth();

  if (!session?.user) return fail("Unauthorized", 401);

  const { projectId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = createWorkOrderSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid work order payload.", 422);
  }

  try {
    const prisma = getPrisma();
    const workOrder = await prisma.workOrder.create({
      data: {
        projectId,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        status: parsed.data.status,
      },
    });

    return ok(workOrder);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create work order.", 500);
  }
}
