import { describe, expect, it } from "vitest";

import type { OverviewResourcePulse } from "@/lib/overview-resource-pulse";
import { buildProducerDecisionBrief } from "@/lib/producer-decision-brief";
import type { ScheduleSuggestionSummary } from "@/lib/schedule-suggestions";

describe("buildProducerDecisionBrief", () => {
  it("prioritizes finance holds before schedule criticals and keeps actions concise", () => {
    const resourcePulse: OverviewResourcePulse = {
      projectId: "demo-project",
      grade: "hold",
      totalBudget: 2000,
      actualTotal: 920,
      committedTotal: 1760,
      budgetBurnPct: 46,
      committedBurnPct: 88,
      reserve: 240,
      blockedPaymentTotal: 180,
      blockedPaymentCount: 1,
      missingDocumentCount: 3,
      auditReadinessPct: 40,
      primaryRiskLabel: "Camera Vendor",
      recommendation: "建议暂缓付款，先补齐审计材料。",
      actionHref: "/app/projects/demo-project/resources/report",
      signals: [
        { id: "blocked-payment", kind: "blocked-payment", label: "Blocked payments", value: 180, tone: "hold" },
        { id: "audit-docs", kind: "audit-docs", label: "Missing evidence", value: 3, tone: "hold" },
      ],
    };
    const scheduleSummary: ScheduleSuggestionSummary = {
      projectId: "demo-project",
      generatedAt: "2026-06-20T00:00:00.000Z",
      provider: "rules",
      healthScore: 54,
      criticalCount: 1,
      warningCount: 1,
      totalBudgetRisk: 75,
      narrative: "One critical schedule risk.",
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
          budgetImpact: 0,
        },
        {
          id: "task-review",
          kind: "review_bottleneck",
          severity: "warning",
          taskId: "task-2",
          taskName: "Rain comp",
          contextLabel: "VFX_0200",
          title: "Rain comp 等待审阅闭环",
          rationale: "已有版本待审。",
          action: "集中审片。",
          impactDays: 1,
          budgetImpact: 0,
        },
      ],
    };

    const brief = buildProducerDecisionBrief({
      projectId: "demo-project",
      resourcePulse,
      scheduleSummary,
      maxItems: 4,
    });

    expect(brief.headlineTone).toBe("hold");
    expect(brief.holdCount).toBe(2);
    expect(brief.watchCount).toBe(2);
    expect(brief.items.map((item) => item.kind)).toEqual(["finance", "audit", "schedule", "review"]);
    expect(brief.items[0]).toEqual(
      expect.objectContaining({
        title: "冻结付款 $180",
        href: "/app/projects/demo-project/resources/report",
        tone: "hold",
      }),
    );
    expect(brief.items[2].href).toBe("/app/projects/demo-project/tasks?task=task-1");
  });
});
