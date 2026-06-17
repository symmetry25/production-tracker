import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getPrisma } from "@/lib/prisma";

const linkShotSchema = z.object({
  shotId: z.string().min(1),
});

type AssetRouteContext = {
  params: Promise<{ assetId: string }>;
};

export async function POST(request: Request, ctx: AssetRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { assetId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = linkShotSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid link payload.", 422);
  }

  try {
    const prisma = getPrisma();
    const link = await prisma.shotAsset.upsert({
      where: {
        shotId_assetId: {
          shotId: parsed.data.shotId,
          assetId,
        },
      },
      update: {},
      create: {
        shotId: parsed.data.shotId,
        assetId,
      },
    });

    return ok(link);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to link shot.", 500);
  }
}
