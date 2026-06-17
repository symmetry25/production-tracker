import { z } from "zod";
import { CalendarExceptionType } from "@/generated/prisma/enums";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getPrisma } from "@/lib/prisma";

const createCalendarExceptionSchema = z.object({
  date: z.iso.date(),
  type: z.enum(CalendarExceptionType),
  description: z.string().trim().optional(),
  hoursWorked: z.number().int().min(0).max(24).default(0),
  projectId: z.string().min(1).optional().nullable(),
  inheritedFrom: z.string().trim().optional().nullable(),
});

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  try {
    const prisma = getPrisma();
    const exceptions = await prisma.calendarException.findMany({
      where: projectId ? { OR: [{ projectId }, { projectId: null }] } : {},
      orderBy: { date: "asc" },
    });

    return ok(exceptions);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to load calendar exceptions.", 500);
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = createCalendarExceptionSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid calendar exception payload.", 422);
  }

  try {
    const prisma = getPrisma();
    const exception = await prisma.calendarException.create({
      data: {
        date: new Date(parsed.data.date),
        type: parsed.data.type,
        description: parsed.data.description ?? null,
        hoursWorked: parsed.data.hoursWorked,
        projectId: parsed.data.projectId ?? null,
        inheritedFrom: parsed.data.inheritedFrom ?? null,
      },
    });

    return ok(exception);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create calendar exception.", 500);
  }
}
