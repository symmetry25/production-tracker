import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getProjectPhases } from "@/lib/phase-work-order-data";
import { getPrisma } from "@/lib/prisma";

const createPhaseSchema = z.object({
  name: z.string().trim().min(2),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
});

type ProjectRouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function GET(_: Request, ctx: ProjectRouteContext) {
  const session = await auth();

  if (!session?.user) return fail("Unauthorized", 401);

  const { projectId } = await ctx.params;
  return ok(await getProjectPhases(projectId));
}

export async function POST(request: Request, ctx: ProjectRouteContext) {
  const session = await auth();

  if (!session?.user) return fail("Unauthorized", 401);

  const { projectId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = createPhaseSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid phase payload.", 422);
  }

  try {
    const prisma = getPrisma();
    const phase = await prisma.phase.create({
      data: {
        projectId,
        name: parsed.data.name,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
      },
    });

    return ok(phase);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create phase.", 500);
  }
}
