import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { recognizeDocument } from "@/lib/ai-recognition";
import { getEntityTypeAsync } from "@/lib/custom-data-store";

const recognizeSchema = z.object({
  imageBase64: z.string().optional(),
  imageType: z.string().optional(),
  mode: z.enum(["invoice", "table", "document", "card", "custom"]).default("document"),
  entityTypeId: z.string().optional().nullable(),
  recordId: z.string().optional().nullable(),
  fields: z.array(z.record(z.string(), z.unknown())).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const parsed = recognizeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid recognition payload.", 422);

  const entity = parsed.data.entityTypeId ? await getEntityTypeAsync(parsed.data.entityTypeId) : null;
  const fields = parsed.data.fields ?? entity?.fields ?? [];
  return ok(await recognizeDocument({ ...parsed.data, fields: fields as never }));
}
