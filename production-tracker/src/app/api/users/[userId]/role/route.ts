import { z } from "zod";
import { Role } from "@/generated/prisma/enums";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { shouldUseDemoData } from "@/lib/demo-data";
import { getPrisma } from "@/lib/prisma";

const patchUserRoleSchema = z.object({
  role: z.enum(Role),
});

type UserRouteContext = {
  params: Promise<{ userId: string }>;
};

export async function PATCH(request: Request, ctx: UserRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  if (session.user.role !== "ADMIN") {
    return fail("Only admins can update roles.", 403);
  }

  if (shouldUseDemoData()) {
    return fail("Demo mode is read-only. Connect DATABASE_URL to update roles.", 409);
  }

  const { userId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = patchUserRoleSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid role payload.", 422);
  }

  try {
    const prisma = getPrisma();
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: parsed.data.role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        capacity: true,
      },
    });

    return ok(user);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update role.", 500);
  }
}
