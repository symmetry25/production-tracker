import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { buildProfessionalResourceReport } from "@/lib/professional-resource-report";
import { getResourceBudgetData, type ResourceBudgetData } from "@/lib/resource-data";
import { buildResourceReportSummary } from "@/lib/resource-report";

export async function GET(request: Request) {
  return getProfessionalResourceReport(request, { auth, getResourceBudgetData });
}

export async function getProfessionalResourceReport(
  request: Request,
  deps: {
    auth: typeof auth;
    getResourceBudgetData: (projectId: string) => Promise<ResourceBudgetData>;
    now?: () => Date;
  },
) {
  const session = await deps.auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return fail("projectId is required.", 422);
  }

  const now = deps.now?.() ?? new Date();
  const reportDate = now.toISOString().slice(0, 10);

  try {
    const data = await deps.getResourceBudgetData(projectId);
    const summary = buildResourceReportSummary(data, reportDate);
    const report = buildProfessionalResourceReport({ data, summary, reportDate });

    return ok({
      projectId,
      generatedAt: now.toISOString(),
      report,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to build professional resource report.", 500);
  }
}
