import { z } from "zod";
import { Role } from "@/generated/prisma/enums";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { shouldUseDemoData } from "@/lib/demo-data";
import { getAdminUsers } from "@/lib/global-pages-data";
import { getPrisma } from "@/lib/prisma";

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().trim().toLowerCase(),
  role: z.enum(Role).default("ARTIST"),
  department: z.string().trim().optional().nullable(),
  avatarUrl: z.string().trim().optional().nullable(),
  capacity: z.number().int().min(0).max(14).default(5),
});

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const department = searchParams.get("department");

  try {
    const users = await getAdminUsers();
    return ok(department ? users.filter((user) => user.department === department) : users);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to load users.", 500);
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  if (session.user.role !== "ADMIN") {
    return fail("Only admins can create users.", 403);
  }

  if (shouldUseDemoData()) {
    return fail("Demo mode is read-only. Connect DATABASE_URL to create users.", 409);
  }

  const body = await request.json().catch(() => null);
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid user payload.", 422);
  }

  try {
    const prisma = getPrisma();
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        department: parsed.data.department || null,
        avatarUrl: parsed.data.avatarUrl || null,
        capacity: parsed.data.capacity,
      },
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
    return fail(error instanceof Error ? error.message : "Unable to create user.", 500);
  }
}
