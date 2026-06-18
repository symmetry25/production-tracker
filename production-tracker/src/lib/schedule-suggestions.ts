import type { TaskStatus } from "@/generated/prisma/enums";
import type { TaskTableItem } from "@/lib/task-data";

export type ScheduleSuggestionSeverity = "critical" | "warning" | "info";
export type ScheduleSuggestionKind = "overdue" | "over_budget" | "missing_owner" | "dependency_gap" | "review_bottleneck" | "ready_to_pull";

export type ScheduleSuggestion = {
  id: string;
  kind: ScheduleSuggestionKind;
  severity: ScheduleSuggestionSeverity;
  taskId: string;
  taskName: string;
  contextLabel: string;
  title: string;
  rationale: string;
  action: string;
  impactDays: number;
  budgetImpact: number;
};

export type ScheduleSuggestionSummary = {
  projectId: string;
  generatedAt: string;
  provider: "rules" | "openai" | "anthropic";
  healthScore: number;
  criticalCount: number;
  warningCount: number;
  totalBudgetRisk: number;
  suggestions: ScheduleSuggestion[];
  narrative: string;
};

const completeStatuses: TaskStatus[] = ["APPROVED", "FINAL", "OMIT"];
const reviewStatuses: TaskStatus[] = ["PENDING_REVIEW"];

export function buildScheduleSuggestions(input: { projectId: string; tasks: TaskTableItem[]; now?: Date; narrative?: string; provider?: ScheduleSuggestionSummary["provider"] }): ScheduleSuggestionSummary {
  const now = input.now ?? new Date();
  const taskStatusById = new Map(input.tasks.map((task) => [task.id, task.status]));
  const suggestions = input.tasks.flatMap((task) => analyzeTask(task, now, taskStatusById));
  const sortedSuggestions = suggestions.sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || b.impactDays - a.impactDays || b.budgetImpact - a.budgetImpact);
  const criticalCount = sortedSuggestions.filter((item) => item.severity === "critical").length;
  const warningCount = sortedSuggestions.filter((item) => item.severity === "warning").length;
  const totalBudgetRisk = sortedSuggestions.reduce((sum, item) => sum + item.budgetImpact, 0);
  const healthScore = Math.max(0, 100 - criticalCount * 18 - warningCount * 8 - Math.min(30, Math.round(totalBudgetRisk / 1000)));

  return {
    projectId: input.projectId,
    generatedAt: now.toISOString(),
    provider: input.provider ?? "rules",
    healthScore,
    criticalCount,
    warningCount,
    totalBudgetRisk,
    suggestions: sortedSuggestions,
    narrative: input.narrative ?? buildRulesNarrative(sortedSuggestions, healthScore),
  };
}

export async function buildScheduleSuggestionsWithAi(input: { projectId: string; tasks: TaskTableItem[]; now?: Date }) {
  const baseSummary = buildScheduleSuggestions(input);
  const provider = getScheduleAiProvider();

  if (provider === "rules" || baseSummary.suggestions.length === 0) {
    return baseSummary;
  }

  try {
    const narrative = provider === "openai" ? await callOpenAiScheduleNarrative(baseSummary) : await callAnthropicScheduleNarrative(baseSummary);
    return {
      ...baseSummary,
      provider,
      narrative: narrative || baseSummary.narrative,
    };
  } catch (error) {
    return {
      ...baseSummary,
      narrative: `${baseSummary.narrative} AI 排期说明暂时不可用：${error instanceof Error ? error.message : "provider request failed"}`,
    };
  }
}

