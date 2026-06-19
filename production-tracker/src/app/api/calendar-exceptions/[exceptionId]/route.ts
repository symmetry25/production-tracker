import { z } from "zod";
import { CalendarExceptionType } from "@/generated/prisma/enums";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { canManageSchedule } from "@/lib/permissions";
import { getPrisma } from "@/lib/prisma";

type CalendarExceptionRouteContext = {
  params: Promise<{ exceptionId: string }>;
};

const updateCalendarExceptionSchema = z
  .object({
    date: z.iso.date().optional(),
    type: z.enum(CalendarExceptionType).optional(),
    description: z.string().trim().optional().nullable(),
    hoursWorked: z.number().int().min(0).max(24).optional(),
    projectId: z.string().min(1).optional().nullable(),
    inheritedFrom: z.string().trim().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "Calendar exception update payload cannot be empty." });

export async function PATCH(request: Request, ctx: CalendarExceptionRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  if (!canManageSchedule(session.user)) {
    return fail("Only producers and supervisors can update calendar exceptions.", 403);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateCalendarExceptionSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid calendar exception payload.", 422);
  }

  const { exceptionId } = await ctx.params;
  const updateData = Object.fromEntries(
    Object.entries({
      ...parsed.data,
      date: parsed.data.date ? new Date(parsed.data.date) : undefined,
    }).filter(([, value]) => value !== undefined),
  );

  try {
    const prisma = getPrisma();
    const exception = await prisma.calendarException.update({
      where: { id: exceptionId },
      data: updateData,
    });

    return ok(exception);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update calendar exception.", 500);
  }
}

export async function DELETE(_: Request, ctx: CalendarExceptionRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  if (!canManageSchedule(session.user)) {
    return fail("Only producers and supervisors can delete calendar exceptions.", 403);
  }

  const { exceptionId } = await ctx.params;

  try {
    const prisma = getPrisma();
    await prisma.calendarException.delete({ where: { id: exceptionId } });
    return ok({ id: exceptionId });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete calendar exception.", 500);
  }
}
