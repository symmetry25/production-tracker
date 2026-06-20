export type TrialFeedbackWillingness = "yes" | "maybe" | "no";
export type TrialFeedbackBlockerSeverity = "none" | "minor" | "major" | "critical";
export type TrialCommercialSignal = "strong" | "promising" | "weak" | "blocked";

export type TrialFeedbackResponse = {
  id: string;
  testerName: string;
  organization: string;
  role: string;
  testedAt: string;
  valueScore: number;
  clarityScore: number;
  workflowFitScore: number;
  willingnessToPay: TrialFeedbackWillingness;
  blockerSeverity: TrialFeedbackBlockerSeverity;
  blockers: string[];
  requestedFeatures: string[];
  quote: string;
  nextStepOwner: string;
};

export type TrialFeedbackTheme = {
  label: string;
  count: number;
  kind: "feature" | "blocker";
};

export type TrialFeedbackSummary = {
  totalResponses: number;
  qualifiedLeadCount: number;
  averageValueScore: number;
  averageWorkflowFitScore: number;
  criticalBlockerCount: number;
  commercialSignal: TrialCommercialSignal;
  recommendation: string;
  topThemes: TrialFeedbackTheme[];
  nextActions: string[];
  responses: TrialFeedbackResponse[];
};

export const demoTrialFeedbackResponses: TrialFeedbackResponse[] = [
  {
    id: "producer-chen",
    testerName: "陈制片",
    organization: "短剧制片团队",
    role: "制片主任",
    testedAt: "2026-06-20",
    valueScore: 5,
    clarityScore: 4,
    workflowFitScore: 5,
    willingnessToPay: "yes",
    blockerSeverity: "major",
    blockers: ["权限不够细", "真实 Excel 模板需要适配"],
    requestedFeatures: ["预算审批", "Excel 导入", "付款节点提醒"],
    quote: "预算和资金流如果能接真实单据，这个给监制看很有用。",
    nextStepOwner: "Product",
  },
  {
    id: "vfx-nora",
    testerName: "Nora Li",
    organization: "VFX 供应商",
    role: "VFX Supervisor",
    testedAt: "2026-06-20",
    valueScore: 4,
    clarityScore: 4,
    workflowFitScore: 4,
    willingnessToPay: "maybe",
    blockerSeverity: "minor",
    blockers: ["版本备注需要更像审片工具"],
    requestedFeatures: ["供应商审片", "版本对比", "付款节点提醒"],
    quote: "如果能把审片意见和付款节点连起来，供应商会更愿意配合。",
    nextStepOwner: "Review",
  },
  {
    id: "finance-lin",
    testerName: "林会计",
    organization: "制片财务",
    role: "Production Accountant",
    testedAt: "2026-06-20",
    valueScore: 4,
    clarityScore: 3,
    workflowFitScore: 4,
    willingnessToPay: "yes",
    blockerSeverity: "major",
    blockers: ["审计材料状态需要可导出", "权限不够细"],
    requestedFeatures: ["预算审批", "审计导出", "Excel 导入"],
    quote: "部门占比和付款冻结很直观，但要能导出给财务留档。",
    nextStepOwner: "Finance",
  },
];

export function buildTrialFeedbackSummary(responses: TrialFeedbackResponse[]): TrialFeedbackSummary {
  const totalResponses = responses.length;
  const qualifiedLeadCount = responses.filter(isQualifiedLead).length;
  const averageValueScore = average(responses.map((response) => response.valueScore));
  const averageWorkflowFitScore = average(responses.map((response) => response.workflowFitScore));
  const criticalBlockerCount = responses.filter((response) => response.blockerSeverity === "critical").length;
  const topThemes = buildTopThemes(responses);
  const commercialSignal = resolveCommercialSignal({
    totalResponses,
    qualifiedLeadCount,
    averageValueScore,
    averageWorkflowFitScore,
    criticalBlockerCount,
  });

  return {
    totalResponses,
    qualifiedLeadCount,
    averageValueScore,
    averageWorkflowFitScore,
    criticalBlockerCount,
    commercialSignal,
    recommendation: buildRecommendation(commercialSignal, topThemes),
    topThemes,
    nextActions: buildNextActions(commercialSignal, topThemes),
    responses: [...responses].sort(sortResponses),
  };
}

