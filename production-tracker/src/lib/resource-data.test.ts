import { describe, expect, it } from "vitest";

import { buildResourceBudgetDataFromProject, getResourceBudgetData, type ResourceProjectSnapshot } from "@/lib/resource-data";

describe("buildResourceBudgetDataFromProject", () => {
  it("derives department, people, vendor and fund-flow data from live project tasks", () => {
    const snapshot: ResourceProjectSnapshot = {
      id: "project-live",
      name: "Live Production",
      tasks: [
        {
          id: "task-camera",
          name: "Camera prep",
          status: "IN_PROGRESS",
          timeLogged: 5,
          estimatedCost: 3000,
          asset: { id: "asset-rig", name: "Camera rig", type: "RIG", status: "IN_PROGRESS" },
          shot: null,
          assignments: [
            {
              user: {
                id: "user-dp",
                name: "Dana DP",
                role: "SUPERVISOR",
                department: "摄影组",
                capacity: 4,
                userGrade: { grade: { code: "B" } },
                scores: [{ score: 88, dimension: { maxScore: 100, weight: 1 } }],
              },
            },
          ],
        },
        {
          id: "task-vehicle",
          name: "Picture car test",
          status: "PENDING_REVIEW",
          timeLogged: 4,
          estimatedCost: 200,
          asset: { id: "asset-car", name: "Picture car", type: "VEHICLE", status: "PENDING_REVIEW" },
          shot: null,
          assignments: [
            {
              user: {
                id: "user-transport",
                name: "Tao Transport",
                role: "ARTIST",
                department: "车辆组",
                capacity: 5,
                userGrade: null,
                scores: [],
              },
            },
          ],
        },
        {
          id: "task-location",
          name: "Location survey",
          status: "APPROVED",
          timeLogged: 3,
          estimatedCost: 900,
          asset: { id: "asset-location", name: "Hotel hallway", type: "ENVIRONMENT", status: "APPROVED" },
          shot: null,
          assignments: [],
        },
      ],
      assets: [
        { id: "asset-rig", name: "Camera rig", type: "RIG", status: "IN_PROGRESS" },
        { id: "asset-car", name: "Picture car", type: "VEHICLE", status: "PENDING_REVIEW" },
        { id: "asset-location", name: "Hotel hallway", type: "ENVIRONMENT", status: "APPROVED" },
      ],
    };

    const data = buildResourceBudgetDataFromProject(snapshot);

    expect(data.project.name).toBe("Live Production");
    expect(data.project.totalBudget).toBe(4100);
    expect(data.project.actualTotal).toBe(1200);
    expect(data.departments.map((department) => department.name)).toEqual(expect.arrayContaining(["摄影组", "车辆组", "场地/置景组"]));
    expect(data.departments.find((department) => department.name === "车辆组")?.risk).toBe("over");
    expect(data.people).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Dana DP", department: "摄影组", grade: "B", trustScore: 88, days: 5, total: 500 }),
        expect.objectContaining({ name: "Tao Transport", department: "车辆组", grade: "C", trustScore: 75, days: 4, total: 400 }),
      ]),
    );
    expect(data.vendors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: "equipment", owner: "摄影组", amount: 3000 }),
        expect.objectContaining({ category: "vehicle", owner: "车辆组", amount: 200, status: "review" }),
        expect.objectContaining({ category: "location", owner: "场地/置景组", amount: 900 }),
      ]),
    );
    expect(data.payments.some((payment) => payment.vendorName.includes("车辆"))).toBe(true);
    expect(data.documents.some((document) => document.owner.includes("车辆"))).toBe(true);
    expect(data.fundFlow).toEqual(
      expect.arrayContaining([
        { from: "总预算", to: "摄影组", amount: 3000 },
        { from: "摄影组", to: "器材供应商", amount: 3000 },
        { from: "车辆组", to: "车辆供应商", amount: 200 },
      ]),
    );
  });
});

describe("demo resource budget data", () => {
  it("ships a complete film-crew demo package with departments, vendors, audit gates and fund flow", async () => {
    const originalDatabaseUrl = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;

    try {
      const data = await getResourceBudgetData("demo-mkali-mission");

      expect(data.departments).toHaveLength(21);
      expect(data.departments.map((department) => department.name)).toEqual(
        expect.arrayContaining([
          "制片组",
          "导演组",
          "演员/选角组",
          "摄影组",
          "DIT组",
          "灯光电工组",
          "器械/Grip组",
          "酒店住宿组",
          "车辆运输组",
          "财务审计组",
        ]),
      );
      expect(data.people.length).toBeGreaterThanOrEqual(24);
      expect(data.people.map((person) => person.role)).toEqual(
        expect.arrayContaining(["Producer", "1st AD", "Director of Photography", "Digital Imaging Technician", "Lead Actor", "Production Accountant"]),
      );
      expect(new Set(data.vendors.map((vendor) => vendor.category))).toEqual(new Set(["equipment", "vehicle", "hotel", "location", "vfx", "production"]));
      expect(data.vendors.length).toBeGreaterThanOrEqual(12);
      expect(data.payments.some((payment) => payment.status === "blocked" && payment.vendorName.includes("VFX"))).toBe(true);
      expect(data.documents.some((document) => document.category === "酒店住宿" && document.missing.length > 0)).toBe(true);
      expect(data.fundFlow).toEqual(expect.arrayContaining([{ from: "总预算", to: "未分配/预备金", amount: 210000 }]));
      expect(data.project.totalBudget).toBe(5_200_000);
      expect(data.project.committedTotal).toBeLessThan(data.project.totalBudget);
    } finally {
      if (originalDatabaseUrl === undefined) {
        delete process.env.DATABASE_URL;
      } else {
        process.env.DATABASE_URL = originalDatabaseUrl;
      }
    }
  });
});
