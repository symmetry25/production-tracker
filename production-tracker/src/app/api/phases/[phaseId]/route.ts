import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { shouldUseDemoData } from "@/lib/demo-data";
import { getPrisma } from "@/lib/prisma";

const patchPhaseSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    startDate: z.iso.date().optional(),
    endDate: z.iso.date().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "Phase update payload cannot be empty." })
  .refine((value) => !value.startDate || !value.endDate || new Date(value.endDate) >= new Date(value.startDate), {
    message: "Phase end date cannot be before start date.",
    path: ["endDate"],
  });

type PhaseRouteContext = {
  params: Promise<{ phaseId: string }>;
};

export async function PATCH(request: Request, ctx: PhaseRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  if (shouldUseDemoData()) {
    return fail("Demo mode is handled locally. Connect DATABASE_URL to update phases.", 409);
  }

  const { phaseId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = patchPhaseSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid phase payload.", 422);
  }

  try {
    const prisma = getPrisma();
    const phase = await prisma.phase.update({
      where: { id: phaseId },
      data: {
        name: parsed.data.name,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    return ok({
      id: phase.id,
      name: phase.name,
      startDate: phase.startDate.toISOString().slice(0, 10),
      endDate: phase.endDate.toISOString().slice(0, 10),
      taskCount: phase._count.tasks,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update phase.", 500);
  }
}

export async function DELETE(_: Request, ctx: PhaseRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  if (shouldUseDemoData()) {
    return fail("Demo mode is handled locally. Connect DATABASE_URL to delete phases.", 409);
  }

  const { phaseId } = await ctx.params;

  try {
    const prisma = getPrisma();
    await prisma.phase.delete({ where: { id: phaseId } });
    return ok({ id: phaseId });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete phase.", 500);
  }
}
