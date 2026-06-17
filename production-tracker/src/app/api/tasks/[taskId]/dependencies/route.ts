import { z } from "zod";
import { DependencyType } from "@/generated/prisma/enums";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getPrisma } from "@/lib/prisma";

const createDependencySchema = z.object({
  predecessorId: z.string().min(1),
  type: z.enum(DependencyType).default(DependencyType.FS),
  lagDays: z.number().int().min(-30).max(365).default(0),
});

type TaskRouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function POST(request: Request, ctx: TaskRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { taskId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = createDependencySchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid dependency payload.", 422);
  }

  if (parsed.data.predecessorId === taskId) {
    return fail("任务不能依赖自己。", 422);
  }

  try {
    const prisma = getPrisma();
    const dependency = await prisma.taskDependency.upsert({
      where: {
        predecessorId_successorId: {
          predecessorId: parsed.data.predecessorId,
          successorId: taskId,
        },
      },
      update: {
        type: parsed.data.type,
        lagDays: parsed.data.lagDays,
      },
      create: {
        predecessorId: parsed.data.predecessorId,
        successorId: taskId,
        type: parsed.data.type,
        lagDays: parsed.data.lagDays,
      },
    });

    return ok(dependency);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create dependency.", 500);
  }
}
