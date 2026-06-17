import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getPrisma } from "@/lib/prisma";

type NoteRouteContext = {
  params: Promise<{ noteId: string }>;
};

export async function DELETE(_: Request, ctx: NoteRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { noteId } = await ctx.params;

  try {
    const prisma = getPrisma();
    const note = await prisma.note.delete({
      where: { id: noteId },
    });

    return ok(note);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete note.", 500);
  }
}
