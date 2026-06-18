import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { deleteRecordNote } from "@/lib/custom-data-store";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

export async function DELETE(_: Request, ctx: RouteParams<{ recordId: string; noteId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { recordId, noteId } = await getRouteParams(ctx);
  const note = deleteRecordNote(recordId, noteId);
  return note ? ok(note) : fail("Note not found.", 404);
}
