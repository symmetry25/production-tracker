import { describe, expect, it } from "vitest";

import { reassignTaskInPlanningData } from "@/lib/resource-planning-actions";
import { buildResourcePlanningData, type PlanningPerson, type PlanningTask } from "@/lib/resource-planning";

describe("resource planning actions", () => {
  it("moves task workload from one user to another and recalculates capacity rows", () => {
    const people: PlanningPerson[] = [
      { id: "u1", name: "DIT One", department: "DIT组", capacity: 5 },
      { id: "u2", name: "DIT Two", department: "DIT组", capacity: 5 },
    ];
    const tasks: PlanningTask[] = [
      {
        id: "task-1",
        name: "Backup cards",
        status: "IN_PROGRESS",
        startDate: "2026-06-01",
        dueDate: "2026-06-05",
        duration: 5,
        contextLabel: "RAID_0010",
        assignees: [people[0]!],
      },
    ];
    const data = buildResourcePlanningData({ people, tasks, start: "2026-06-01", end: "2026-06-07" });

    const reassigned = reassignTaskInPlanningData(data, "task-1", "u1", "u2");

    expect(reassigned.users.find((user) => user.id === "u1")?.weeks[0]?.workload).toBe(0);
    expect(reassigned.users.find((user) => user.id === "u2")?.weeks[0]?.workload).toBe(5);
    expect(reassigned.users.find((user) => user.id === "u1")?.weeks[0]?.tasks).toHaveLength(0);
    expect(reassigned.users.find((user) => user.id === "u2")?.weeks[0]?.tasks[0]?.name).toBe("Backup cards");
    expect(reassigned.capacity[0]?.workload).toBe(5);
    expect(reassigned.departments[0]?.weeks[0]?.workload).toBe(5);
  });
});
