import { z } from "zod";
import { TaskStatus } from "@/generated/prisma/enums";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { canManagePipeline } from "@/lib/permissions";
import { getPrisma } from "@/lib/prisma";
import { getTaskTableItems } from "@/lib/task-data";

const createTaskSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    status: z.enum(TaskStatus).default(TaskStatus.WAITING_TO_START),
    priority: z.number().int().min(0).max(2).default(0),
    startDate: z.string().date().optional().nullable(),
    dueDate: z.string().date().optional().nullable(),
    duration: z.number().int().min(0).optional().nullable(),
    timeLogged: z.number().min(0).default(0),
    estimatedCost: z.number().min(0).optional().nullable(),
    shotId: z.string().min(1).optional().nullable(),
    assetId: z.string().min(1).optional().nullable(),
    phaseId: z.string().min(1).optional().nullable(),
    assigneeIds: z.array(z.string().min(1)).default([]),
    reviewerId: z.string().min(1).optional().nullable(),
  })
  .refine((value) => Boolean(value.shotId) !== Boolean(value.assetId), {
    message: "任务必须且只能关联一个 Shot 或 Asset。",
    path: ["shotId"],
  });

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return fail("projectId is required.", 422);
  }

  const parsedStatus = searchParams.get("status");
  const status = parsedStatus && isTaskStatus(parsedStatus) ? parsedStatus : null;

  try {
    return ok(
      await getTaskTableItems({
        projectId,
        shotId: searchParams.get("shotId"),
        assetId: searchParams.get("assetId"),
        assigneeId: searchParams.get("assigneeId"),
        status,
      }),
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to load tasks.", 500);
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  if (!canManagePipeline(session.user)) {
    return fail("Only producers and supervisors can create tasks.", 403);
  }

  const body = await request.json().catch(() => null);
  const parsed = createTaskSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid task payload.", 422);
  }

  try {
    const prisma = getPrisma();
    const task = await prisma.task.create({
      data: {
        name: parsed.data.name,
        status: parsed.data.status,
        priority: parsed.data.priority,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        duration: parsed.data.duration,
        timeLogged: parsed.data.timeLogged,
        estimatedCost: parsed.data.estimatedCost,
        shotId: parsed.data.shotId,
        assetId: parsed.data.assetId,
        phaseId: parsed.data.phaseId,
        assignments: {
          create: parsed.data.assigneeIds.map((userId) => ({
            userId,
            reviewerId: parsed.data.reviewerId ?? null,
          })),
        },
      },
      include: {
        assignments: true,
      },
    });

    return ok(task);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create task.", 500);
  }
}

function isTaskStatus(value: string): value is TaskStatus {
  return Object.values(TaskStatus).includes(value as TaskStatus);
}
