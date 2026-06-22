import { describe, expect, it, vi } from "vitest";

import type { DashboardStats } from "@/lib/dashboard-data";
import type { ResourceBudgetData } from "@/lib/resource-data";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/dashboard-data", () => ({ getDashboardStats: vi.fn() }));

import { getBurndownReport } from "./burndown/route";
import { getOverviewReport } from "./overview/route";
import { getProducerAgendaReport } from "./producer-agenda/route";
import { getProfessionalResourceReport } from "./professional-resource/route";
import { getWorkloadReport } from "./workload/route";
import { getScheduleSuggestions } from "../projects/[projectId]/schedule-suggestions/route";

const session = { user: { id: "demo-admin", role: "ADMIN" } };

const stats: DashboardStats = {
  project: {
    id: "demo",
    name: "Demo",
    code: "DEMO",
    thumbnailUrl: null,
    description: null,
    startDate: "2026-05-01T00:00:00.000Z",
    dueDate: "2026-06-01T00:00:00.000Z",
    milestone: "Delivery",
    milestoneDate: "2026-06-01T00:00:00.000Z",
    daysRemaining: 10,
    progressPct: 60,
  },
  counts: {
    shots: 2,
    assets: 1,
    tasks: 10,
    versions: 3,
    crew: 2,
  },
  shotStatus: [{ name: "In Progress", value: 2, color: "#fff" }],
  assetStatus: [],
  taskStatus: [],
  velocity: [
    { week: "2026-05-04", approved: 2, final: 1 },
    { week: "2026-05-11", approved: 1, final: 3 },
  ],
  versionStatus: [{ status: "PENDING_REVIEW", label: "Pending Review", value: 2 }],
  pctFinalByDept: [{ department: "Comp", pctFinal: 50, final: 1, total: 2 }],
  crew: [
    {
      id: "u1",
      name: "Artist One",
      department: "Comp",
      role: "ARTIST",
      taskCount: 4,
      finalCount: 1,
      loadPct: 80,
    },
  ],
  latestVersions: [],
};

