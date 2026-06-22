import { describe, expect, it } from "vitest";

import type { TaskTableItem } from "@/lib/task-data";
import { buildWorkHourHeatmap } from "@/lib/work-hour-heatmap";

const baseTask: TaskTableItem = {
  id: "task-1",
  name: "Task",
  status: "IN_PROGRESS",
  priority: 0,
  startDate: null,
  dueDate: "2026-06-24T00:00:00.000Z",
  duration: null,
  timeLogged: 4,
  estimatedCost: null,
  calculatedCost: 400,
  overBudget: false,
  context: { kind: "unassigned", id: null, label: "Unassigned", secondary: "" },
  assignees: [{ id: "u1", name: "Nora Li", department: "VFX", role: "ARTIST" }],
  reviewerIds: [],
  predecessors: [],
  successors: [],
  versionCount: 0,
  noteCount: 0,
};

describe("buildWorkHourHeatmap", () => {
  it("aggregates time logged by assignee and due date", () => {
    const heatmap = buildWorkHourHeatmap([
      baseTask,
      { ...baseTask, id: "task-2", timeLogged: 2, assignees: [{ id: "u1", name: "Nora Li", department: "VFX", role: "ARTIST" }] },
    ]);

    expect(heatmap).toHaveLength(1);
    expect(heatmap[0]).toMatchObject({ assigneeName: "Nora Li", totalDays: 6 });
    expect(heatmap[0]?.cells[0]).toMatchObject({ date: "2026-06-24", days: 6, taskCount: 2 });
  });

  it("splits task days across multiple assignees", () => {
    const heatmap = buildWorkHourHeatmap([
      {
        ...baseTask,
        timeLogged: 6,
        assignees: [
          { id: "u1", name: "Nora Li", department: "VFX", role: "ARTIST" },
          { id: "u2", name: "Lin", department: "Production", role: "PRODUCER" },
        ],
      },
    ]);

    expect(heatmap.map((row) => [row.assigneeName, row.totalDays])).toEqual([
      ["Nora Li", 3],
      ["Lin", 3],
    ]);
  });
});

