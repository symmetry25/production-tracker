import type { ResourceBudgetData } from "@/lib/resource-data";
import { buildResourceReportSummary } from "@/lib/resource-report";

export type OverviewResourcePulseGrade = "clear" | "watch" | "hold";

export type OverviewResourcePulseSignal = {
  id: string;
  kind: "blocked-payment" | "audit-docs" | "department-risk" | "vendor-review" | "cash-reserve";
  label: string;
  value: number;
  tone: OverviewResourcePulseGrade;
};

export type OverviewResourcePulse = {
  projectId: string;
  grade: OverviewResourcePulseGrade;
  totalBudget: number;
  actualTotal: number;
  committedTotal: number;
  budgetBurnPct: number;
  committedBurnPct: number;
  reserve: number;
  blockedPaymentTotal: number;
  blockedPaymentCount: number;
  missingDocumentCount: number;
  auditReadinessPct: number;
  primaryRiskLabel: string;
  recommendation: string;
  actionHref: string;
  signals: OverviewResourcePulseSignal[];
};

export function buildOverviewResourcePulse(data: ResourceBudgetData, todayIso = new Date().toISOString().slice(0, 10)): OverviewResourcePulse {
  const summary = buildResourceReportSummary(data, todayIso);
  const primaryRiskLabel = resolvePrimaryRiskLabel(summary);
  const signals = buildSignals(summary);

  return {
    projectId: data.project.id,
    grade: summary.reportGrade,
    totalBudget: data.project.totalBudget,
    actualTotal: data.project.actualTotal,
    committedTotal: data.project.committedTotal,
    budgetBurnPct: summary.budgetBurnPct,
    committedBurnPct: summary.committedBurnPct,
    reserve: summary.reserve,
    blockedPaymentTotal: summary.blockedPaymentTotal,
    blockedPaymentCount: summary.blockedPaymentCount,
    missingDocumentCount: summary.missingDocumentCount,
    auditReadinessPct: summary.auditReadinessPct,
    primaryRiskLabel,
    recommendation: summary.recommendation,
    actionHref: `/app/projects/${encodeURIComponent(data.project.id)}/resources/report`,
    signals,
  };
}

function buildSignals(summary: ReturnType<typeof buildResourceReportSummary>): OverviewResourcePulseSignal[] {
  const signals: OverviewResourcePulseSignal[] = [];

  if (summary.blockedPaymentTotal > 0) {
    signals.push({
      id: "blocked-payment",
      kind: "blocked-payment",
      label: "Blocked payments",
      value: summary.blockedPaymentTotal,
      tone: "hold",
    });
  }

  if (summary.missingDocumentCount > 0) {
    signals.push({
      id: "audit-docs",
      kind: "audit-docs",
      label: "Missing evidence",
      value: summary.missingDocumentCount,
      tone: summary.missingDocumentCount >= 3 ? "hold" : "watch",
    });
  }

  if (summary.overBudgetDepartments.length > 0) {
    signals.push({
      id: "department-risk",
      kind: "department-risk",
      label: "Department exposure",
      value: summary.overBudgetDepartments.length,
      tone: "hold",
    });
  }

  if (summary.watchVendors.length > 0) {
    signals.push({
      id: "vendor-review",
      kind: "vendor-review",
      label: "Vendor review",
      value: summary.watchVendors.length,
      tone: "watch",
    });
  }

  if (summary.reserve < 0) {
    signals.push({
      id: "cash-reserve",
      kind: "cash-reserve",
      label: "Reserve deficit",
      value: Math.abs(summary.reserve),
      tone: "hold",
    });
  }

  return signals;
}

function resolvePrimaryRiskLabel(summary: ReturnType<typeof buildResourceReportSummary>) {
  if (summary.watchVendors.length > 0) return summary.watchVendors[0];
  if (summary.overBudgetDepartments.length > 0) return summary.overBudgetDepartments[0];
  if (summary.blockedPaymentCount > 0) return "付款关口";
  if (summary.missingDocumentCount > 0) return "审计材料";
  return summary.topDepartmentName;
}
