import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getPrisma } from "@/lib/prisma";

type CalendarExceptionRouteContext = {
  params: Promise<{ exceptionId: string }>;
};

export async function DELETE(_: Request, ctx: CalendarExceptionRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
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
