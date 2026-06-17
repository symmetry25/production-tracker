import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getPrisma } from "@/lib/prisma";

type AssignmentRouteContext = {
  params: Promise<{ taskId: string; userId: string }>;
};

export async function DELETE(_: Request, ctx: AssignmentRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { taskId, userId } = await ctx.params;

  try {
    const prisma = getPrisma();
    const assignment = await prisma.assignment.delete({
      where: {
        taskId_userId: {
          taskId,
          userId,
        },
      },
    });

    return ok(assignment);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to remove assignment.", 500);
  }
}
