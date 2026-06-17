import { z } from "zod";
import { TaskStatus } from "@/generated/prisma/enums";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getPrisma } from "@/lib/prisma";

const patchTaskSchema = z.object({
  status: z.enum(TaskStatus).optional(),
  priority: z.number().int().min(0).max(2).optional(),
  timeLogged: z.number().min(0).optional(),
});

type TaskRouteContext = {
  params: Promise<{ taskId: string }>;
};

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

  try {
    const prisma = getPrisma();
    const task = await prisma.task.update({
      where: { id: taskId },
      data: parsed.data,
    });

    return ok(task);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update task.", 500);
  }
}
