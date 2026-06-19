import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { shouldUseDemoData } from "@/lib/demo-data";
import { getPrisma } from "@/lib/prisma";

const workOrderStatuses = ["open", "scheduled", "review", "approved", "blocked", "closed"] as const;

const patchWorkOrderSchema = z
  .object({
    title: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().optional().nullable(),
    status: z.enum(workOrderStatuses).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "Work order update payload cannot be empty." });

type WorkOrderRouteContext = {
  params: Promise<{ workOrderId: string }>;
};

export async function PATCH(request: Request, ctx: WorkOrderRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  if (shouldUseDemoData()) {
    return fail("Demo mode is handled locally. Connect DATABASE_URL to update work orders.", 409);
  }

  const { workOrderId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = patchWorkOrderSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid work order payload.", 422);
  }

  try {
    const prisma = getPrisma();
    const workOrder = await prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description === undefined ? undefined : parsed.data.description || null,
        status: parsed.data.status,
      },
    });

    return ok({
      id: workOrder.id,
      title: workOrder.title,
      description: workOrder.description,
      status: workOrder.status,
      createdAt: workOrder.createdAt.toISOString(),
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update work order.", 500);
  }
}

export async function DELETE(_: Request, ctx: WorkOrderRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  if (shouldUseDemoData()) {
    return fail("Demo mode is handled locally. Connect DATABASE_URL to delete work orders.", 409);
  }

  const { workOrderId } = await ctx.params;

  try {
    const prisma = getPrisma();
    await prisma.workOrder.delete({ where: { id: workOrderId } });
    return ok({ id: workOrderId });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete work order.", 500);
  }
}
