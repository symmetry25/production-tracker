import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { importRecords } from "@/lib/custom-data-store";
import { parseWorkbook } from "@/lib/excel";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

const importSchema = z.object({
  sourceText: z.string().optional(),
  mapping: z.record(z.string(), z.string()).optional(),
  createdBy: z.string().trim().optional(),
});

export async function POST(request: Request, ctx: RouteParams<{ id: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { id } = await getRouteParams(ctx);
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("file is required.", 422);
    const parsedWorkbook = parseWorkbook(await file.arrayBuffer());
    const sourceText = [parsedWorkbook.headers.join("\t"), ...parsedWorkbook.rows.map((row) => parsedWorkbook.headers.map((header) => row[header] ?? "").join("\t"))].join("\n");
    const mappingValue = form.get("mapping");
    const mapping = typeof mappingValue === "string" && mappingValue ? JSON.parse(mappingValue) : undefined;
    const summary = importRecords(id, { sourceText, mapping, createdBy: session.user.name ?? "导入向导" });
    return summary ? ok(summary) : fail("Entity type not found.", 404);
  }

  const parsed = importSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !parsed.data.sourceText) return fail(parsed.error?.issues[0]?.message ?? "sourceText is required.", 422);

  const summary = importRecords(id, { ...parsed.data, sourceText: parsed.data.sourceText, createdBy: parsed.data.createdBy ?? session.user.name ?? "导入向导" });
  return summary ? ok(summary) : fail("Entity type not found.", 404);
}
