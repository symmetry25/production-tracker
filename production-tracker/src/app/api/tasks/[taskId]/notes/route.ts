import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getPrisma } from "@/lib/prisma";

const createNoteSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  versionId: z.string().min(1).optional().nullable(),
});

type TaskRouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function GET(_: Request, ctx: TaskRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { taskId } = await ctx.params;

  try {
    const prisma = getPrisma();
    const notes = await prisma.note.findMany({
      where: { taskId },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
        version: {
          select: {
            id: true,
            name: true,
            number: true,
          },
        },
      },
    });

    return ok(notes);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to load notes.", 500);
  }
}

export async function POST(request: Request, ctx: TaskRouteContext) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return fail("Unauthorized", 401);
  }

  const { taskId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = createNoteSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid note payload.", 422);
  }

  try {
    const prisma = getPrisma();
    const note = await prisma.note.create({
      data: {
        taskId,
        versionId: parsed.data.versionId ?? null,
        content: parsed.data.content,
        authorId: userId,
      },
    });

    return ok(note);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create note.", 500);
  }
}
