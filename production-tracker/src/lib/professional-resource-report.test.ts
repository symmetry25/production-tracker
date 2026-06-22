import { describe, expect, it } from "vitest";

import type { ResourceBudgetData } from "@/lib/resource-data";
import { buildProfessionalResourceReport } from "@/lib/professional-resource-report";
import { buildResourceReportSummary } from "@/lib/resource-report";

describe("buildProfessionalResourceReport", () => {
  it("turns budget, audit and payment signals into a producer-facing professional report", () => {
    const data: ResourceBudgetData = {
      project: {
        id: "project-ai-report",
        name: "AI Report Project",
        totalBudget: 1000,
        committedTotal: 1060,
        actualTotal: 640,
      },
      departments: [
        { id: "camera", name: "摄影组", budget: 400, committed: 460, actual: 420, risk: "over", color: "#c84c39" },
        { id: "vehicle", name: "车辆运输组", budget: 220, committed: 260, actual: 180, risk: "over", color: "#477a38" },
        { id: "dit", name: "DIT组", budget: 180, committed: 120, actual: 90, risk: "ok", color: "#4f7f9b" },
      ],
      people: [
        { id: "p1", name: "Ava", role: "DIT", department: "DIT组", vendor: "Ava Lab", grade: "B", trustScore: 88, dayRate: 100, days: 3, total: 300 },
      ],
      vendors: [
        { id: "v-camera", name: "Camera Vendor", category: "equipment", owner: "摄影组", amount: 320, status: "review", progress: 48, auditFlag: "缺交付确认" },
        { id: "v-vehicle", name: "Vehicle Vendor", category: "vehicle", owner: "车辆运输组", amount: 220, status: "review", progress: 52, auditFlag: "缺保险" },
      ],
      payments: [
        { id: "pay1", vendorId: "v-camera", vendorName: "Camera Vendor", label: "镜头包尾款", dueDate: "2026-06-20", amount: 120, status: "blocked", gate: "缺交付确认" },
        { id: "pay2", vendorId: "v-vehicle", vendorName: "Vehicle Vendor", label: "车辆追加款", dueDate: "2026-06-21", amount: 80, status: "blocked", gate: "缺车辆保险" },
      ],
      documents: [
        { id: "doc1", owner: "Camera Vendor", category: "器材", required: 5, received: 2, missing: ["签收", "发票", "交付确认"], severity: "over" },
        { id: "doc2", owner: "Vehicle Vendor", category: "车辆", required: 4, received: 1, missing: ["保险", "司机工时", "调度单"], severity: "over" },
      ],
      insights: [],
      fundFlow: [],
    };
    const summary = buildResourceReportSummary(data, "2026-06-18");

    const report = buildProfessionalResourceReport({ data, summary, reportDate: "2026-06-18" });

    expect(report.status).toBe("hold");
    expect(report.headline).toContain("HOLD");
    expect(report.executiveBrief).toContain("AI Report Project");
    expect(report.riskRadar.map((item) => item.kind)).toEqual(["finance", "audit", "budget", "vendor"]);
    expect(report.actionItems[0]).toEqual(expect.objectContaining({ owner: "制片主任", priority: "P0" }));
    expect(report.boardQuestions.join(" ")).toContain("是否批准冻结新增采购");
    expect(report.aiPrompt).toContain("请生成一份给监制和制片厂阅读的制片资源报告");
    expect(report.aiPrompt).toContain("Camera Vendor");
  });
});
