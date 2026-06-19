import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { canManageAssignments } from "@/lib/permissions";
import { getPrisma } from "@/lib/prisma";

const assignTaskSchema = z.object({
  userId: z.string().min(1),
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
    return fail("Only producers and supervisors can assign tasks.", 403);
  }

  const { taskId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = assignTaskSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid assignment payload.", 422);
  }

  try {
    const prisma = getPrisma();
    const assignment = await prisma.assignment.upsert({
      where: {
        taskId_userId: {
          taskId,
          userId: parsed.data.userId,
        },
      },
      update: {
        reviewerId: parsed.data.reviewerId ?? null,
      },
      create: {
        taskId,
        userId: parsed.data.userId,
        reviewerId: parsed.data.reviewerId ?? null,
      },
    });

    return ok(assignment);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to assign task.", 500);
  }
}
