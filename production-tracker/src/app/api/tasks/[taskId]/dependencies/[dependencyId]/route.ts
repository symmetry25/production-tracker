import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getPrisma } from "@/lib/prisma";

type DependencyRouteContext = {
  params: Promise<{ taskId: string; dependencyId: string }>;
};

export async function DELETE(_: Request, ctx: DependencyRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { taskId, dependencyId } = await ctx.params;

  try {
    const prisma = getPrisma();
    const dependency = await prisma.taskDependency.delete({
      where: {
        id: dependencyId,
        successorId: taskId,
      },
    });

    return ok(dependency);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete dependency.", 500);
  }
}
