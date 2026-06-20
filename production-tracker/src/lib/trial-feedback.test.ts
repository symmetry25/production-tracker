import { describe, expect, it } from "vitest";

import { buildTrialFeedbackSummary, type TrialFeedbackResponse } from "@/lib/trial-feedback";

describe("buildTrialFeedbackSummary", () => {
  it("prioritizes qualified testers and repeated product themes", () => {
    const summary = buildTrialFeedbackSummary([
      response("producer", { valueScore: 5, workflowFitScore: 4, willingnessToPay: "yes", requestedFeatures: ["预算审批", "Excel 导入"], blockers: ["权限不够细"] }),
      response("vfx", { valueScore: 4, workflowFitScore: 4, willingnessToPay: "maybe", requestedFeatures: ["预算审批", "供应商审片"], blockers: ["权限不够细"] }),
      response("finance", { valueScore: 4, workflowFitScore: 5, willingnessToPay: "yes", requestedFeatures: ["审计导出", "预算审批"], blockers: [] }),
    ]);

    expect(summary.totalResponses).toBe(3);
    expect(summary.qualifiedLeadCount).toBe(3);
    expect(summary.commercialSignal).toBe("strong");
    expect(summary.topThemes[0]).toEqual(expect.objectContaining({ label: "预算审批", count: 3, kind: "feature" }));
    expect(summary.nextActions[0]).toContain("预算审批");
  });

  it("downgrades the signal when trial blockers are critical", () => {
    const responses: TrialFeedbackResponse[] = [
      response("producer", { valueScore: 5, workflowFitScore: 4, willingnessToPay: "yes", blockerSeverity: "critical", blockers: ["真实项目不能导入"] }),
      response("supervisor", { valueScore: 4, workflowFitScore: 4, willingnessToPay: "maybe", blockerSeverity: "major", blockers: ["权限不够细"] }),
    ];

    const summary = buildTrialFeedbackSummary(responses);

    expect(summary.criticalBlockerCount).toBe(1);
    expect(summary.commercialSignal).toBe("blocked");
    expect(summary.recommendation).toContain("先修复关键阻断");
  });
});

function response(id: string, overrides: Partial<TrialFeedbackResponse>): TrialFeedbackResponse {
  return {
    id,
    testerName: id,
    organization: "Demo Studio",
    role: "制片",
    testedAt: "2026-06-20",
    valueScore: 3,
    clarityScore: 3,
    workflowFitScore: 3,
    willingnessToPay: "maybe",
    blockerSeverity: "minor",
    blockers: [],
    requestedFeatures: [],
    quote: "可以继续试。",
    nextStepOwner: "Product",
    ...overrides,
  };
}
