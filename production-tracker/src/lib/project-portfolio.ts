import type { ProjectGridItem } from "@/lib/project-data";
import type { ResourceBudgetData } from "@/lib/resource-data";

export type ProjectPortfolioHealth = "clear" | "watch" | "hold";

export type ProjectPortfolioItem = {
  id: string;
  name: string;
  code: string;
  status: string;
  description: string | null;
  progress: number;
  shotCount: number;
  assetCount: number;
  taskCount: number;
  dueDate: Date;
  milestone: string | null;
  milestoneDate: Date | null;
  daysRemaining: number;
  milestoneDaysRemaining: number | null;
  totalBudget: number;
  actualTotal: number;
  committedTotal: number;
  budgetBurnPct: number;
  committedBurnPct: number;
  blockedPaymentTotal: number;
  blockedPaymentCount: number;
  missingDocumentCount: number;
  overBudgetDepartmentCount: number;
  watchVendorCount: number;
  health: ProjectPortfolioHealth;
  riskScore: number;
  actionKind: "audit" | "budget" | "schedule" | "review" | "setup";
};

export type ProjectPortfolio = {
  items: ProjectPortfolioItem[];
  projectCount: number;
  atRiskCount: number;
  totalBudget: number;
  actualTotal: number;
  committedTotal: number;
  budgetBurnPct: number;
  blockedPaymentTotal: number;
  missingDocumentCount: number;
  nextMilestone: ProjectPortfolioItem | null;
};

export function buildProjectPortfolio(
  projects: ProjectGridItem[],
  resourcesByProjectId: Record<string, ResourceBudgetData | undefined>,
  todayIso = new Date().toISOString().slice(0, 10),
): ProjectPortfolio {
  const items = projects.map((project) => buildProjectPortfolioItem(project, resourcesByProjectId[project.id], todayIso)).sort(sortPortfolioItems);
  const totalBudget = items.reduce((sum, item) => sum + item.totalBudget, 0);
  const actualTotal = items.reduce((sum, item) => sum + item.actualTotal, 0);
  const committedTotal = items.reduce((sum, item) => sum + item.committedTotal, 0);

  return {
    items,
    projectCount: items.length,
    atRiskCount: items.filter((item) => item.health === "hold").length,
    totalBudget,
    actualTotal,
    committedTotal,
    budgetBurnPct: pct(actualTotal, totalBudget),
    blockedPaymentTotal: items.reduce((sum, item) => sum + item.blockedPaymentTotal, 0),
    missingDocumentCount: items.reduce((sum, item) => sum + item.missingDocumentCount, 0),
    nextMilestone: getNextMilestone(items),
  };
}

function buildProjectPortfolioItem(project: ProjectGridItem, data: ResourceBudgetData | undefined, todayIso: string): ProjectPortfolioItem {
  const totalBudget = data?.project.totalBudget ?? 0;
  const actualTotal = data?.project.actualTotal ?? 0;
  const committedTotal = data?.project.committedTotal ?? 0;
  const blockedPayments = data?.payments.filter((payment) => payment.status === "blocked") ?? [];
  const overBudgetDepartments = data?.departments.filter((department) => department.risk === "over") ?? [];
  const watchVendors = data?.vendors.filter((vendor) => vendor.status === "review") ?? [];
  const missingDocumentCount = data?.documents.reduce((sum, document) => sum + Math.max(0, document.required - document.received), 0) ?? 0;
  const daysRemaining = daysBetween(todayIso, project.dueDate);
  const milestoneDaysRemaining = project.milestoneDate ? daysBetween(todayIso, project.milestoneDate) : null;
  const blockedPaymentTotal = blockedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const budgetBurnPct = pct(actualTotal, totalBudget);
  const committedBurnPct = pct(committedTotal, totalBudget);
  const riskScore =
    blockedPayments.length * 36 +
    overBudgetDepartments.length * 24 +
    Math.min(24, missingDocumentCount * 4) +
    (committedBurnPct > 100 ? 28 : committedBurnPct > 90 ? 12 : 0) +
    (daysRemaining < 0 ? 30 : daysRemaining <= 7 ? 18 : daysRemaining <= 21 ? 8 : 0) +
    (milestoneDaysRemaining !== null && milestoneDaysRemaining <= 7 ? 10 : 0);

  return {
    id: project.id,
    name: project.name,
    code: project.code,
    status: project.status,
    description: project.description,
    progress: project.progress,
    shotCount: project.shotCount,
    assetCount: project.assetCount,
    taskCount: project.taskCount,
    dueDate: project.dueDate,
    milestone: project.milestone,
    milestoneDate: project.milestoneDate,
    daysRemaining,
    milestoneDaysRemaining,
    totalBudget,
    actualTotal,
    committedTotal,
    budgetBurnPct,
    committedBurnPct,
    blockedPaymentTotal,
    blockedPaymentCount: blockedPayments.length,
    missingDocumentCount,
    overBudgetDepartmentCount: overBudgetDepartments.length,
    watchVendorCount: watchVendors.length,
    health: resolveHealth({
      blockedPaymentTotal,
      missingDocumentCount,
      overBudgetDepartmentCount: overBudgetDepartments.length,
      committedBurnPct,
      daysRemaining,
    }),
    riskScore,
    actionKind: resolveActionKind({
      blockedPaymentTotal,
      overBudgetDepartmentCount: overBudgetDepartments.length,
      committedBurnPct,
      daysRemaining,
      watchVendorCount: watchVendors.length,
      hasResourceData: Boolean(data),
    }),
  };
}

function resolveHealth(input: {
  blockedPaymentTotal: number;
  missingDocumentCount: number;
  overBudgetDepartmentCount: number;
  committedBurnPct: number;
  daysRemaining: number;
}): ProjectPortfolioHealth {
  if (input.blockedPaymentTotal > 0 || input.overBudgetDepartmentCount > 0 || input.committedBurnPct > 100 || input.daysRemaining < 0) {
    return "hold";
  }

  if (input.missingDocumentCount > 0 || input.committedBurnPct > 88 || input.daysRemaining <= 21) {
    return "watch";
  }

  return "clear";
}

function resolveActionKind(input: {
  blockedPaymentTotal: number;
  overBudgetDepartmentCount: number;
  committedBurnPct: number;
  daysRemaining: number;
  watchVendorCount: number;
  hasResourceData: boolean;
}): ProjectPortfolioItem["actionKind"] {
  if (!input.hasResourceData) return "setup";
  if (input.blockedPaymentTotal > 0) return "audit";
  if (input.overBudgetDepartmentCount > 0 || input.committedBurnPct > 90) return "budget";
  if (input.daysRemaining <= 14) return "schedule";
  if (input.watchVendorCount > 0) return "review";
  return "setup";
}

function sortPortfolioItems(a: ProjectPortfolioItem, b: ProjectPortfolioItem) {
  return b.riskScore - a.riskScore || a.daysRemaining - b.daysRemaining || a.name.localeCompare(b.name);
}

function getNextMilestone(items: ProjectPortfolioItem[]) {
  return (
    items
      .filter((item) => item.milestoneDate && item.milestoneDaysRemaining !== null)
      .sort((a, b) => (a.milestoneDaysRemaining ?? Number.POSITIVE_INFINITY) - (b.milestoneDaysRemaining ?? Number.POSITIVE_INFINITY))[0] ?? null
  );
}

function pct(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function daysBetween(fromIso: string, to: Date) {
  const fromTime = Date.parse(`${fromIso}T00:00:00.000Z`);
  const toTime = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate());
  return Math.ceil((toTime - fromTime) / 86_400_000);
}