describe("reports routes", () => {
  it("rejects unauthenticated overview requests", async () => {
    const response = await getOverviewReport(new Request("http://app.test/api/reports/overview?projectId=demo"), {
      auth: vi.fn().mockResolvedValue(null),
      getDashboardStats: vi.fn(),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: "Unauthorized" });
  });

  it("requires projectId for overview and burndown reports", async () => {
    const deps = {
      auth: vi.fn().mockResolvedValue(session),
      getDashboardStats: vi.fn(),
    };

    const overview = await getOverviewReport(new Request("http://app.test/api/reports/overview"), deps);
    const burndown = await getBurndownReport(new Request("http://app.test/api/reports/burndown"), deps);
    const producerAgenda = await getProducerAgendaReport(new Request("http://app.test/api/reports/producer-agenda"), {
      ...deps,
      getTaskTableItems: vi.fn(),
      getResourceBudgetData: vi.fn(),
    });
    const professionalResource = await getProfessionalResourceReport(new Request("http://app.test/api/reports/professional-resource"), {
      ...deps,
      getResourceBudgetData: vi.fn(),
    });

    expect(overview.status).toBe(422);
    expect(burndown.status).toBe(422);
    expect(producerAgenda.status).toBe(422);
    expect(professionalResource.status).toBe(422);
    expect(deps.getDashboardStats).not.toHaveBeenCalled();
  });

  it("returns overview report slices", async () => {
    const response = await getOverviewReport(new Request("http://app.test/api/reports/overview?projectId=demo"), {
      auth: vi.fn().mockResolvedValue(session),
      getDashboardStats: vi.fn().mockResolvedValue(stats),
    });

    await expect(response.json()).resolves.toMatchObject({
      data: {
        counts: { tasks: 10 },
        shotStatus: [{ name: "In Progress", value: 2 }],
        pctFinalByDept: [{ department: "Comp", pctFinal: 50 }],
      },
      error: null,
    });
  });

  it("returns cumulative burndown rows", async () => {
    const response = await getBurndownReport(new Request("http://app.test/api/reports/burndown?projectId=demo"), {
      auth: vi.fn().mockResolvedValue(session),
      getDashboardStats: vi.fn().mockResolvedValue(stats),
    });

    await expect(response.json()).resolves.toMatchObject({
      data: [
        { week: "2026-05-04", completed: 3, remaining: 7 },
        { week: "2026-05-11", completed: 7, remaining: 3 },
      ],
      error: null,
    });
  });

  it("defaults workload to the demo project", async () => {
    const getDashboardStats = vi.fn().mockResolvedValue(stats);
    const response = await getWorkloadReport(new Request("http://app.test/api/reports/workload"), {
      auth: vi.fn().mockResolvedValue(session),
      getDashboardStats,
    });

    expect(getDashboardStats).toHaveBeenCalledWith("demo-mkali-mission");
    await expect(response.json()).resolves.toMatchObject({
      data: [{ id: "u1", taskCount: 4 }],
      error: null,
    });
  });

  it("returns project schedule suggestions", async () => {
    const response = await getScheduleSuggestions(
      new Request("http://app.test/api/projects/demo/schedule-suggestions"),
      { params: Promise.resolve({ projectId: "demo" }) },
      {
        auth: vi.fn().mockResolvedValue(session),
        getTaskTableItems: vi.fn().mockResolvedValue([{ id: "task-1", name: "Risky task" }]),
        buildScheduleSuggestionsWithAi: vi.fn().mockResolvedValue({
          projectId: "demo",
          provider: "rules",
          healthScore: 72,
          criticalCount: 1,
          warningCount: 2,
          totalBudgetRisk: 1300,
          generatedAt: "2026-06-18T00:00:00.000Z",
          narrative: "先处理逾期和超预算任务。",
          suggestions: [{ id: "task-1:overdue", kind: "overdue", severity: "critical", taskId: "task-1", taskName: "Risky task" }],
        }),
      },
    );

    await expect(response.json()).resolves.toMatchObject({
      data: {
        projectId: "demo",
        healthScore: 72,
        suggestions: [{ kind: "overdue", severity: "critical" }],
      },
      error: null,
    });
  });

  it("returns a producer agenda report that combines overview, resource and schedule signals", async () => {
    const response = await getProducerAgendaReport(new Request("http://app.test/api/reports/producer-agenda?projectId=demo"), {
      auth: vi.fn().mockResolvedValue(session),
      getDashboardStats: vi.fn().mockResolvedValue(stats),
      getTaskTableItems: vi.fn().mockResolvedValue([
        {
          id: "task-overdue",
          name: "VFX turnover",
          status: "IN_PROGRESS",
          priority: 3,
          startDate: "2026-05-01T00:00:00.000Z",
          dueDate: "2026-06-17T00:00:00.000Z",
          duration: 4,
          timeLogged: 3,
          estimatedCost: 500,
          calculatedCost: 300,
          overBudget: false,
          context: { kind: "shot", id: "shot-1", label: "VFX_0100", secondary: "MAIN" },
          assignees: [{ id: "artist-1", name: "Artist One", department: "VFX", role: "ARTIST" }],
          reviewerIds: [],
          predecessors: [],
          successors: [],
          versionCount: 0,
          noteCount: 0,
        },
      ]),
      getResourceBudgetData: vi.fn().mockResolvedValue(resourceData),
      now: () => new Date("2026-06-20T00:00:00.000Z"),
    });

    await expect(response.json()).resolves.toMatchObject({
      data: {
        projectId: "demo",
        projectCode: "DEMO",
        generatedAt: "2026-06-20T00:00:00.000Z",
        summary: {
          headlineTone: "hold",
          holdCount: 2,
          auditReadinessPct: 50,
          scheduleHealthScore: 82,
        },
        rows: expect.arrayContaining([
          ["project", "name", "Demo", "DEMO", ""],
          ["finance", "blocked_payments", "$180", "1 payments blocked", "Line Producer"],
          ["decision", "01 · Payment · Action needed", "冻结付款 $180", "建议暂缓 $180 付款，先补齐审计材料和付款关口，再由制片主任放行。", "/app/projects/demo/resources/report"],
          ["schedule", "critical · overdue", "VFX turnover 已逾期 3 天", "安排当日 standup 决策：补人、拆 scope，或把下游依赖整体后移。", "VFX_0100"],
        ]),
      },
      error: null,
    });
  });

  it("returns a professional resource report for producer and studio review", async () => {
    const response = await getProfessionalResourceReport(new Request("http://app.test/api/reports/professional-resource?projectId=demo"), {
      auth: vi.fn().mockResolvedValue(session),
      getResourceBudgetData: vi.fn().mockResolvedValue(resourceData),
      now: () => new Date("2026-06-20T00:00:00.000Z"),
    });

    await expect(response.json()).resolves.toMatchObject({
      data: {
        projectId: "demo",
        generatedAt: "2026-06-20T00:00:00.000Z",
        report: {
          status: "hold",
          headline: expect.stringContaining("HOLD"),
          riskRadar: expect.arrayContaining([expect.objectContaining({ kind: "finance" })]),
          actionItems: expect.arrayContaining([expect.objectContaining({ owner: "制片主任" })]),
          aiPrompt: expect.stringContaining("请生成一份给监制和制片厂阅读的制片资源报告"),
        },
      },
      error: null,
    });
  });
});

const resourceData: ResourceBudgetData = {
  project: {
    id: "demo",
    name: "Demo",
    totalBudget: 1000,
    actualTotal: 460,
    committedTotal: 860,
  },
  departments: [
    {
      id: "camera",
      name: "摄影组",
      budget: 500,
      committed: 520,
      actual: 460,
      risk: "over",
      color: "#c84c39",
    },
  ],
  people: [],
  vendors: [
    {
      id: "vendor-camera",
      name: "Camera Vendor",
      category: "equipment",
      owner: "摄影组",
      amount: 180,
      status: "review",
      progress: 60,
      auditFlag: "待复核",
    },
  ],
  payments: [
    {
      id: "payment-camera",
      vendorId: "vendor-camera",
      vendorName: "Camera Vendor",
      label: "尾款",
      dueDate: "2026-06-21",
      amount: 180,
      status: "blocked",
      gate: "缺材料",
    },
  ],
  documents: [
    {
      id: "doc-camera",
      owner: "Camera Vendor",
      category: "器材",
      required: 4,
      received: 2,
      missing: ["合同", "发票"],
      severity: "over",
    },
  ],
  insights: [],
  fundFlow: [],
};
