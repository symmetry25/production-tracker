import { describe, expect, it } from "vitest";

import type { ResourceBudgetData } from "@/lib/resource-data";
import { buildResourceReportSummary } from "@/lib/resource-report";

describe("buildResourceReportSummary", () => {
  it("summarizes producer-facing budget, audit and payment signals from resource data", () => {
    const data: ResourceBudgetData = {
      project: {
        id: "project-report",
        name: "Report Project",
        totalBudget: 1000,
        committedTotal: 780,
        actualTotal: 460,
      },
      departments: [
        { id: "camera", name: "摄影组", budget: 400, committed: 440, actual: 420, risk: "over", color: "#c84c39" },
        { id: "dit", name: "DIT组", budget: 260, committed: 180, actual: 160, risk: "ok", color: "#4f7f9b" },
      ],
      people: [
        { id: "p1", name: "Ava", role: "DIT", department: "DIT组", vendor: "个人", grade: "B", trustScore: 86, dayRate: 100, days: 3, total: 300 },
        { id: "p2", name: "Lin", role: "DP", department: "摄影组", vendor: "公司", grade: "A", trustScore: 94, dayRate: 120, days: 4, total: 480 },
      ],
      vendors: [
        { id: "v1", name: "Camera Vendor", category: "equipment", owner: "摄影组", amount: 320, status: "review", progress: 48, auditFlag: "缺交付确认" },
        { id: "v2", name: "Hotel Vendor", category: "hotel", owner: "制片组", amount: 180, status: "contracted", progress: 76, auditFlag: "正常" },
      ],
      payments: [
        { id: "pay1", vendorId: "v1", vendorName: "Camera Vendor", label: "镜头包尾款", dueDate: "2026-06-20", amount: 120, status: "blocked", gate: "缺交付确认" },
        { id: "pay2", vendorId: "v2", vendorName: "Hotel Vendor", label: "酒店定金", dueDate: "2026-06-24", amount: 90, status: "scheduled", gate: "名单确认" },
      ],
      documents: [
        { id: "doc1", owner: "Camera Vendor", category: "器材", required: 5, received: 2, missing: ["签收", "发票", "升级说明"], severity: "over" },
        { id: "doc2", owner: "Hotel Vendor", category: "酒店", required: 3, received: 3, missing: [], severity: "ok" },
      ],
      insights: [],
      fundFlow: [],
    };

    const summary = buildResourceReportSummary(data, "2026-06-18");

    expect(summary.budgetBurnPct).toBe(46);
    expect(summary.committedBurnPct).toBe(78);
    expect(summary.reserve).toBe(220);
    expect(summary.blockedPaymentTotal).toBe(120);
    expect(summary.blockedPaymentCount).toBe(1);
    expect(summary.dueSoonPaymentTotal).toBe(210);
    expect(summary.dueSoonPaymentCount).toBe(2);
    expect(summary.missingDocumentCount).toBe(3);
    expect(summary.auditReadinessPct).toBe(63);
    expect(summary.overBudgetDepartments).toEqual(["摄影组"]);
    expect(summary.watchVendors).toEqual(["Camera Vendor"]);
    expect(summary.topDepartmentName).toBe("摄影组");
    expect(summary.topVendorName).toBe("Camera Vendor");
    expect(summary.peopleCostTotal).toBe(780);
    expect(summary.averageTrustScore).toBe(90);
    expect(summary.reportGrade).toBe("hold");
    expect(summary.recommendation).toContain("建议暂缓");
  });
});
