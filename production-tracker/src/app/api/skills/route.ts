import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { createSkillAsync, listSkillsAsync } from "@/lib/scoring";

const skillSchema = z.object({
  name: z.string().trim().min(1),
  category: z.string().trim().min(1),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);
  return ok(await listSkillsAsync());
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);
  const parsed = skillSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid skill payload.", 422);
  return ok(await createSkillAsync(parsed.data));
}
