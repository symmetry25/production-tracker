import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { installTemplate } from "@/lib/custom-data-store";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

const installTemplateSchema = z.object({
  projectId: z.string().trim().optional().nullable(),
  customName: z.string().trim().optional().nullable(),
});

export async function POST(request: Request, ctx: RouteParams<{ templateId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { templateId } = await getRouteParams(ctx);
  const body = await request.json().catch(() => ({}));
  const parsed = installTemplateSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid install payload.", 422);

  const entity = installTemplate(templateId, parsed.data);
  return entity ? ok(entity) : fail("Template not found.", 404);
}
