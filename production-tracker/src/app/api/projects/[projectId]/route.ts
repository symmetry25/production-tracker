import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getDashboardStats } from "@/lib/dashboard-data";
import { shouldUseDemoData } from "@/lib/demo-data";
import { getPrisma } from "@/lib/prisma";

const patchProjectSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  code: z
    .string()
    .trim()
    .min(2)
    .max(16)
    .transform((value) => value.toUpperCase().replaceAll(" ", "_"))
    .optional(),
  description: z.string().trim().optional().nullable(),
  thumbnailUrl: z.string().trim().optional().nullable(),
  startDate: z.iso.date().optional(),
  dueDate: z.iso.date().optional(),
  milestone: z.string().trim().optional().nullable(),
  milestoneDate: z.iso.date().optional().nullable().or(z.literal("")),
  status: z.string().trim().min(1).max(32).optional(),
  isTemplate: z.boolean().optional(),
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
      return ok(await getDashboardStats(projectId));
    }

    const prisma = getPrisma();
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        sequences: { orderBy: { code: "asc" }, include: { _count: { select: { shots: true } } } },
        shots: { select: { id: true, code: true, status: true } },
        assets: { select: { id: true, name: true, type: true, status: true } },
        phases: { orderBy: { startDate: "asc" } },
        workOrders: { orderBy: { createdAt: "desc" } },
        calExceptions: { orderBy: { date: "asc" } },
        _count: { select: { shots: true, assets: true, sequences: true, phases: true, workOrders: true } },
      },
    });

    if (!project || project.status === "deleted") {
      return fail("Project not found.", 404);
    }

    return ok(project);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to load project.", 500);
  }
}

export async function PATCH(request: Request, ctx: ProjectRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  if (shouldUseDemoData()) {
    return fail("Demo mode is read-only. Connect DATABASE_URL to edit projects.", 409);
  }

  const { projectId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = patchProjectSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid project payload.", 422);
  }

  try {
    const prisma = getPrisma();
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: parsed.data.name,
        code: parsed.data.code,
        description: parsed.data.description,
        thumbnailUrl: parsed.data.thumbnailUrl,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
        milestone: parsed.data.milestone,
        milestoneDate:
          parsed.data.milestoneDate === undefined
            ? undefined
            : parsed.data.milestoneDate
              ? new Date(parsed.data.milestoneDate)
              : null,
        status: parsed.data.status,
        isTemplate: parsed.data.isTemplate,
      },
    });

    return ok(project);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update project.", 500);
  }
}

export async function DELETE(_: Request, ctx: ProjectRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  if (session.user.role !== "ADMIN") {
    return fail("Only admins can delete projects.", 403);
  }

  if (shouldUseDemoData()) {
    return fail("Demo mode is read-only. Connect DATABASE_URL to delete projects.", 409);
  }

  const { projectId } = await ctx.params;

  try {
    const prisma = getPrisma();
    const project = await prisma.project.update({
      where: { id: projectId },
      data: { status: "deleted" },
    });

    return ok(project);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete project.", 500);
  }
}
