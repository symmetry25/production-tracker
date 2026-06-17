import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getPrisma } from "@/lib/prisma";

type ProjectRouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function GET(_: Request, ctx: ProjectRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { projectId } = await ctx.params;

  try {
    const prisma = getPrisma();
    const sequences = await prisma.sequence.findMany({
      where: { projectId },
      orderBy: { code: "asc" },
      include: {
        _count: {
          select: { shots: true },
        },
      },
    });

    return ok(sequences);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to load sequences.", 500);
  }
}
