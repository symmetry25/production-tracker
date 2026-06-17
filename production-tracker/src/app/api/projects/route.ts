import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getPrisma } from "@/lib/prisma";
import { getProjectGridItems } from "@/lib/project-data";

const createProjectSchema = z.object({
  name: z.string().trim().min(2, "Project name is required."),
  code: z
    .string()
    .trim()
    .min(2, "Project code is required.")
    .max(16, "Project code must be short.")
    .transform((value) => value.toUpperCase().replaceAll(" ", "_")),
  description: z.string().trim().optional(),
  thumbnailUrl: z.string().trim().optional(),
  startDate: z.iso.date(),
  dueDate: z.iso.date(),
  milestone: z.string().trim().optional(),
  milestoneDate: z.iso.date().optional().or(z.literal("")),
});

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  try {
    const projects = await getProjectGridItems();
    return ok(projects);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to load projects.", 500);
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid project payload.", 422);
  }

  try {
    const prisma = getPrisma();
    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        code: parsed.data.code,
        description: parsed.data.description || null,
        thumbnailUrl: parsed.data.thumbnailUrl || null,
        startDate: new Date(parsed.data.startDate),
        dueDate: new Date(parsed.data.dueDate),
        milestone: parsed.data.milestone || null,
        milestoneDate: parsed.data.milestoneDate ? new Date(parsed.data.milestoneDate) : null,
      },
    });

    return ok(project);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create project.", 500);
  }
}
