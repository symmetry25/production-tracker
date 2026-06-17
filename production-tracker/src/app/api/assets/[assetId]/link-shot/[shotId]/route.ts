import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getPrisma } from "@/lib/prisma";

type AssetShotRouteContext = {
  params: Promise<{ assetId: string; shotId: string }>;
};

export async function DELETE(_: Request, ctx: AssetShotRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { assetId, shotId } = await ctx.params;

  try {
    const prisma = getPrisma();
    const link = await prisma.shotAsset.delete({
      where: {
        shotId_assetId: {
          shotId,
          assetId,
        },
      },
    });

    return ok(link);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to unlink shot.", 500);
  }
}
