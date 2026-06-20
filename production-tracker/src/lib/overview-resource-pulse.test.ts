import { describe, expect, it } from "vitest";

import type { ResourceBudgetData } from "@/lib/resource-data";
import { buildOverviewResourcePulse } from "@/lib/overview-resource-pulse";

describe("buildOverviewResourcePulse", () => {
  it("summarizes finance and audit signals for the project overview", () => {
    const data: ResourceBudgetData = {
      project: {
        id: "pulse-project",
        name: "Pulse Project",
        totalBudget: 2000,
        actualTotal: 920,
        committedTotal: 1760,
      },
      departments: [
        { id: "camera", name: "摄影组", budget: 700, committed: 760, actual: 680, risk: "over", color: "#c84c39" },
        { id: "dit", name: "DIT组", budget: 300, committed: 260, actual: 180, risk: "ok", color: "#4f7f9b" },
      ],
      people: [
        { id: "p1", name: "Ava", role: "DIT", department: "DIT组", vendor: "Ava Lab", grade: "B", trustScore: 88, dayRate: 100, days: 3, total: 300 },
      ],
      vendors: [
        { id: "vendor-camera", name: "Camera Vendor", category: "equipment", owner: "摄影组", amount: 420, status: "review", progress: 48, auditFlag: "缺签收" },
      ],
      payments: [
        { id: "pay-camera", vendorId: "vendor-camera", vendorName: "Camera Vendor", label: "镜头包尾款", dueDate: "2026-06-22", amount: 180, status: "blocked", gate: "缺审批截图" },
      ],
      documents: [
        { id: "doc-camera", owner: "Camera Vendor", category: "器材", required: 5, received: 2, missing: ["签收", "发票", "审批截图"], severity: "over" },
      ],
      insights: [],
      fundFlow: [],
    };

    const pulse = buildOverviewResourcePulse(data, "2026-06-20");

    expect(pulse.grade).toBe("hold");
    expect(pulse.budgetBurnPct).toBe(46);
    expect(pulse.committedBurnPct).toBe(88);
    expect(pulse.reserve).toBe(240);
    expect(pulse.blockedPaymentTotal).toBe(180);
    expect(pulse.auditReadinessPct).toBe(40);
    expect(pulse.primaryRiskLabel).toBe("Camera Vendor");
    expect(pulse.actionHref).toBe("/app/projects/pulse-project/resources/report");
    expect(pulse.signals.map((signal) => signal.kind)).toEqual(["blocked-payment", "audit-docs", "department-risk", "vendor-review"]);
  });
});
