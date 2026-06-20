import { describe, expect, it } from "vitest";

import {
  buildResourcePlanningData,
  filterResourcePlanningByDepartment,
  getResourcePlanningData,
  type PlanningCalendarException,
  type PlanningPerson,
  type PlanningTask,
} from "@/lib/resource-planning";
import { rebuildResourcePlanningWithCalendarExceptions } from "@/lib/resource-planning-calendar";

describe("buildResourcePlanningData", () => {
  it("splits task workload across assigned users and weeks", () => {
    const people: PlanningPerson[] = [
      { id: "u1", name: "Artist One", department: "Animation", capacity: 5 },
      { id: "u2", name: "Artist Two", department: "Animation", capacity: 5 },
    ];
    const tasks: PlanningTask[] = [
      {
        id: "t1",
        name: "Shot animation",
        status: "IN_PROGRESS",
        startDate: "2026-06-01",
        dueDate: "2026-06-05",
        duration: 5,
        contextLabel: "SH_010",
        assignees: people,
      },
    ];

    const data = buildResourcePlanningData({ people, tasks, start: "2026-06-01", end: "2026-06-14" });

    expect(data.weeks).toHaveLength(2);
    expect(data.users[0]?.weeks[0]?.workload).toBe(2.5);
    expect(data.users[1]?.weeks[0]?.workload).toBe(2.5);
    expect(data.capacity[0]?.workload).toBe(5);
    expect(data.capacity[0]?.daysOverUnder).toBe(-5);
  });

  it("reports unassigned workload separately", () => {
    const people: PlanningPerson[] = [{ id: "u1", name: "Artist One", department: "FX", capacity: 5 }];
    const tasks: PlanningTask[] = [
      {
        id: "t1",
        name: "FX pass",
        status: "WAITING_TO_START",
        startDate: "2026-06-01",
        dueDate: "2026-06-03",
        duration: 3,
        contextLabel: "FX_001",
        assignees: [],
      },
    ];

    const data = buildResourcePlanningData({ people, tasks, start: "2026-06-01", end: "2026-06-07" });

    expect(data.totals.unassignedWorkload).toBe(3);
    expect(data.totals.workload).toBe(0);
    expect(data.unassignedWeeks[0]?.workload).toBe(3);
    expect(data.unassignedWeeks[0]?.tasks[0]?.name).toBe("FX pass");
  });

  it("reduces weekly capacity for calendar exceptions", () => {
    const people: PlanningPerson[] = [
      { id: "u1", name: "Artist One", department: "FX", capacity: 5 },
      { id: "u2", name: "Artist Two", department: "FX", capacity: 4 },
    ];
    const tasks: PlanningTask[] = [];

    const data = buildResourcePlanningData({
      people,
      tasks,
      start: "2026-06-01",
      end: "2026-06-07",
      calendarExceptions: [
        {
          date: "2026-06-03",
          type: "STUDIO_CLOSURE",
          description: "Stage power shutdown",
          hoursWorked: 0,
        },
        {
          date: "2026-06-04",
          type: "REDUCED_HOURS",
          description: "Half-day client review",
          hoursWorked: 4,
        },
      ],
    });

    expect(data.weeks[0]?.unavailableDays).toBe(1.5);
    expect(data.users[0]?.weeks[0]?.capacity).toBe(3.5);
    expect(data.users[1]?.weeks[0]?.capacity).toBe(2.5);
    expect(data.capacity[0]?.capacity).toBe(6);
    expect(data.weeks[0]?.exceptions).toHaveLength(2);
  });

  it("filters capacity and workload to one department", () => {
    const people: PlanningPerson[] = [
      { id: "u1", name: "Animator", department: "Animation", capacity: 5 },
      { id: "u2", name: "Compositor", department: "Comp", capacity: 4 },
    ];
    const tasks: PlanningTask[] = [
      {
        id: "t1",
        name: "ANM",
        status: "IN_PROGRESS",
        startDate: "2026-06-01",
        dueDate: "2026-06-05",
        duration: 5,
        contextLabel: "SH_010",
        assignees: [people[0]!],
      },
      {
        id: "t2",
        name: "CMP",
        status: "READY_TO_START",
        startDate: "2026-06-01",
        dueDate: "2026-06-03",
        duration: 3,
        contextLabel: "SH_020",
        assignees: [people[1]!],
      },
    ];

    const data = buildResourcePlanningData({ people, tasks, start: "2026-06-01", end: "2026-06-07" });
    const animation = filterResourcePlanningByDepartment(data, "Animation");

    expect(animation.users).toHaveLength(1);
    expect(animation.departments).toHaveLength(1);
    expect(animation.totals.capacity).toBe(5);
    expect(animation.totals.workload).toBe(5);
    expect(animation.capacity[0]?.workload).toBe(5);
    expect(animation.users[0]?.name).toBe("Animator");
  });

  it("rebuilds capacity when local calendar exceptions change", () => {
    const people: PlanningPerson[] = [{ id: "u1", name: "Artist One", department: "FX", capacity: 5 }];
    const tasks: PlanningTask[] = [];
    const data = buildResourcePlanningData({ people, tasks, start: "2026-06-01", end: "2026-06-07" });
    const exception: PlanningCalendarException = {
      date: "2026-06-02",
      type: "STUDIO_CLOSURE",
      description: "Local outage",
      hoursWorked: 0,
    };

    const withException = rebuildResourcePlanningWithCalendarExceptions(data, [exception]);
    const restored = rebuildResourcePlanningWithCalendarExceptions(withException, []);

    expect(withException.totals.capacity).toBe(4);
    expect(withException.weeks[0]?.exceptions).toHaveLength(1);
    expect(restored.totals.capacity).toBe(5);
    expect(restored.weeks[0]?.exceptions).toHaveLength(0);
  });

  it("preserves existing weekly workload when calendar exceptions change", () => {
    const people: PlanningPerson[] = [{ id: "u1", name: "Artist One", department: "FX", capacity: 5 }];
    const tasks: PlanningTask[] = [
      {
        id: "t1",
        name: "FX pass",
        status: "IN_PROGRESS",
        startDate: "2026-06-01",
        dueDate: "2026-06-14",
        duration: 10,
        contextLabel: "FX_001",
        assignees: [people[0]!],
      },
    ];
    const data = buildResourcePlanningData({ people, tasks, start: "2026-06-01", end: "2026-06-14" });

    const withException = rebuildResourcePlanningWithCalendarExceptions(data, [
      {
        date: "2026-06-03",
        type: "STUDIO_CLOSURE",
        description: "Local outage",
        hoursWorked: 0,
      },
    ]);

    expect(data.capacity.map((week) => week.workload)).toEqual([5, 5]);
    expect(withException.capacity.map((week) => week.workload)).toEqual([5, 5]);
    expect(withException.users[0]?.weeks.map((week) => week.tasks.length)).toEqual([1, 1]);
  });

  it("uses the full film-crew roster for demo resource planning", async () => {
    const originalDatabaseUrl = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;

    try {
      const data = await getResourcePlanningData("demo-mkali-mission", "2026-05-01", "2026-06-30");

      expect(data.users.length).toBeGreaterThanOrEqual(24);
      expect(data.users.map((user) => user.department)).toEqual(
        expect.arrayContaining([
          "演员/选角组",
          "摄影助理组",
          "酒店住宿组",
          "车辆运输组",
          "财务审计组",
        ]),
      );
      expect(data.users.map((user) => user.name)).toEqual(expect.arrayContaining(["沈知夏", "林会计", "苏敏"]));
      expect(data.departments.map((department) => department.department)).toEqual(expect.arrayContaining(["摄影组", "DIT组", "调色/VFX组"]));
    } finally {
      if (originalDatabaseUrl === undefined) {
        delete process.env.DATABASE_URL;
      } else {
        process.env.DATABASE_URL = originalDatabaseUrl;
      }
    }
  });
});
