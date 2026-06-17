import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getPrisma } from "@/lib/prisma";

type VersionRouteContext = {
  params: Promise<{ versionId: string }>;
};

export async function GET(_: Request, ctx: VersionRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { versionId } = await ctx.params;

  try {
    const prisma = getPrisma();
    const version = await prisma.version.findUnique({
      where: { id: versionId },
      include: {
        task: {
          include: {
            shot: true,
            asset: true,
          },
        },
        uploadedBy: true,
        notes: {
          orderBy: { createdAt: "desc" },
          include: { author: true },
        },
      },
    });

    if (!version) {
      return fail("Version not found.", 404);
    }

    return ok(version);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to load version.", 500);
  }
}

export async function DELETE(_: Request, ctx: VersionRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { versionId } = await ctx.params;

  try {
    const prisma = getPrisma();
    const version = await prisma.version.delete({
      where: { id: versionId },
    });

    return ok(version);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete version.", 500);
  }
}
