import type { ResourceBudgetData } from "@/lib/resource-data";
import type { ResourceReportSummary } from "@/lib/resource-report";

export type ProfessionalReportStatus = ResourceReportSummary["reportGrade"];
export type ProfessionalReportTone = "ok" | "watch" | "hold";
export type ProfessionalReportRiskKind = "finance" | "audit" | "budget" | "vendor";

export type ProfessionalReportRisk = {
  kind: ProfessionalReportRiskKind;
  title: string;
  detail: string;
  tone: ProfessionalReportTone;
  amount?: number;
};

export type ProfessionalReportAction = {
  priority: "P0" | "P1" | "P2";
  owner: string;
  action: string;
  evidence: string;
};

export type ProfessionalResourceReport = {
  status: ProfessionalReportStatus;
  headline: string;
  executiveBrief: string;
  producerNote: string;
  riskRadar: ProfessionalReportRisk[];
  actionItems: ProfessionalReportAction[];
  boardQuestions: string[];
  aiPrompt: string;
};

export function buildProfessionalResourceReport(input: {
  data: ResourceBudgetData;
  summary: ResourceReportSummary;
  reportDate: string;
}): ProfessionalResourceReport {
  const { data, summary, reportDate } = input;
  const riskRadar = buildRiskRadar(data, summary);
  const actionItems = buildActionItems(data, summary);
  const boardQuestions = buildBoardQuestions(summary);
  const headline = `${summary.reportGrade.toUpperCase()} · ${data.project.name} 制片资源专业报告 · ${reportDate}`;
  const executiveBrief = [
    `${data.project.name} 当前预算消耗 ${summary.budgetBurnPct}%，承诺消耗 ${summary.committedBurnPct}%，预算余量 ${money(summary.reserve)}。`,
    summary.recommendation,
    `审计完整率 ${summary.auditReadinessPct}%，材料缺口 ${summary.missingDocumentCount} 份；待复核供应商 ${summary.watchVendors.length} 个。`,
  ].join(" ");

  const producerNote = buildProducerNote(summary);

  return {
    status: summary.reportGrade,
    headline,
    executiveBrief,
    producerNote,
    riskRadar,
    actionItems,
    boardQuestions,
    aiPrompt: buildAiPrompt({ data, summary, reportDate, riskRadar, actionItems, boardQuestions }),
  };
}

function buildRiskRadar(data: ResourceBudgetData, summary: ResourceReportSummary): ProfessionalReportRisk[] {
  const risks: ProfessionalReportRisk[] = [];

  if (summary.blockedPaymentTotal > 0) {
    risks.push({
      kind: "finance",
      title: `付款暂缓 ${money(summary.blockedPaymentTotal)}`,
      detail: `${summary.blockedPaymentCount} 个付款节点未满足关口，优先冻结尾款和追加款。`,
      tone: "hold",
      amount: summary.blockedPaymentTotal,
    });
  }

  if (summary.missingDocumentCount > 0) {
    risks.push({
      kind: "audit",
      title: `审计材料缺口 ${summary.missingDocumentCount} 份`,
      detail: `审计完整率 ${summary.auditReadinessPct}%，缺口集中在 ${topMissingDocumentOwners(data).join("、") || "待复核供应商"}。`,
      tone: summary.auditReadinessPct < 70 ? "hold" : "watch",
    });
  }

  if (summary.reserve < 0 || summary.overBudgetDepartments.length > 0) {
    risks.push({
      kind: "budget",
      title: summary.reserve < 0 ? `预算余量缺口 ${money(Math.abs(summary.reserve))}` : `超支部门 ${summary.overBudgetDepartments.length} 个`,
      detail: summary.reserve < 0
        ? `承诺金额已超过总预算，建议暂停新增采购并复核 ${summary.overBudgetDepartments.join("、") || summary.topDepartmentName}。`
        : `重点复核 ${summary.overBudgetDepartments.join("、")} 的剩余工作量和追加报价。`,
      tone: summary.reserve < 0 || summary.overBudgetDepartments.length >= 2 ? "hold" : "watch",
      amount: summary.reserve < 0 ? Math.abs(summary.reserve) : summary.topDepartmentAmount,
    });
  }

  if (summary.watchVendors.length > 0) {
    risks.push({
      kind: "vendor",
      title: `供应商待复核 ${summary.watchVendors.length} 个`,
      detail: `重点看 ${summary.watchVendors.slice(0, 3).join("、")}；最高供应商为 ${summary.topVendorName} ${money(summary.topVendorAmount)}。`,
      tone: risks.some((risk) => risk.kind === "finance") ? "hold" : "watch",
      amount: summary.topVendorAmount,
    });
  }

  return risks;
}

