import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { shouldUseDemoData } from "@/lib/demo-data";
import { getPrisma } from "@/lib/prisma";
import { z } from "zod";

const createSequenceSchema = z.object({
  code: z.string().trim().min(1).max(24).transform((value) => value.toUpperCase()),
  description: z.string().trim().optional(),
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
    if (shouldUseDemoData()) {
      const { getDemoShotTableItems } = await import("@/lib/demo-data");
      const sequences = Array.from(
        getDemoShotTableItems(projectId).reduce((map, shot) => {
          const current = map.get(shot.sequenceCode) ?? { code: shot.sequenceCode, status: shot.status, shots: 0 };
          current.shots += 1;
          map.set(shot.sequenceCode, current);
          return map;
        }, new Map<string, { code: string; status: string; shots: number }>()),
      ).map(([code, sequence]) => ({
        id: `demo-sequence-${code.toLowerCase()}`,
        code,
        description: `${sequence.shots} shots`,
        status: sequence.status,
        projectId,
        _count: { shots: sequence.shots },
      }));

      return ok(sequences);
    }

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

export async function POST(request: Request, ctx: ProjectRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  if (shouldUseDemoData()) {
    return fail("Demo mode is read-only. Connect DATABASE_URL to create sequences.", 409);
  }

  const { projectId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = createSequenceSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid sequence payload.", 422);
  }

  try {
    const prisma = getPrisma();
    const sequence = await prisma.sequence.create({
      data: {
        projectId,
        code: parsed.data.code,
        description: parsed.data.description || null,
      },
    });

    return ok(sequence);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create sequence.", 500);
  }
}
