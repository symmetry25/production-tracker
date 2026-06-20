import type { OverviewResourcePulse, OverviewResourcePulseGrade } from "@/lib/overview-resource-pulse";
import type { ScheduleSuggestion, ScheduleSuggestionSummary } from "@/lib/schedule-suggestions";

export type ProducerDecisionBriefKind = "finance" | "audit" | "budget" | "schedule" | "review";

export type ProducerDecisionBriefItem = {
  id: string;
  kind: ProducerDecisionBriefKind;
  tone: OverviewResourcePulseGrade;
  title: string;
  detail: string;
  meta: string;
  href: string;
  priority: number;
};

export type ProducerDecisionBrief = {
  headlineTone: OverviewResourcePulseGrade;
  holdCount: number;
  watchCount: number;
  items: ProducerDecisionBriefItem[];
};

export function buildProducerDecisionBrief(input: {
  projectId: string;
  resourcePulse: OverviewResourcePulse;
  scheduleSummary: ScheduleSuggestionSummary;
  maxItems?: number;
}): ProducerDecisionBrief {
  const maxItems = input.maxItems ?? 6;
  const items = [
    ...buildResourceDecisionItems(input.resourcePulse),
    ...input.scheduleSummary.suggestions.map((suggestion) => buildScheduleDecisionItem(input.projectId, suggestion)),
  ]
    .sort(sortDecisionItems)
    .slice(0, maxItems);

  return {
    headlineTone: resolveHeadlineTone(items),
    holdCount: items.filter((item) => item.tone === "hold").length,
    watchCount: items.filter((item) => item.tone === "watch").length,
    items,
  };
}

function buildResourceDecisionItems(pulse: OverviewResourcePulse): ProducerDecisionBriefItem[] {
  const items: ProducerDecisionBriefItem[] = [];

  if (pulse.blockedPaymentTotal > 0) {
    items.push({
      id: "finance-blocked-payment",
      kind: "finance",
      tone: "hold",
      title: `冻结付款 ${formatMoney(pulse.blockedPaymentTotal)}`,
      detail: pulse.recommendation,
      meta: `${pulse.blockedPaymentCount} payments`,
      href: pulse.actionHref,
      priority: 1000 + pulse.blockedPaymentTotal,
    });
  }

  if (pulse.missingDocumentCount > 0) {
    items.push({
      id: "audit-missing-docs",
      kind: "audit",
      tone: pulse.auditReadinessPct < 70 || pulse.missingDocumentCount >= 3 ? "hold" : "watch",
      title: `补齐审计材料 ${pulse.missingDocumentCount} 份`,
      detail: `审计完整度 ${pulse.auditReadinessPct}%，先补齐材料再进入付款放行。`,
      meta: `${pulse.auditReadinessPct}% ready`,
      href: pulse.actionHref,
      priority: 900 + pulse.missingDocumentCount,
    });
  }

  if (pulse.reserve < 0) {
    items.push({
      id: "budget-reserve-deficit",
      kind: "budget",
      tone: "hold",
      title: `预算余量缺口 ${formatMoney(Math.abs(pulse.reserve))}`,
      detail: "已承诺金额超过总预算，建议暂停新增采购并复核超支部门。",
      meta: `${pulse.committedBurnPct}% committed`,
      href: `/app/projects/${encodeURIComponent(pulse.projectId)}/resources`,
      priority: 850 + Math.abs(pulse.reserve),
    });
  } else if (pulse.committedBurnPct > 88) {
    items.push({
      id: "budget-commit-watch",
      kind: "budget",
      tone: "watch",
      title: `已承诺预算 ${pulse.committedBurnPct}%`,
      detail: "承诺金额接近预算控制线，建议后续变更都走制片审批。",
      meta: `${formatMoney(pulse.reserve)} reserve`,
      href: `/app/projects/${encodeURIComponent(pulse.projectId)}/resources`,
      priority: 520 + pulse.committedBurnPct,
    });
  }

  return items;
}

function buildScheduleDecisionItem(projectId: string, suggestion: ScheduleSuggestion): ProducerDecisionBriefItem {
  const isReview = suggestion.kind === "review_bottleneck";

  return {
    id: `schedule-${suggestion.id}`,
    kind: isReview ? "review" : "schedule",
    tone: suggestion.severity === "info" ? "clear" : "watch",
    title: suggestion.title,
    detail: suggestion.action,
    meta: suggestion.budgetImpact > 0 ? formatMoney(suggestion.budgetImpact) : `${suggestion.impactDays}d`,
    href: `/app/projects/${encodeURIComponent(projectId)}/tasks?task=${encodeURIComponent(suggestion.taskId)}`,
    priority: (suggestion.severity === "critical" ? 700 : suggestion.severity === "warning" ? 450 : 120) + suggestion.impactDays + Math.round(suggestion.budgetImpact / 1000),
  };
}

function sortDecisionItems(a: ProducerDecisionBriefItem, b: ProducerDecisionBriefItem) {
  return b.priority - a.priority || toneRank(b.tone) - toneRank(a.tone) || a.title.localeCompare(b.title);
}

function resolveHeadlineTone(items: ProducerDecisionBriefItem[]): OverviewResourcePulseGrade {
  if (items.some((item) => item.tone === "hold")) return "hold";
  if (items.some((item) => item.tone === "watch")) return "watch";
  return "clear";
}

function toneRank(tone: OverviewResourcePulseGrade) {
  if (tone === "hold") return 3;
  if (tone === "watch") return 2;
  return 1;
}

function formatMoney(value: number) {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