function buildActionItems(data: ResourceBudgetData, summary: ResourceReportSummary): ProfessionalReportAction[] {
  const actions: ProfessionalReportAction[] = [];

  if (summary.blockedPaymentTotal > 0) {
    actions.push({
      priority: "P0",
      owner: "制片主任",
      action: `冻结 ${money(summary.blockedPaymentTotal)} 付款，逐项核对付款关口。`,
      evidence: data.payments.filter((payment) => payment.status === "blocked").map((payment) => payment.gate).join("；") || "付款关口未满足",
    });
  }

  if (summary.missingDocumentCount > 0) {
    actions.push({
      priority: summary.auditReadinessPct < 70 ? "P0" : "P1",
      owner: "财务审计",
      action: `补齐 ${summary.missingDocumentCount} 份材料并更新审计台账。`,
      evidence: data.documents.flatMap((document) => document.missing.map((missing) => `${document.owner}:${missing}`)).slice(0, 6).join("；"),
    });
  }

  if (summary.reserve < 0 || summary.overBudgetDepartments.length > 0) {
    actions.push({
      priority: summary.reserve < 0 ? "P0" : "P1",
      owner: "监制/制片厂",
      action: summary.reserve < 0 ? "决定是否冻结新增采购或发起追加预算审批。" : `复核 ${summary.overBudgetDepartments.join("、")} 的追加支出。`,
      evidence: `承诺消耗 ${summary.committedBurnPct}%，余量 ${money(summary.reserve)}。`,
    });
  }

  if (summary.watchVendors.length > 0) {
    actions.push({
      priority: "P2",
      owner: "部门负责人",
      action: `约谈 ${summary.watchVendors.slice(0, 3).join("、")} 并确认交付进度。`,
      evidence: data.vendors.filter((vendor) => vendor.status === "review").map((vendor) => vendor.auditFlag).slice(0, 4).join("；"),
    });
  }

  return actions;
}

function buildBoardQuestions(summary: ResourceReportSummary) {
  const questions = [];

  if (summary.reserve < 0 || summary.committedBurnPct >= 90) {
    questions.push("是否批准冻结新增采购，直到预算余量恢复到安全线？");
  }

  if (summary.blockedPaymentTotal > 0) {
    questions.push(`哪些付款可以在材料补齐后立即放行，哪些需要继续 HOLD？`);
  }

  if (summary.watchVendors.length > 0) {
    questions.push("待复核供应商是否影响拍摄日程、交付节点或尾款发放？");
  }

  if (questions.length === 0) {
    questions.push("是否按当前预算和付款节奏继续推进下一阶段？");
  }

  return questions;
}

function buildProducerNote(summary: ResourceReportSummary) {
  if (summary.reportGrade === "hold") {
    return "建议把本报告作为付款会和周会的第一项：先处理 HOLD 项，再讨论新增支出。";
  }
  if (summary.reportGrade === "watch") {
    return "建议会前完成材料补齐和供应商进度确认，避免 WATCH 项滚动成付款阻断。";
  }
  return "当前资源和预算信号健康，可以把报告作为常规周报归档。";
}

function buildAiPrompt(input: {
  data: ResourceBudgetData;
  summary: ResourceReportSummary;
  reportDate: string;
  riskRadar: ProfessionalReportRisk[];
  actionItems: ProfessionalReportAction[];
  boardQuestions: string[];
}) {
  const payload = {
    project: input.data.project,
    reportDate: input.reportDate,
    summary: {
      status: input.summary.reportGrade,
      budgetBurnPct: input.summary.budgetBurnPct,
      committedBurnPct: input.summary.committedBurnPct,
      reserve: input.summary.reserve,
      blockedPaymentTotal: input.summary.blockedPaymentTotal,
      missingDocumentCount: input.summary.missingDocumentCount,
      auditReadinessPct: input.summary.auditReadinessPct,
      overBudgetDepartments: input.summary.overBudgetDepartments,
      watchVendors: input.summary.watchVendors,
    },
    topVendors: input.data.vendors.slice().sort((a, b) => b.amount - a.amount).slice(0, 5),
    riskRadar: input.riskRadar,
    actionItems: input.actionItems,
    boardQuestions: input.boardQuestions,
  };

  return [
    "请生成一份给监制和制片厂阅读的制片资源报告。",
    "语气专业、直接，先给结论，再列风险、付款建议、需要会上决策的问题。",
    "不要编造数据，只使用下面 JSON。",
    JSON.stringify(payload, null, 2),
  ].join("\n\n");
}

function topMissingDocumentOwners(data: ResourceBudgetData) {
  return data.documents
    .filter((document) => document.missing.length > 0)
    .sort((a, b) => b.missing.length - a.missing.length)
    .slice(0, 3)
    .map((document) => document.owner);
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
