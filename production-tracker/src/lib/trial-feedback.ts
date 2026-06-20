export type TrialFeedbackWillingness = "yes" | "maybe" | "no";
export type TrialFeedbackBlockerSeverity = "none" | "minor" | "major" | "critical";
export type TrialCommercialSignal = "strong" | "promising" | "weak" | "blocked";

export type TrialFeedbackIntakeFieldKey = keyof Omit<TrialFeedbackResponse, "id">;

export type TrialFeedbackIntakeField = {
  key: TrialFeedbackIntakeFieldKey;
  label: string;
  required: boolean;
  example: string;
  hint: string;
};

export type TrialFeedbackIntakeTemplate = {
  fields: TrialFeedbackIntakeField[];
  csvRows: string[][];
  operatorNotes: string[];
};

export type TrialFeedbackIntakeIssue = {
  field: TrialFeedbackIntakeFieldKey;
  message: string;
};

export type TrialFeedbackIntakeInput = Partial<Record<TrialFeedbackIntakeFieldKey, string | number | null | undefined>>;

export type TrialFeedbackIntakeResult = {
  response: TrialFeedbackResponse | null;
  issues: TrialFeedbackIntakeIssue[];
  nextStep: string;
};

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

const trialFeedbackIntakeFields: TrialFeedbackIntakeField[] = [
  { key: "testerName", label: "测试者姓名", required: true, example: "陈制片", hint: "真实姓名或对方愿意公开的称呼。" },
  { key: "organization", label: "公司/团队", required: false, example: "短剧制片团队", hint: "可填写剧组、供应商、工作室或个人。" },
  { key: "role", label: "角色", required: false, example: "制片主任", hint: "制片、监制、财务、VFX Supervisor 等。" },
  { key: "testedAt", label: "测试日期", required: false, example: "2026-06-20", hint: "留空时使用当天日期。" },
  { key: "valueScore", label: "价值评分 1-5", required: true, example: "5", hint: "对方觉得这个工具是否真的解决问题。" },
  { key: "clarityScore", label: "清晰度 1-5", required: true, example: "4", hint: "页面、图表、流程是否能看懂。" },
  { key: "workflowFitScore", label: "流程匹配 1-5", required: true, example: "5", hint: "是否贴近真实剧组工作方式。" },
  { key: "willingnessToPay", label: "付费意愿", required: false, example: "愿意", hint: "可填：愿意、待确认、不愿意。" },
  { key: "blockerSeverity", label: "阻断程度", required: false, example: "严重", hint: "可填：无、轻微、严重、致命。" },
  { key: "blockers", label: "阻断问题", required: false, example: "权限不够细、Excel 模板需要适配", hint: "多个问题可用顿号、逗号、斜杠或换行分隔。" },
  { key: "requestedFeatures", label: "想要功能", required: false, example: "预算审批 / 付款节点提醒", hint: "记录反复出现的真实需求。" },
  { key: "quote", label: "原话摘录", required: false, example: "预算和资金流如果能接真实单据，这个给监制看很有用。", hint: "尽量保留一句能说明价值的原话。" },
  { key: "nextStepOwner", label: "跟进负责人", required: false, example: "Product", hint: "留空时按问题类型自动建议负责人。" },
];

export function buildTrialFeedbackIntakeTemplate(): TrialFeedbackIntakeTemplate {
  const headers = trialFeedbackIntakeFields.map((field) => field.label);
  const exampleRow = trialFeedbackIntakeFields.map((field) => field.example);

  return {
    fields: trialFeedbackIntakeFields,
    csvRows: [headers, exampleRow],
    operatorNotes: [
      "每次试用结束后 10 分钟内填写，避免只留下模糊印象。",
      "评分低但付费意愿高的人要优先回访，他们通常能指出真实阻断。",
      "不要只记录功能建议，也要记录对方所在角色和是否愿意继续试用。",
    ],
  };
}

