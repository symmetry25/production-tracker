import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { createEntityTypeAsync, listEntityTypesAsync } from "@/lib/custom-data-store";

const createEntityTypeSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional(),
  industry: z.enum(["vfx", "retail", "manufacturing", "hr", "generic"]).optional(),
  icon: z.string().trim().optional(),
  color: z.string().trim().optional(),
  projectId: z.string().trim().optional().nullable(),
  fields: z.array(z.record(z.string(), z.unknown())).optional(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  return ok(
    await listEntityTypesAsync({
      projectId: searchParams.has("projectId") ? searchParams.get("projectId") : undefined,
      industry: searchParams.get("industry"),
    }),
  );
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  const parsed = createEntityTypeSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid entity type payload.", 422);

  try {
    return ok(await createEntityTypeAsync({ ...parsed.data, fields: parsed.data.fields as never }));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create entity type.", 422);
  }
}
