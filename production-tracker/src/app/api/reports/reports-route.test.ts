import { describe, expect, it, vi } from "vitest";

import type { DashboardStats } from "@/lib/dashboard-data";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/dashboard-data", () => ({ getDashboardStats: vi.fn() }));

import { getBurndownReport } from "./burndown/route";
import { getOverviewReport } from "./overview/route";
import { getWorkloadReport } from "./workload/route";

const session = { user: { id: "demo-admin", role: "ADMIN" } };

const stats: DashboardStats = {
  project: {
    id: "demo",
    name: "Demo",
    code: "DEMO",
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

    expect(overview.status).toBe(422);
    expect(burndown.status).toBe(422);
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
});
