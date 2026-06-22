import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { sendTaskAssignmentNotification } from "@/lib/notifications";
import { canManageAssignments } from "@/lib/permissions";
import { getPrisma } from "@/lib/prisma";

const reassignTaskSchema = z.object({
  fromUserId: z.string().min(1),
  toUserId: z.string().min(1),
  reviewerId: z.string().min(1).optional().nullable(),
});

type TaskRouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function POST(request: Request, ctx: TaskRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  if (!canManageAssignments(session.user)) {
    return fail("Only producers and supervisors can reassign tasks.", 403);
  }

  const { taskId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = reassignTaskSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid reassignment payload.", 422);
  }

  if (parsed.data.fromUserId === parsed.data.toUserId) {
    return fail("Choose a different assignee for reassignment.", 422);
  }

  try {
    const prisma = getPrisma();
    const [assignment, task, reviewer] = await prisma.$transaction(async (tx) => {
      await tx.assignment.deleteMany({
        where: {
          taskId,
          userId: parsed.data.fromUserId,
        },
      });

      const nextAssignment = await tx.assignment.upsert({
        where: {
          taskId_userId: {
            taskId,
            userId: parsed.data.toUserId,
          },
        },
        update: {
          reviewerId: parsed.data.reviewerId ?? null,
        },
        create: {
          taskId,
          userId: parsed.data.toUserId,
          reviewerId: parsed.data.reviewerId ?? null,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              department: true,
            },
          },
        },
      });

      const nextTask = await tx.task.findUnique({
        where: { id: taskId },
        select: {
          id: true,
          name: true,
          status: true,
          startDate: true,
          dueDate: true,
          shot: {
            select: {
              code: true,
              sequence: { select: { code: true } },
              project: { select: { id: true, name: true, code: true } },
            },
          },
          asset: {
            select: {
              name: true,
              type: true,
              project: { select: { id: true, name: true, code: true } },
            },
          },
        },
      });

      const nextReviewer = parsed.data.reviewerId
        ? await tx.user.findUnique({
            where: { id: parsed.data.reviewerId },
            select: { name: true, email: true },
          })
        : null;

      return [nextAssignment, nextTask, nextReviewer] as const;
    });

    if (task) {
      const notification = await sendTaskAssignmentNotification({
        task: {
          id: task.id,
          name: task.name,
          status: task.status,
          startDate: task.startDate,
          dueDate: task.dueDate,
          contextLabel: task.shot ? `${task.shot.sequence?.code ?? "NO_SEQUENCE"} / ${task.shot.code}` : task.asset ? `${task.asset.type} / ${task.asset.name}` : "Unassigned",
        },
        project: task.shot?.project ?? task.asset?.project ?? null,
        assignee: assignment.user,
        reviewer,
        assignedBy: {
          name: session.user.name,
          email: session.user.email,
        },
      });

      if (notification.status === "failed") {
        console.warn(`Task reassignment notification failed for ${task.id}: ${notification.error}`);
      }
    }

    return ok(assignment);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to reassign task.", 500);
  }
}
