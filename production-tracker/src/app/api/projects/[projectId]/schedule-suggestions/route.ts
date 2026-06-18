import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { buildScheduleSuggestionsWithAi } from "@/lib/schedule-suggestions";
import { getTaskTableItems } from "@/lib/task-data";

type ProjectRouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function GET(_: Request, ctx: ProjectRouteContext) {
  return getScheduleSuggestions(_, ctx, { auth, getTaskTableItems, buildScheduleSuggestionsWithAi });
}

export async function getScheduleSuggestions(
  _: Request,
  ctx: ProjectRouteContext,
  deps: {
    auth: typeof auth;
    getTaskTableItems: typeof getTaskTableItems;
    buildScheduleSuggestionsWithAi: typeof buildScheduleSuggestionsWithAi;
  },
) {
  const session = await deps.auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { projectId } = await ctx.params;

  try {
    const tasks = await deps.getTaskTableItems({ projectId });
    return ok(await deps.buildScheduleSuggestionsWithAi({ projectId, tasks }));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to build schedule suggestions.", 500);
  }
}
