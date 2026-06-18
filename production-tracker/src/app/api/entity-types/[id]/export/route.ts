import { auth } from "@/auth";
import { fail } from "@/lib/api-response";
import { getEntityTypeAsync, listRecordsAsync } from "@/lib/custom-data-store";
import { buildWorkbookBuffer } from "@/lib/excel";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

export async function GET(_: Request, ctx: RouteParams<{ id: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { id } = await getRouteParams(ctx);
  const entity = await getEntityTypeAsync(id);
  const records = await listRecordsAsync(id);
  if (!entity || !records) return fail("Entity type not found.", 404);

  const buffer = buildWorkbookBuffer(records.records, entity.fields);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${entity.slug}.xlsx"`,
    },
  });
}
