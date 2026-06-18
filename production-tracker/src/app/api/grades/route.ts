import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { createGrade, listGrades } from "@/lib/scoring";

const gradeSchema = z.object({
  name: z.string().trim().min(1),
  code: z.enum(["A", "B", "C", "D", "E", "F", "G"]),
  department: z.string().trim().optional().nullable(),
  minScore: z.number(),
  maxScore: z.number(),
  salaryMin: z.number().optional().nullable(),
  salaryMax: z.number().optional().nullable(),
  color: z.string().trim().min(1),
  benefits: z.array(z.string()).default([]),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);
  return ok(listGrades());
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);
  const parsed = gradeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid grade payload.", 422);
  return ok(createGrade({ ...parsed.data, department: parsed.data.department ?? null, salaryMin: parsed.data.salaryMin ?? null, salaryMax: parsed.data.salaryMax ?? null }));
}
