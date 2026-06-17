import { z } from "zod";
import { TaskStatus } from "@/generated/prisma/enums";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { shouldUseDemoData } from "@/lib/demo-data";
import { getPrisma } from "@/lib/prisma";

const patchSequenceSchema = z.object({
  code: z.string().trim().min(1).max(24).transform((value) => value.toUpperCase()).optional(),
  description: z.string().trim().optional().nullable(),
  status: z.enum(TaskStatus).optional(),
});

type SequenceRouteContext = {
  params: Promise<{ sequenceId: string }>;
};

export async function PATCH(request: Request, ctx: SequenceRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  if (shouldUseDemoData()) {
    return fail("Demo mode is read-only. Connect DATABASE_URL to update sequences.", 409);
  }

  const { sequenceId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = patchSequenceSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid sequence payload.", 422);
  }

  try {
    const prisma = getPrisma();
    const sequence = await prisma.sequence.update({
      where: { id: sequenceId },
      data: parsed.data,
    });

    return ok(sequence);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update sequence.", 500);
  }
}
