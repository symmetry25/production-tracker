import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { deleteRecordFile } from "@/lib/custom-data-store";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

export async function DELETE(_: Request, ctx: RouteParams<{ recordId: string; fileId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { recordId, fileId } = await getRouteParams(ctx);
  const file = deleteRecordFile(recordId, fileId);
  return file ? ok(file) : fail("File not found.", 404);
}