function analyzeTask(task: TaskTableItem, now: Date, taskStatusById: Map<string, TaskStatus>): ScheduleSuggestion[] {
  const suggestions: ScheduleSuggestion[] = [];
  const contextLabel = task.context.label;

  if (task.dueDate && !completeStatuses.includes(task.status)) {
    const lateDays = daysBetween(new Date(task.dueDate), now);
    if (lateDays > 0) {
      suggestions.push({
        id: `${task.id}:overdue`,
        kind: "overdue",
        severity: lateDays >= 3 ? "critical" : "warning",
        taskId: task.id,
        taskName: task.name,
        contextLabel,
        title: `${task.name} 已逾期 ${lateDays} 天`,
        rationale: `${contextLabel} 当前状态为 ${task.status}，截止日 ${task.dueDate.slice(0, 10)} 已过。`,
        action: "安排当日 standup 决策：补人、拆 scope，或把下游依赖整体后移。",
        impactDays: lateDays,
        budgetImpact: 0,
      });
    }
  }

  if (task.overBudget) {
    const budgetImpact = task.calculatedCost - (task.estimatedCost ?? 0);
    suggestions.push({
      id: `${task.id}:over-budget`,
      kind: "over_budget",
      severity: budgetImpact >= 1000 ? "critical" : "warning",
      taskId: task.id,
      taskName: task.name,
      contextLabel,
      title: `${task.name} 已超预算 $${budgetImpact.toLocaleString()}`,
      rationale: `已记录 ${task.timeLogged.toFixed(1)} 天，折算成本 $${task.calculatedCost.toLocaleString()}，预算 $${task.estimatedCost?.toLocaleString() ?? "--"}。`,
      action: "冻结额外工时，要求负责人提交剩余工作量和重估报价。",
      impactDays: estimateScheduleImpact(task),
      budgetImpact,
    });
  }

  if (task.assignees.length === 0 && !completeStatuses.includes(task.status)) {
    suggestions.push({
      id: `${task.id}:missing-owner`,
      kind: "missing_owner",
      severity: task.priority >= 2 ? "critical" : "warning",
      taskId: task.id,
      taskName: task.name,
      contextLabel,
      title: `${task.name} 没有负责人`,
      rationale: `${contextLabel} 任务仍在 ${task.status}，但没有分配执行人。`,
      action: "在资源会里指定 owner 和 reviewer，否则不要进入 ready 队列。",
      impactDays: task.priority >= 2 ? 2 : 1,
      budgetImpact: 0,
    });
  }

  if (task.status === "READY_TO_START" && task.predecessors.length > 0) {
    const unfinishedDependencies = task.predecessors.filter((dependency) => {
      const predecessorStatus = taskStatusById.get(dependency.taskId);
      return !predecessorStatus || !completeStatuses.includes(predecessorStatus);
    });
    if (unfinishedDependencies.length > 0) {
      suggestions.push({
        id: `${task.id}:dependency-gap`,
        kind: "dependency_gap",
        severity: "warning",
        taskId: task.id,
        taskName: task.name,
        contextLabel,
        title: `${task.name} 依赖尚未确认完成`,
        rationale: `存在 ${unfinishedDependencies.length} 个前置任务，建议在开工前确认交付物和版本号。`,
        action: "把前置任务状态、交付版本和 lag 天数补齐，再放行执行。",
        impactDays: Math.max(1, ...unfinishedDependencies.map((dependency) => dependency.lagDays + 1)),
        budgetImpact: 0,
      });
    }
  }

  if (reviewStatuses.includes(task.status) && task.versionCount > 0) {
    suggestions.push({
      id: `${task.id}:review-bottleneck`,
      kind: "review_bottleneck",
      severity: task.status === "PENDING_REVIEW" ? "warning" : "critical",
      taskId: task.id,
      taskName: task.name,
      contextLabel,
      title: `${task.name} 等待审阅闭环`,
      rationale: `已有 ${task.versionCount} 个版本、${task.noteCount} 条备注，当前状态为 ${task.status}。`,
      action: "安排导演/监制集中审片，明确 approve 或 changes requested 的下一步责任人。",
      impactDays: 1,
      budgetImpact: 0,
    });
  }

  if (task.status === "WAITING_TO_START" && task.assignees.length > 0 && task.predecessors.length === 0) {
    suggestions.push({
      id: `${task.id}:ready-to-pull`,
      kind: "ready_to_pull",
      severity: "info",
      taskId: task.id,
      taskName: task.name,
      contextLabel,
      title: `${task.name} 可以提前拉入执行`,
      rationale: "任务已有负责人且没有前置依赖，可作为填补空档的备选工作。",
      action: "如果本周资源有空闲，把状态改为 READY_TO_START 并确认交付日期。",
      impactDays: 0,
      budgetImpact: 0,
    });
  }

  return suggestions;
}

