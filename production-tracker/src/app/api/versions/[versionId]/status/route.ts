import { z } from "zod";
import { VersionStatus } from "@/generated/prisma/enums";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getPrisma } from "@/lib/prisma";

const patchVersionStatusSchema = z.object({
  status: z.enum(VersionStatus),
});

type VersionRouteContext = {
  params: Promise<{ versionId: string }>;
};

export async function PATCH(request: Request, ctx: VersionRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { versionId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = patchVersionStatusSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid version status.", 422);
  }

  try {
    const prisma = getPrisma();
    const version = await prisma.version.update({
      where: { id: versionId },
      data: { status: parsed.data.status },
    });

    return ok(version);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update version status.", 500);
  }
}
