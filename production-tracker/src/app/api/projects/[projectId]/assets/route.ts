import { z } from "zod";
import { AssetType, TaskStatus } from "@/generated/prisma/enums";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getAssetTableItems } from "@/lib/asset-data";
import { getPrisma } from "@/lib/prisma";
import { PIPELINE_STEPS } from "@/lib/status-colors";

const createAssetSchema = z.object({
  name: z.string().trim().min(2).max(80),
  type: z.enum(AssetType),
  description: z.string().trim().optional(),
  thumbnailUrl: z.string().trim().optional(),
});

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
    return ok(await getAssetTableItems(projectId));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to load assets.", 500);
  }
}

export async function POST(request: Request, ctx: ProjectRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { projectId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = createAssetSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid asset payload.", 422);
  }

  try {
    const prisma = getPrisma();
    const asset = await prisma.asset.create({
      data: {
        projectId,
        name: parsed.data.name,
        type: parsed.data.type,
        description: parsed.data.description || null,
        thumbnailUrl: parsed.data.thumbnailUrl || null,
        tasks: {
          create: PIPELINE_STEPS.map((step) => ({
            name: step,
            status: TaskStatus.WAITING_TO_START,
          })),
        },
      },
    });

    return ok(asset);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create asset.", 500);
  }
}
