import { z } from "zod";
import { TaskStatus } from "@/generated/prisma/enums";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { canManagePipeline } from "@/lib/permissions";
import { getPrisma } from "@/lib/prisma";

const patchShotSchema = z.object({
  code: z.string().trim().min(2).max(40).optional(),
  sequenceCode: z.string().trim().min(1).max(24).optional(),
  status: z.enum(TaskStatus).optional(),
  description: z.string().trim().optional().nullable(),
  cutIn: z.number().int().optional().nullable(),
  cutOut: z.number().int().optional().nullable(),
});

type ShotRouteContext = {
  params: Promise<{ shotId: string }>;
};

export async function GET(_: Request, ctx: ShotRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  if (!canManagePipeline(session.user)) {
    return fail("Only producers and supervisors can update shots.", 403);
  }

  const { shotId } = await ctx.params;

  try {
    const prisma = getPrisma();
    const shot = await prisma.shot.findUnique({
      where: { id: shotId },
      include: {
        sequence: true,
        tasks: true,
        linkedAssets: {
          include: { asset: true },
        },
      },
    });

    if (!shot) {
      return fail("Shot not found.", 404);
    }

    return ok(shot);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to load shot.", 500);
  }
}

export async function PATCH(request: Request, ctx: ShotRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  if (!canManagePipeline(session.user)) {
    return fail("Only producers and supervisors can delete shots.", 403);
  }

  const { shotId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = patchShotSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid shot payload.", 422);
  }

  try {
    const prisma = getPrisma();
    const cutDuration =
      typeof parsed.data.cutIn === "number" && typeof parsed.data.cutOut === "number"
        ? Math.max(0, parsed.data.cutOut - parsed.data.cutIn)
        : undefined;
    const currentShot = parsed.data.sequenceCode
      ? await prisma.shot.findUnique({
          where: { id: shotId },
          select: { projectId: true },
        })
      : null;

    if (parsed.data.sequenceCode && !currentShot) {
      return fail("Shot not found.", 404);
    }

    const sequence = parsed.data.sequenceCode
      ? await prisma.sequence.upsert({
          where: { projectId_code: { projectId: currentShot!.projectId, code: parsed.data.sequenceCode.toUpperCase() } },
          update: {},
          create: { projectId: currentShot!.projectId, code: parsed.data.sequenceCode.toUpperCase() },
        })
      : null;

    const shot = await prisma.shot.update({
      where: { id: shotId },
      data: {
        code: parsed.data.code?.toUpperCase(),
        sequenceId: sequence?.id,
        status: parsed.data.status,
        description: parsed.data.description,
        cutIn: parsed.data.cutIn,
        cutOut: parsed.data.cutOut,
        cutDuration,
      },
    });

    return ok(shot);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update shot.", 500);
  }
}

export async function DELETE(_: Request, ctx: ShotRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { shotId } = await ctx.params;

  try {
    const prisma = getPrisma();
    const shot = await prisma.shot.delete({
      where: { id: shotId },
    });

    return ok(shot);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete shot.", 500);
  }
}
