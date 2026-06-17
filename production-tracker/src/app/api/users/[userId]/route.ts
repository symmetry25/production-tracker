import { z } from "zod";
import { Role } from "@/generated/prisma/enums";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { shouldUseDemoData } from "@/lib/demo-data";
import { getPrisma } from "@/lib/prisma";

const patchUserSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.email().trim().toLowerCase().optional(),
  role: z.enum(Role).optional(),
  department: z.string().trim().optional().nullable(),
  avatarUrl: z.string().trim().optional().nullable(),
  capacity: z.number().int().min(0).max(14).optional(),
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
    return fail("Only admins can update users.", 403);
  }

  if (shouldUseDemoData()) {
    return fail("Demo mode is read-only. Connect DATABASE_URL to update users.", 409);
  }

  const { userId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = patchUserSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid user payload.", 422);
  }

  try {
    const prisma = getPrisma();
    const user = await prisma.user.update({
      where: { id: userId },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        avatarUrl: true,
        capacity: true,
        createdAt: true,
      },
    });

    return ok(user);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update user.", 500);
  }
}
