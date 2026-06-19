import { z } from "zod";
import { TaskStatus } from "@/generated/prisma/enums";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { canManagePipeline, canPatchTaskFields } from "@/lib/permissions";
import { getPrisma } from "@/lib/prisma";

const patchTaskSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    status: z.enum(TaskStatus).optional(),
    priority: z.number().int().min(0).max(2).optional(),
    startDate: z.string().date().optional().nullable(),
    dueDate: z.string().date().optional().nullable(),
    duration: z.number().int().min(0).optional().nullable(),
    timeLogged: z.number().min(0).optional(),
    estimatedCost: z.number().min(0).optional().nullable(),
    shotId: z.string().min(1).optional().nullable(),
    assetId: z.string().min(1).optional().nullable(),
    phaseId: z.string().min(1).optional().nullable(),
  })
  .refine((value) => !(value.shotId && value.assetId), {
    message: "任务不能同时关联 Shot 和 Asset。",
    path: ["shotId"],
  });

type TaskRouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function GET(_: Request, ctx: TaskRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { taskId } = await ctx.params;

  try {
    const prisma = getPrisma();
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        shot: { include: { sequence: true } },
        asset: true,
        phase: true,
        assignments: { include: { user: true } },
        versions: { orderBy: { number: "desc" } },
        notes: { include: { author: true }, orderBy: { createdAt: "desc" } },
        predecessors: { include: { predecessor: true } },
        successors: { include: { successor: true } },
      },
    });

    if (!task) {
      return fail("Task not found.", 404);
    }

    return ok(task);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to load task.", 500);
  }
}

export async function PATCH(request: Request, ctx: TaskRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { taskId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = patchTaskSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid task payload.", 422);
  }

  if (!canPatchTaskFields(session.user, Object.keys(parsed.data))) {
    return fail("You can only update task status and logged time unless you are a producer or supervisor.", 403);
  }

  try {
    const prisma = getPrisma();
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...parsed.data,
        startDate: parsed.data.startDate === undefined ? undefined : parsed.data.startDate ? new Date(parsed.data.startDate) : null,
        dueDate: parsed.data.dueDate === undefined ? undefined : parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        shotId: parsed.data.assetId ? null : parsed.data.shotId,
        assetId: parsed.data.shotId ? null : parsed.data.assetId,
      },
    });

    return ok(task);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update task.", 500);
  }
}

export async function DELETE(_: Request, ctx: TaskRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  if (!canManagePipeline(session.user)) {
    return fail("Only producers and supervisors can delete tasks.", 403);
  }

  const { taskId } = await ctx.params;

  try {
    const prisma = getPrisma();
    const task = await prisma.task.delete({ where: { id: taskId } });

    return ok(task);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete task.", 500);
  }
}
