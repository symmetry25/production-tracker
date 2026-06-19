import type { ResourceBudgetData } from "@/lib/resource-data";

export type ResourceReportSummary = {
  budgetBurnPct: number;
  committedBurnPct: number;
  reserve: number;
  blockedPaymentTotal: number;
  blockedPaymentCount: number;
  dueSoonPaymentTotal: number;
  dueSoonPaymentCount: number;
  missingDocumentCount: number;
  auditReadinessPct: number;
  overBudgetDepartments: string[];
  watchVendors: string[];
  topDepartmentName: string;
  topDepartmentAmount: number;
  topVendorName: string;
  topVendorAmount: number;
  peopleCostTotal: number;
  averageTrustScore: number;
  recommendation: string;
  reportGrade: "clear" | "watch" | "hold";
};

export function buildResourceReportSummary(data: ResourceBudgetData, todayIso = "2026-06-18"): ResourceReportSummary {
  const blockedPayments = data.payments.filter((payment) => payment.status === "blocked");
  const dueSoonPayments = data.payments.filter((payment) => payment.status !== "paid" && daysBetween(todayIso, payment.dueDate) <= 7);
  const requiredDocuments = data.documents.reduce((sum, document) => sum + document.required, 0);
  const receivedDocuments = data.documents.reduce((sum, document) => sum + document.received, 0);
  const missingDocumentCount = data.documents.reduce((sum, document) => sum + Math.max(0, document.required - document.received), 0);
  const overBudgetDepartments = data.departments.filter((department) => department.risk === "over").map((department) => department.name);
  const watchVendors = data.vendors.filter((vendor) => vendor.status === "review").map((vendor) => vendor.name);
  const topDepartment = data.departments.reduce((top, department) => (department.actual > top.actual ? department : top), data.departments[0]);
  const topVendor = data.vendors.reduce((top, vendor) => (vendor.amount > top.amount ? vendor : top), data.vendors[0]);
  const peopleCostTotal = data.people.reduce((sum, person) => sum + person.total, 0);
  const averageTrustScore = data.people.length > 0 ? Math.round(data.people.reduce((sum, person) => sum + person.trustScore, 0) / data.people.length) : 0;
  const blockedPaymentTotal = blockedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const reserve = data.project.totalBudget - data.project.committedTotal;
  const auditReadinessPct = requiredDocuments > 0 ? Math.round((receivedDocuments / requiredDocuments) * 100) : 100;
  const reportGrade = resolveReportGrade({
    blockedPaymentTotal,
    missingDocumentCount,
    overBudgetCount: overBudgetDepartments.length,
    reserve,
  });

  return {
    budgetBurnPct: pct(data.project.actualTotal, data.project.totalBudget),
    committedBurnPct: pct(data.project.committedTotal, data.project.totalBudget),
    reserve,
    blockedPaymentTotal,
    blockedPaymentCount: blockedPayments.length,
    dueSoonPaymentTotal: dueSoonPayments.reduce((sum, payment) => sum + payment.amount, 0),
    dueSoonPaymentCount: dueSoonPayments.length,
    missingDocumentCount,
    auditReadinessPct,
    overBudgetDepartments,
    watchVendors,
    topDepartmentName: topDepartment?.name ?? "暂无部门",
    topDepartmentAmount: topDepartment?.actual ?? 0,
    topVendorName: topVendor?.name ?? "暂无供应商",
    topVendorAmount: topVendor?.amount ?? 0,
    peopleCostTotal,
    averageTrustScore,
    recommendation: buildRecommendation({
      blockedPaymentTotal,
      missingDocumentCount,
      overBudgetDepartments,
      watchVendors,
      reserve,
    }),
    reportGrade,
  };
}

function resolveReportGrade(input: {
  blockedPaymentTotal: number;
  missingDocumentCount: number;
  overBudgetCount: number;
  reserve: number;
}): ResourceReportSummary["reportGrade"] {
  if (input.blockedPaymentTotal > 0 || input.overBudgetCount >= 2 || input.reserve < 0) return "hold";
  if (input.missingDocumentCount > 0 || input.overBudgetCount > 0) return "watch";
  return "clear";
}

function buildRecommendation(input: {
  blockedPaymentTotal: number;
  missingDocumentCount: number;
  overBudgetDepartments: string[];
  watchVendors: string[];
  reserve: number;
}) {
  if (input.blockedPaymentTotal > 0) {
    return `建议暂缓 ${formatMoney(input.blockedPaymentTotal)} 付款，先补齐审计材料和付款关口，再由制片主任放行。`;
  }

  if (input.reserve < 0) {
    return `已承诺金额超过总预算 ${formatMoney(Math.abs(input.reserve))}，建议冻结新增采购并复核超支部门。`;
  }

  if (input.overBudgetDepartments.length > 0) {
    return `重点复核 ${input.overBudgetDepartments.join("、")} 的剩余工作量，供应商追加费用需要走单独审批。`;
  }

  if (input.missingDocumentCount > 0 || input.watchVendors.length > 0) {
    return `预算仍可推进，但付款前需要补齐 ${input.missingDocumentCount} 份材料，并复核 ${input.watchVendors.length} 个供应商。`;
  }

  return "预算、付款和审计材料处于可控状态，可以按现有排期继续执行。";
}

function pct(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function daysBetween(fromIso: string, toIso: string) {
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  const to = Date.parse(`${toIso}T00:00:00Z`);
  return Math.ceil((to - from) / 86_400_000);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
