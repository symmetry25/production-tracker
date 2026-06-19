import { z } from "zod";
import { AssetType, TaskStatus } from "@/generated/prisma/enums";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { canManagePipeline } from "@/lib/permissions";
import { getPrisma } from "@/lib/prisma";

const patchAssetSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  type: z.enum(AssetType).optional(),
  status: z.enum(TaskStatus).optional(),
  description: z.string().trim().optional().nullable(),
  thumbnailUrl: z.string().trim().optional().nullable(),
});

type AssetRouteContext = {
  params: Promise<{ assetId: string }>;
};

export async function PATCH(request: Request, ctx: AssetRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  if (!canManagePipeline(session.user)) {
    return fail("Only producers and supervisors can update assets.", 403);
  }

  const { assetId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = patchAssetSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid asset payload.", 422);
  }

  try {
    const prisma = getPrisma();
    const asset = await prisma.asset.update({
      where: { id: assetId },
      data: parsed.data,
    });

    return ok(asset);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update asset.", 500);
  }
}

export async function DELETE(_: Request, ctx: AssetRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  if (!canManagePipeline(session.user)) {
    return fail("Only producers and supervisors can delete assets.", 403);
  }

  const { assetId } = await ctx.params;

  try {
    const prisma = getPrisma();
    const asset = await prisma.asset.delete({ where: { id: assetId } });
    return ok(asset);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete asset.", 500);
  }
}
