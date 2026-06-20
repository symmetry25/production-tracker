import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getDashboardStats, type DashboardStats } from "@/lib/dashboard-data";
import { buildOverviewResourcePulse } from "@/lib/overview-resource-pulse";
import { buildProducerAgendaRows } from "@/lib/producer-agenda-export";
import { buildProducerDecisionBrief } from "@/lib/producer-decision-brief";
import { getResourceBudgetData, type ResourceBudgetData } from "@/lib/resource-data";
import { buildScheduleSuggestions } from "@/lib/schedule-suggestions";
import { getTaskTableItems, type TaskTableItem } from "@/lib/task-data";

export async function GET(request: Request) {
  return getProducerAgendaReport(request, { auth, getDashboardStats, getTaskTableItems, getResourceBudgetData });
}

export async function getProducerAgendaReport(
  request: Request,
  deps: {
    auth: typeof auth;
    getDashboardStats: (projectId: string) => Promise<DashboardStats>;
    getTaskTableItems: (filters: { projectId: string }) => Promise<TaskTableItem[]>;
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

  try {
    const [stats, tasks, resourceData] = await Promise.all([
      deps.getDashboardStats(projectId),
      deps.getTaskTableItems({ projectId }),
      deps.getResourceBudgetData(projectId),
    ]);
    const scheduleSummary = buildScheduleSuggestions({ projectId, tasks, now });
    const resourcePulse = buildOverviewResourcePulse(resourceData, now.toISOString().slice(0, 10));
    const decisionBrief = buildProducerDecisionBrief({ projectId, resourcePulse, scheduleSummary });
    const rows = buildProducerAgendaRows({ stats, resourcePulse, decisionBrief, scheduleSummary });

    return ok({
      projectId,
      projectCode: stats.project.code,
      generatedAt: now.toISOString(),
      summary: {
        headlineTone: decisionBrief.headlineTone,
        holdCount: decisionBrief.holdCount,
        watchCount: decisionBrief.watchCount,
        blockedPaymentTotal: resourcePulse.blockedPaymentTotal,
        auditReadinessPct: resourcePulse.auditReadinessPct,
        scheduleHealthScore: scheduleSummary.healthScore,
      },
      rows,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to build producer agenda report.", 500);
  }
}
