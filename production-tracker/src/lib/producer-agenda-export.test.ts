import { describe, expect, it } from "vitest";

import type { DashboardStats } from "@/lib/dashboard-data";
import type { OverviewResourcePulse } from "@/lib/overview-resource-pulse";
import type { ProducerDecisionBrief } from "@/lib/producer-decision-brief";
import { buildProducerAgendaRows } from "@/lib/producer-agenda-export";
import type { ScheduleSuggestionSummary } from "@/lib/schedule-suggestions";

describe("buildProducerAgendaRows", () => {
  it("builds a producer meeting agenda from project, finance, audit, and schedule signals", () => {
    const rows = buildProducerAgendaRows({
      stats: createStats(),
      resourcePulse: createResourcePulse(),
      decisionBrief: createDecisionBrief(),
      scheduleSummary: createScheduleSummary(),
    });

    expect(rows[0]).toEqual(["section", "item", "value", "detail", "owner"]);
    expect(rows).toContainEqual(["project", "name", "Mkali Mission", "MKA", ""]);
    expect(rows).toContainEqual(["project", "progress", "64%", "Final delivery in 12 days", ""]);
    expect(rows).toContainEqual(["finance", "blocked_payments", "$180,000", "2 payments blocked", "Line Producer"]);
    expect(rows).toContainEqual(["finance", "audit_readiness", "58%", "Primary risk: Camera Vendor", "Production Accountant"]);
    expect(rows).toContainEqual(["decision", "01 · Payment · Action needed", "冻结付款 $180,000", "先补齐审计材料。", "/resources/report"]);
    expect(rows).toContainEqual(["schedule", "critical · overdue", "VFX turnover 已逾期 3 天", "安排当日决策。", "VFX_0100"]);
  });
});

function createStats(): DashboardStats {
  return {
    project: {
      id: "demo",
      name: "Mkali Mission",
      code: "MKA",
      thumbnailUrl: null,
      description: null,
      startDate: "2026-05-01T00:00:00.000Z",
      dueDate: "2026-07-02T00:00:00.000Z",
      milestone: "Final delivery",
      milestoneDate: "2026-07-02T00:00:00.000Z",
      daysRemaining: 12,
      progressPct: 64,
    },
    counts: {
      shots: 52,
      assets: 18,
      tasks: 140,
      versions: 34,
      crew: 22,
    },
    shotStatus: [],
    assetStatus: [],
    taskStatus: [],
    velocity: [],
    versionStatus: [],
    pctFinalByDept: [
      { department: "VFX", pctFinal: 48, final: 12, total: 25 },
      { department: "DIT", pctFinal: 82, final: 9, total: 11 },
    ],
    crew: [
      { id: "u1", name: "Lin", department: "VFX", role: "Supervisor", taskCount: 9, finalCount: 3, loadPct: 94 },
      { id: "u2", name: "Chen", department: "DIT", role: "DIT", taskCount: 5, finalCount: 4, loadPct: 76 },
    ],
    latestVersions: [],
  };
}

function createResourcePulse(): OverviewResourcePulse {
  return {
    projectId: "demo",
    grade: "hold",
    totalBudget: 1200000,
    actualTotal: 620000,
    committedTotal: 1040000,
    budgetBurnPct: 52,
    committedBurnPct: 87,
    reserve: 160000,
    blockedPaymentTotal: 180000,
    blockedPaymentCount: 2,
    missingDocumentCount: 4,
    auditReadinessPct: 58,
    primaryRiskLabel: "Camera Vendor",
    recommendation: "先补齐审计材料。",
    actionHref: "/resources/report",
    signals: [],
  };
}

function createDecisionBrief(): ProducerDecisionBrief {
  return {
    headlineTone: "hold",
    holdCount: 1,
    watchCount: 1,
    items: [
      {
        id: "finance-blocked-payment",
        kind: "finance",
        tone: "hold",
        title: "冻结付款 $180,000",
        detail: "先补齐审计材料。",
        meta: "2 payments",
        href: "/resources/report",
        priority: 1000,
      },
    ],
  };
}

function createScheduleSummary(): ScheduleSuggestionSummary {
  return {
    projectId: "demo",
    generatedAt: "2026-06-20T00:00:00.000Z",
    provider: "rules",
    healthScore: 52,
    criticalCount: 1,
    warningCount: 1,
    totalBudgetRisk: 3000,
    narrative: "先处理逾期任务。",
    suggestions: [
      {
        id: "task-overdue",
        kind: "overdue",
        severity: "critical",
        taskId: "task-1",
        taskName: "VFX turnover",
        contextLabel: "VFX_0100",
        title: "VFX turnover 已逾期 3 天",
        rationale: "交付已逾期。",
        action: "安排当日决策。",
        impactDays: 3,
        budgetImpact: 3000,
      },
    ],
  };
}
