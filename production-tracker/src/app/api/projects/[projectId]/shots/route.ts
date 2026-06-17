import { z } from "zod";
import { TaskStatus } from "@/generated/prisma/enums";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getPrisma } from "@/lib/prisma";
import { getShotTableItems } from "@/lib/shot-data";
import { PIPELINE_STEPS } from "@/lib/status-colors";

const createShotSchema = z.object({
  code: z.string().trim().min(2).max(40),
  description: z.string().trim().optional(),
  sequenceCode: z.string().trim().min(1).max(24).default("MAIN"),
  cutIn: z.number().int().optional(),
  cutOut: z.number().int().optional(),
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
    return ok(await getShotTableItems(projectId));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to load shots.", 500);
  }
}

export async function POST(request: Request, ctx: ProjectRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { projectId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = createShotSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid shot payload.", 422);
  }

  try {
    const prisma = getPrisma();
    const sequence = await prisma.sequence.upsert({
      where: { projectId_code: { projectId, code: parsed.data.sequenceCode.toUpperCase() } },
      update: {},
      create: { projectId, code: parsed.data.sequenceCode.toUpperCase() },
    });

    const shot = await prisma.shot.create({
      data: {
        projectId,
        sequenceId: sequence.id,
        code: parsed.data.code.toUpperCase(),
        description: parsed.data.description || null,
        cutIn: parsed.data.cutIn,
        cutOut: parsed.data.cutOut,
        cutDuration:
          typeof parsed.data.cutIn === "number" && typeof parsed.data.cutOut === "number"
            ? Math.max(0, parsed.data.cutOut - parsed.data.cutIn)
            : null,
        tasks: {
          create: PIPELINE_STEPS.map((step) => ({
            name: step,
            status: TaskStatus.WAITING_TO_START,
          })),
        },
      },
    });

    return ok(shot);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create shot.", 500);
  }
}
