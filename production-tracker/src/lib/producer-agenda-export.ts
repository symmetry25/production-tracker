import type { DashboardStats } from "@/lib/dashboard-data";
import type { TableCell } from "@/lib/csv";
import type { OverviewResourcePulse } from "@/lib/overview-resource-pulse";
import type { ProducerDecisionBrief, ProducerDecisionBriefItem } from "@/lib/producer-decision-brief";
import type { ScheduleSuggestionSummary } from "@/lib/schedule-suggestions";

export function buildProducerAgendaRows(input: {
  stats: DashboardStats;
  resourcePulse: OverviewResourcePulse;
  decisionBrief: ProducerDecisionBrief;
  scheduleSummary: ScheduleSuggestionSummary;
}): TableCell[][] {
  const { stats, resourcePulse, decisionBrief, scheduleSummary } = input;
  const milestone = stats.project.milestone ?? "Delivery";

  return [
    ["section", "item", "value", "detail", "owner"],
    ["project", "name", stats.project.name, stats.project.code, ""],
    ["project", "progress", `${stats.project.progressPct}%`, `${milestone} in ${stats.project.daysRemaining} days`, ""],
    ["project", "scope", `${stats.counts.shots} shots / ${stats.counts.assets} assets`, `${stats.counts.tasks} tasks / ${stats.counts.crew} crew`, ""],
    ["project", "versions", stats.counts.versions, "Latest review queue and approvals", "Producer"],
    ["finance", "total_budget", formatMoney(resourcePulse.totalBudget), `${resourcePulse.budgetBurnPct}% actual burn`, "Line Producer"],
    ["finance", "committed_cost", formatMoney(resourcePulse.committedTotal), `${resourcePulse.committedBurnPct}% committed`, "Line Producer"],
    ["finance", "reserve", formatMoney(resourcePulse.reserve), resourcePulse.recommendation, "Producer"],
    ["finance", "blocked_payments", formatMoney(resourcePulse.blockedPaymentTotal), `${resourcePulse.blockedPaymentCount} payments blocked`, "Line Producer"],
    ["finance", "audit_readiness", `${resourcePulse.auditReadinessPct}%`, `Primary risk: ${resourcePulse.primaryRiskLabel}`, "Production Accountant"],
    ["schedule", "health_score", `${scheduleSummary.healthScore}/100`, scheduleSummary.narrative, "1st AD"],
    ["schedule", "risk_count", `${scheduleSummary.criticalCount} critical / ${scheduleSummary.warningCount} watch`, `Budget risk ${formatMoney(scheduleSummary.totalBudgetRisk)}`, "Producer"],
    ...decisionBrief.items.map((item, index) => decisionItemRow(item, index)),
    ...scheduleSummary.suggestions.slice(0, 12).map((suggestion) => [
      "schedule",
      `${suggestion.severity} · ${suggestion.kind}`,
      suggestion.title,
      suggestion.action,
      suggestion.contextLabel,
    ]),
    ...stats.pctFinalByDept
      .slice()
      .sort((a, b) => a.pctFinal - b.pctFinal)
      .map((department) => [
        "department",
        department.department,
        `${department.pctFinal}% final`,
        `${department.final}/${department.total} final tasks`,
        "Department Lead",
      ]),
    ...stats.crew
      .filter((crew) => crew.loadPct >= 85)
      .sort((a, b) => b.loadPct - a.loadPct)
      .map((crew) => [
        "crew_load",
        crew.name,
        `${crew.loadPct}% load`,
        `${crew.department} · ${crew.role} · ${crew.taskCount} tasks`,
        "Resource Manager",
      ]),
  ];
}

function decisionItemRow(item: ProducerDecisionBriefItem, index: number): TableCell[] {
  return [
    "decision",
    `${String(index + 1).padStart(2, "0")} · ${decisionKindLabels[item.kind]} · ${toneLabels[item.tone]}`,
    item.title,
    item.detail,
    item.href,
  ];
}

function formatMoney(value: number) {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

const decisionKindLabels: Record<ProducerDecisionBriefItem["kind"], string> = {
  finance: "Payment",
  audit: "Audit",
  budget: "Budget",
  schedule: "Schedule",
  review: "Review",
};

const toneLabels: Record<ProducerDecisionBriefItem["tone"], string> = {
  clear: "Clear",
  watch: "Watch",
  hold: "Action needed",
};
