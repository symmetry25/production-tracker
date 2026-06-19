import { describe, expect, it } from "vitest";

import type { ResourceBudgetData } from "@/lib/resource-data";
import { buildProjectPortfolio } from "@/lib/project-portfolio";
import type { ProjectGridItem } from "@/lib/project-data";

describe("buildProjectPortfolio", () => {
  it("prioritizes projects with blocked payments, over-budget departments and near due dates", () => {
    const projects: ProjectGridItem[] = [
      createProject({
        id: "stable-project",
        name: "Stable Project",
        dueDate: "2026-08-30",
        milestoneDate: "2026-07-15",
        progress: 34,
      }),
      createProject({
        id: "risk-project",
        name: "Risk Project",
        dueDate: "2026-06-23",
        milestoneDate: "2026-06-21",
        progress: 82,
      }),
    ];

    const portfolio = buildProjectPortfolio(
      projects,
      {
        "stable-project": createResourceData({
          projectId: "stable-project",
          totalBudget: 1000,
          actualTotal: 420,
          committedTotal: 620,
        }),
        "risk-project": createResourceData({
          projectId: "risk-project",
          totalBudget: 1000,
          actualTotal: 760,
          committedTotal: 1120,
          blockedPaymentAmount: 180,
          missingDocuments: 3,
          departmentRisk: "over",
        }),
      },
      "2026-06-20",
    );

    expect(portfolio.items.map((item) => item.id)).toEqual(["risk-project", "stable-project"]);
    expect(portfolio.atRiskCount).toBe(1);
    expect(portfolio.blockedPaymentTotal).toBe(180);
    expect(portfolio.missingDocumentCount).toBe(3);
    expect(portfolio.items[0]).toEqual(
      expect.objectContaining({
        health: "hold",
        actionKind: "audit",
        daysRemaining: 3,
        milestoneDaysRemaining: 1,
      }),
    );
    expect(portfolio.items[1].health).toBe("clear");
  });
});

function createProject(input: {
  id: string;
  name: string;
  dueDate: string;
  milestoneDate: string;
  progress: number;
}): ProjectGridItem {
  return {
    id: input.id,
    name: input.name,
    code: input.id.slice(0, 6).toUpperCase(),
    thumbnailUrl: null,
    description: null,
    startDate: new Date("2026-06-01T00:00:00.000Z"),
    dueDate: new Date(`${input.dueDate}T00:00:00.000Z`),
    milestone: "Next milestone",
    milestoneDate: new Date(`${input.milestoneDate}T00:00:00.000Z`),
    status: "active",
    createdAt: new Date("2026-05-20T00:00:00.000Z"),
    shotCount: 8,
    assetCount: 5,
    taskCount: 24,
    progress: input.progress,
  };
}

function createResourceData(input: {
  projectId: string;
  totalBudget: number;
  actualTotal: number;
  committedTotal: number;
  blockedPaymentAmount?: number;
  missingDocuments?: number;
  departmentRisk?: "ok" | "watch" | "over";
}): ResourceBudgetData {
  const missingDocuments = input.missingDocuments ?? 0;

  return {
    project: {
      id: input.projectId,
      name: input.projectId,
      totalBudget: input.totalBudget,
      actualTotal: input.actualTotal,
      committedTotal: input.committedTotal,
    },
    departments: [
      {
        id: "camera",
        name: "摄影组",
        budget: 400,
        committed: input.departmentRisk === "over" ? 520 : 360,
        actual: input.departmentRisk === "over" ? 460 : 320,
        risk: input.departmentRisk ?? "ok",
        color: "#c84c39",
      },
    ],
    people: [],
    vendors: [],
    payments: input.blockedPaymentAmount
      ? [
          {
            id: "blocked-payment",
            vendorId: "vendor",
            vendorName: "Vendor",
            label: "尾款",
            dueDate: "2026-06-21",
            amount: input.blockedPaymentAmount,
            status: "blocked",
            gate: "缺审批材料",
          },
        ]
      : [],
    documents: [
      {
        id: "camera-docs",
        owner: "Vendor",
        category: "器材",
        required: Math.max(1, missingDocuments),
        received: Math.max(1, missingDocuments) - missingDocuments,
        missing: Array.from({ length: missingDocuments }, (_, index) => `材料 ${index + 1}`),
        severity: missingDocuments > 0 ? "over" : "ok",
      },
    ],
    insights: [],
    fundFlow: [],
  };
}
