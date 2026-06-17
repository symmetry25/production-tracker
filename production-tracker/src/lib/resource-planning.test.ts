import { describe, expect, it } from "vitest";

import { buildResourcePlanningData, filterResourcePlanningByDepartment, type PlanningPerson, type PlanningTask } from "@/lib/resource-planning";

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
});
