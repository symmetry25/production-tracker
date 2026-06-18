import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { createScoreDimensionAsync, listScoreDimensionsAsync } from "@/lib/scoring";

const dimensionSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().default(""),
  weight: z.number().positive().default(1),
  maxScore: z.number().int().positive().default(100),
  minScore: z.number().int().min(0).default(0),
  category: z.string().trim().default("通用"),
  projectId: z.string().trim().optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);
  return ok(await listScoreDimensionsAsync());
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);
  const parsed = dimensionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid dimension payload.", 422);
  return ok(await createScoreDimensionAsync(parsed.data));
}