function estimateScheduleImpact(task: TaskTableItem) {
  if (task.duration && task.timeLogged > task.duration) return Math.ceil(task.timeLogged - task.duration);
  return task.overBudget ? 1 : 0;
}

function daysBetween(start: Date, end: Date) {
  return Math.floor((startOfDay(end).getTime() - startOfDay(start).getTime()) / 86_400_000);
}

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function severityRank(severity: ScheduleSuggestionSeverity) {
  if (severity === "critical") return 3;
  if (severity === "warning") return 2;
  return 1;
}

function buildRulesNarrative(suggestions: ScheduleSuggestion[], healthScore: number) {
  const critical = suggestions.filter((item) => item.severity === "critical").length;
  const warning = suggestions.filter((item) => item.severity === "warning").length;

  if (suggestions.length === 0) {
    return "当前排期没有明显逾期、超预算或负责人缺口，可以继续按现有节奏推进。";
  }

  return `排期健康度 ${healthScore}/100：发现 ${critical} 个关键风险、${warning} 个需要关注事项。优先处理逾期、超预算和无负责人任务，再把可提前执行的任务用于填补资源空档。`;
}

function getScheduleAiProvider(): ScheduleSuggestionSummary["provider"] {
  if (process.env.AI_PROVIDER === "openai") return process.env.OPENAI_API_KEY ? "openai" : "rules";
  if (process.env.AI_PROVIDER === "anthropic") return process.env.ANTHROPIC_API_KEY ? "anthropic" : "rules";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "rules";
}

async function callOpenAiScheduleNarrative(summary: ScheduleSuggestionSummary) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: buildSchedulePrompt(summary),
            },
          ],
        },
      ],
      max_output_tokens: 900,
      store: false,
    }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(readProviderError(body, "OpenAI scheduling suggestion failed."));
  return extractOpenAiText(body).trim();
}

async function callAnthropicScheduleNarrative(summary: ScheduleSuggestionSummary) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured.");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5",
      max_tokens: 900,
      messages: [{ role: "user", content: [{ type: "text", text: buildSchedulePrompt(summary) }] }],
    }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(readProviderError(body, "Anthropic scheduling suggestion failed."));
  return extractAnthropicText(body).trim();
}

function buildSchedulePrompt(summary: ScheduleSuggestionSummary) {
  return [
    "你是影视制片排期顾问。基于下面的确定性风险清单，写一段给制片主任看的中文排期建议。",
    "要求：只输出一段 120-180 字；不要编造清单之外的任务；先讲关键风险，再讲今天应做的动作。",
    JSON.stringify({
      healthScore: summary.healthScore,
      criticalCount: summary.criticalCount,
      warningCount: summary.warningCount,
      totalBudgetRisk: summary.totalBudgetRisk,
      suggestions: summary.suggestions.slice(0, 8),
    }),
  ].join("\n\n");
}

function extractOpenAiText(body: unknown) {
  if (!isPlainRecord(body)) return "";
  if (typeof body.output_text === "string") return body.output_text;

  const output = Array.isArray(body.output) ? body.output : [];
  return output
    .flatMap((item) => (isPlainRecord(item) && Array.isArray(item.content) ? item.content : []))
    .map((content) => (isPlainRecord(content) && typeof content.text === "string" ? content.text : ""))
    .filter(Boolean)
    .join("\n");
}

function extractAnthropicText(body: unknown) {
  if (!isPlainRecord(body) || !Array.isArray(body.content)) return "";
  return body.content
    .map((content) => (isPlainRecord(content) && content.type === "text" && typeof content.text === "string" ? content.text : ""))
    .filter(Boolean)
    .join("\n");
}

function readProviderError(body: unknown, fallback: string) {
  if (!isPlainRecord(body)) return fallback;
  const error = body.error;
  if (isPlainRecord(error) && typeof error.message === "string") return error.message;
  if (typeof body.message === "string") return body.message;
  return fallback;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
