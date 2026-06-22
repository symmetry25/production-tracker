import type { TaskTableItem } from "@/lib/task-data";

export type WorkHourHeatmapCell = {
  date: string;
  days: number;
  taskCount: number;
};

export type WorkHourHeatmapRow = {
  assigneeId: string;
  assigneeName: string;
  department: string;
  totalDays: number;
  cells: WorkHourHeatmapCell[];
};

export function buildWorkHourHeatmap(tasks: TaskTableItem[], maxDays = 7): WorkHourHeatmapRow[] {
  const dates = Array.from(new Set(tasks.map((task) => task.dueDate?.slice(0, 10)).filter((date): date is string => Boolean(date)))).sort().slice(0, maxDays);
  const rows = new Map<string, WorkHourHeatmapRow>();

  for (const task of tasks) {
    const date = task.dueDate?.slice(0, 10);
    if (!date || !dates.includes(date)) continue;

    const assignees = task.assignees.length ? task.assignees : [{ id: "unassigned", name: "Unassigned", department: "未分配" }];
    const share = task.timeLogged / assignees.length;

    for (const assignee of assignees) {
      const row = rows.get(assignee.id) ?? {
        assigneeId: assignee.id,
        assigneeName: assignee.name,
        department: assignee.department ?? "未分配",
        totalDays: 0,
        cells: dates.map((cellDate) => ({ date: cellDate, days: 0, taskCount: 0 })),
      };
      const cell = row.cells.find((item) => item.date === date);

      if (cell) {
        cell.days = roundDays(cell.days + share);
        cell.taskCount += 1;
      }

      row.totalDays = roundDays(row.totalDays + share);
      rows.set(assignee.id, row);
    }
  }

  return Array.from(rows.values())
    .map((row, index) => ({ row, index }))
    .sort((a, b) => b.row.totalDays - a.row.totalDays || a.index - b.index)
    .map((item) => item.row)
    .slice(0, 8);
}

function roundDays(value: number) {
  return Math.round(value * 10) / 10;
}