function isQualifiedLead(response: TrialFeedbackResponse) {
  return response.valueScore >= 4 && response.workflowFitScore >= 4 && response.willingnessToPay !== "no";
}

function buildTopThemes(responses: TrialFeedbackResponse[]): TrialFeedbackTheme[] {
  const counts = new Map<string, TrialFeedbackTheme>();

  for (const response of responses) {
    for (const feature of response.requestedFeatures) {
      addTheme(counts, feature, "feature");
    }

    for (const blocker of response.blockers) {
      addTheme(counts, blocker, "blocker");
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count || themeKindRank(a.kind) - themeKindRank(b.kind) || a.label.localeCompare(b.label))
    .slice(0, 6);
}

function addTheme(counts: Map<string, TrialFeedbackTheme>, rawLabel: string, kind: TrialFeedbackTheme["kind"]) {
  const label = rawLabel.trim();
  if (!label) return;

  const key = `${kind}:${label}`;
  const existing = counts.get(key);

  if (existing) {
    existing.count += 1;
  } else {
    counts.set(key, { label, count: 1, kind });
  }
}

function resolveCommercialSignal(input: {
  totalResponses: number;
  qualifiedLeadCount: number;
  averageValueScore: number;
  averageWorkflowFitScore: number;
  criticalBlockerCount: number;
}): TrialCommercialSignal {
  if (input.criticalBlockerCount > 0) return "blocked";
  if (input.totalResponses === 0) return "weak";
  if (input.qualifiedLeadCount >= 3 && input.averageValueScore >= 4 && input.averageWorkflowFitScore >= 4) return "strong";
  if (input.qualifiedLeadCount >= 1 && input.averageValueScore >= 3.5) return "promising";
  return "weak";
}

function buildRecommendation(signal: TrialCommercialSignal, topThemes: TrialFeedbackTheme[]) {
  const topFeature = topThemes.find((theme) => theme.kind === "feature")?.label;

  if (signal === "blocked") return "先修复关键阻断，再邀请下一批真实剧组试用。";
  if (signal === "strong") return `商业信号强，优先把 ${topFeature ?? "最高频需求"} 做成可演示闭环。`;
  if (signal === "promising") return `有早期信号，先补齐 ${topFeature ?? "核心工作流"} 后再扩大样本。`;
  return "反馈样本或价值感还不够，先缩小目标用户，重新设计试用问题。";
}

function buildNextActions(signal: TrialCommercialSignal, topThemes: TrialFeedbackTheme[]) {
  const topFeature = topThemes.find((theme) => theme.kind === "feature")?.label ?? "最高频功能需求";
  const topBlocker = topThemes.find((theme) => theme.kind === "blocker")?.label ?? "最高频阻断";

  if (signal === "blocked") {
    return [`修复 ${topBlocker}`, "暂缓扩大试用名单", "修复后让同一批测试者复测"];
  }

  return [`把 ${topFeature} 做成下一轮演示重点`, `整理 ${topBlocker} 的修复范围`, "约 3 位同类角色做第二轮试用"];
}

function sortResponses(a: TrialFeedbackResponse, b: TrialFeedbackResponse) {
  return responseScore(b) - responseScore(a) || a.testerName.localeCompare(b.testerName);
}

function responseScore(response: TrialFeedbackResponse) {
  const payScore = response.willingnessToPay === "yes" ? 12 : response.willingnessToPay === "maybe" ? 5 : -10;
  const blockerPenalty = response.blockerSeverity === "critical" ? 40 : response.blockerSeverity === "major" ? 12 : response.blockerSeverity === "minor" ? 3 : 0;
  return response.valueScore * 12 + response.workflowFitScore * 10 + response.clarityScore * 4 + payScore - blockerPenalty;
}

function themeKindRank(kind: TrialFeedbackTheme["kind"]) {
  return kind === "feature" ? 0 : 1;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}
