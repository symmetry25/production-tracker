import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getTemplate } from "@/lib/custom-data-store";
import { getRouteParams, type RouteParams } from "@/lib/route-context";

export async function GET(_: Request, ctx: RouteParams<{ templateId: string }>) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { templateId } = await getRouteParams(ctx);
  const template = getTemplate(templateId);
  return template ? ok(template) : fail("Template not found.", 404);
}