export function prepareTrialFeedbackIntake(
  input: TrialFeedbackIntakeInput,
  options: { today?: string } = {},
): TrialFeedbackIntakeResult {
  const today = normalizeText(options.today) || new Date().toISOString().slice(0, 10);
  const testerName = normalizeText(input.testerName);
  const organization = normalizeText(input.organization) || "未填写";
  const role = normalizeText(input.role) || "未填写";
  const testedAt = normalizeDate(input.testedAt, today);
  const valueScore = normalizeScore(input.valueScore);
  const clarityScore = normalizeScore(input.clarityScore);
  const workflowFitScore = normalizeScore(input.workflowFitScore);
  const willingnessToPay = normalizeWillingness(input.willingnessToPay);
  const blockerSeverity = normalizeBlockerSeverity(input.blockerSeverity);
  const blockers = splitList(input.blockers);
  const requestedFeatures = splitList(input.requestedFeatures);
  const quote = normalizeText(input.quote);
  const nextStepOwner = normalizeText(input.nextStepOwner) || suggestNextStepOwner({ blockerSeverity, blockers, requestedFeatures });
  const issues: TrialFeedbackIntakeIssue[] = [];

  if (!testerName) issues.push({ field: "testerName", message: "需要填写测试者姓名。" });
  if (valueScore === null) issues.push({ field: "valueScore", message: "价值评分需要是 1-5 的数字。" });
  if (clarityScore === null) issues.push({ field: "clarityScore", message: "清晰度需要是 1-5 的数字。" });
  if (workflowFitScore === null) issues.push({ field: "workflowFitScore", message: "流程匹配需要是 1-5 的数字。" });

  if (issues.length) {
    return {
      response: null,
      issues,
      nextStep: "先补齐身份和三项核心评分，再进入试用反馈分析。",
    };
  }

  const validValueScore = valueScore;
  const validClarityScore = clarityScore;
  const validWorkflowFitScore = workflowFitScore;

  if (validValueScore === null || validClarityScore === null || validWorkflowFitScore === null) {
    return {
      response: null,
      issues,
      nextStep: "先补齐身份和三项核心评分，再进入试用反馈分析。",
    };
  }

  const response: TrialFeedbackResponse = {
    id: `${slugifyTester(testerName)}-${testedAt}`,
    testerName,
    organization,
    role,
    testedAt,
    valueScore: validValueScore,
    clarityScore: validClarityScore,
    workflowFitScore: validWorkflowFitScore,
    willingnessToPay,
    blockerSeverity,
    blockers,
    requestedFeatures,
    quote,
    nextStepOwner,
  };

  return {
    response,
    issues,
    nextStep: buildIntakeNextStep(response),
  };
}

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

function normalizeText(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function normalizeDate(value: unknown, fallback: string) {
  const text = normalizeText(value);
  if (!text) return fallback;

  const normalized = text.replaceAll(".", "-").replaceAll("/", "-");
  return /^\d{4}-\d{1,2}-\d{1,2}$/.test(normalized)
    ? normalized.split("-").map((part, index) => (index === 0 ? part : part.padStart(2, "0"))).join("-")
    : fallback;
}

function normalizeScore(value: unknown) {
  const text = normalizeText(value);
  const score = Number(text);
  return Number.isInteger(score) && score >= 1 && score <= 5 ? score : null;
}

function normalizeWillingness(value: unknown): TrialFeedbackWillingness {
  const text = normalizeText(value).toLowerCase();
  if (["yes", "y", "愿意", "会", "付费", "strong"].includes(text)) return "yes";
  if (["no", "n", "不愿意", "不会", "不付费"].includes(text)) return "no";
  return "maybe";
}

function normalizeBlockerSeverity(value: unknown): TrialFeedbackBlockerSeverity {
  const text = normalizeText(value).toLowerCase();
  if (["critical", "致命", "阻断", "无法试用"].includes(text)) return "critical";
  if (["major", "严重", "高", "重要"].includes(text)) return "major";
  if (["minor", "轻微", "低", "小问题"].includes(text)) return "minor";
  return "none";
}

function splitList(value: unknown) {
  const text = normalizeText(value);
  if (!text) return [];

  return text
    .split(/[、,，/；;|\n]+/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function suggestNextStepOwner(input: {
  blockerSeverity: TrialFeedbackBlockerSeverity;
  blockers: string[];
  requestedFeatures: string[];
}) {
  const content = [...input.blockers, ...input.requestedFeatures].join(" ");
  if (input.blockerSeverity === "critical" || input.blockerSeverity === "major") return "Product";
  if (/财务|审计|付款|发票|合同|预算/.test(content)) return "Finance";
  if (/审片|版本|VFX|供应商|素材|媒体/i.test(content)) return "Review";
  return "Customer Success";
}

function buildIntakeNextStep(response: TrialFeedbackResponse) {
  if (response.blockerSeverity === "critical") return "先记录为关键阻断，修复后请同一位测试者复测。";
  if (response.willingnessToPay === "yes" && response.valueScore >= 4) return "标记为高价值线索，优先约第二轮深访。";
  if (response.workflowFitScore <= 2) return "先追问真实工作流，不急着扩展功能。";
  return "进入反馈池，与同类角色的意见合并判断优先级。";
}

function slugifyTester(value: string) {
  const tokens = [...value].map((char) => pinyinSlugMap[char] ?? char);
  const slug = tokens
    .join("-")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "tester";
}

const pinyinSlugMap: Record<string, string> = {
  陈: "chen",
  制: "zhi",
  片: "pian",
  林: "lin",
  会: "hui",
  计: "ji",
  王: "wang",
  张: "zhang",
  李: "li",
  赵: "zhao",
  刘: "liu",
  黄: "huang",
  周: "zhou",
  吴: "wu",
  徐: "xu",
  高: "gao",
  马: "ma",
  监: "jian",
  视: "shi",
  财: "cai",
  务: "wu",
  导: "dao",
  演: "yan",
};

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
