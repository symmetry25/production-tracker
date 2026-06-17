import { addDays, differenceInCalendarDays, eachWeekOfInterval, endOfWeek, format, isWithinInterval, max, min, parseISO } from "date-fns";

import { getDemoTaskTableItems, shouldUseDemoData } from "@/lib/demo-data";
import { getPrisma } from "@/lib/prisma";
import type { TaskTableItem } from "@/lib/task-data";

export type PlanningPerson = {
  id: string;
  name: string;
  department: string;
  capacity: number;
};

export type PlanningTask = {
  id: string;
  name: string;
  status: string;
  startDate: string | null;
  dueDate: string | null;
  duration: number | null;
  contextLabel: string;
  assignees: PlanningPerson[];
};

export type PlanningWeek = {
  key: string;
  start: string;
  end: string;
  label: string;
};

export type PlanningUserWeek = {
  weekKey: string;
  capacity: number;
  workload: number;
  delta: number;
  tasks: {
    id: string;
    name: string;
    contextLabel: string;
    days: number;
  }[];
};

export type PlanningUserRow = PlanningPerson & {
  weeks: PlanningUserWeek[];
  totalCapacity: number;
  totalWorkload: number;
  delta: number;
};

export type CapacityWeek = PlanningWeek & {
  capacity: number;
  workload: number;
  daysOverUnder: number;
};

export type DepartmentHeatmapRow = {
  department: string;
  weeks: {
    weekKey: string;
    capacity: number;
    workload: number;
    delta: number;
  }[];
};

export type ResourcePlanningData = {
  weeks: PlanningWeek[];
  capacity: CapacityWeek[];
  users: PlanningUserRow[];
  departments: DepartmentHeatmapRow[];
  totals: {
    capacity: number;
    workload: number;
    delta: number;
    overbookedUsers: number;
    unassignedWorkload: number;
  };
};

type BuildResourcePlanningInput = {
  people: PlanningPerson[];
  tasks: PlanningTask[];
  start: string;
  end: string;
};

export async function getResourcePlanningData(projectId: string, start = "2026-05-01", end = "2026-06-30"): Promise<ResourcePlanningData> {
  if (shouldUseDemoData()) {
    return buildResourcePlanningData({
      people: getDemoPlanningPeople(projectId),
      tasks: getDemoTaskTableItems(projectId).map(taskTableItemToPlanningTask),
      start,
      end,
    });
  }

  const prisma = getPrisma();
  const [users, tasks] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ department: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        department: true,
        capacity: true,
      },
    }),
    prisma.task.findMany({
      where: {
        OR: [{ shot: { projectId } }, { asset: { projectId } }],
      },
      orderBy: [{ startDate: "asc" }, { dueDate: "asc" }],
      include: {
        shot: { select: { code: true } },
        asset: { select: { name: true } },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                department: true,
                capacity: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return buildResourcePlanningData({
    people: users.map((user) => ({
      id: user.id,
      name: user.name,
      department: user.department ?? "Unassigned",
      capacity: user.capacity,
    })),
    tasks: tasks.map((task) => ({
      id: task.id,
      name: task.name,
      status: task.status,
      startDate: task.startDate?.toISOString().slice(0, 10) ?? null,
      dueDate: task.dueDate?.toISOString().slice(0, 10) ?? null,
      duration: task.duration,
      contextLabel: task.shot?.code ?? task.asset?.name ?? "Task",
      assignees: task.assignments.map((assignment) => ({
        id: assignment.user.id,
        name: assignment.user.name,
        department: assignment.user.department ?? "Unassigned",
        capacity: assignment.user.capacity,
      })),
    })),
    start,
    end,
  });
}

export function buildResourcePlanningData({ people, tasks, start, end }: BuildResourcePlanningInput): ResourcePlanningData {
  const weeks = buildWeeks(start, end);
  const userRows = people.map((person) => {
    const weekRows = weeks.map((week) => {
      const assigned = tasks.flatMap((task) => workloadForTaskAndPerson(task, person.id, week));
      const workload = roundDays(assigned.reduce((sum, task) => sum + task.days, 0));
      const capacity = person.capacity;

      return {
        weekKey: week.key,
        capacity,
        workload,
        delta: roundDays(workload - capacity),
        tasks: assigned,
      };
    });
    const totalCapacity = roundDays(weekRows.reduce((sum, week) => sum + week.capacity, 0));
    const totalWorkload = roundDays(weekRows.reduce((sum, week) => sum + week.workload, 0));

    return {
      ...person,
      weeks: weekRows,
      totalCapacity,
      totalWorkload,
      delta: roundDays(totalWorkload - totalCapacity),
    };
  });
  const unassignedWorkload = roundDays(
    tasks
      .filter((task) => task.assignees.length === 0)
      .reduce((sum, task) => sum + taskWeeks(task, weeks).reduce((taskSum, item) => taskSum + item.days, 0), 0),
  );
  const capacity = weeks.map((week) => {
    const weekCapacity = roundDays(userRows.reduce((sum, user) => sum + (user.weeks.find((item) => item.weekKey === week.key)?.capacity ?? 0), 0));
    const weekWorkload = roundDays(userRows.reduce((sum, user) => sum + (user.weeks.find((item) => item.weekKey === week.key)?.workload ?? 0), 0));

    return {
      ...week,
      capacity: weekCapacity,
      workload: weekWorkload,
      daysOverUnder: roundDays(weekWorkload - weekCapacity),
    };
  });
  const departmentNames = Array.from(new Set(people.map((person) => person.department))).sort((a, b) => a.localeCompare(b));
  const departments = departmentNames.map((department) => {
    const members = userRows.filter((user) => user.department === department);

    return {
      department,
      weeks: weeks.map((week) => {
        const capacity = roundDays(members.reduce((sum, user) => sum + (user.weeks.find((item) => item.weekKey === week.key)?.capacity ?? 0), 0));
        const workload = roundDays(members.reduce((sum, user) => sum + (user.weeks.find((item) => item.weekKey === week.key)?.workload ?? 0), 0));

        return {
          weekKey: week.key,
          capacity,
          workload,
          delta: roundDays(workload - capacity),
        };
      }),
    };
  });
  const totalCapacity = roundDays(capacity.reduce((sum, week) => sum + week.capacity, 0));
  const totalWorkload = roundDays(capacity.reduce((sum, week) => sum + week.workload, 0));

  return {
    weeks,
    capacity,
    users: userRows,
    departments,
    totals: {
      capacity: totalCapacity,
      workload: totalWorkload,
      delta: roundDays(totalWorkload - totalCapacity),
      overbookedUsers: userRows.filter((user) => user.delta > 0).length,
      unassignedWorkload,
    },
  };

  function workloadForTaskAndPerson(task: PlanningTask, personId: string, week: PlanningWeek) {
    if (!task.assignees.some((assignee) => assignee.id === personId)) return [];
    const split = taskWeeks(task, [week])[0];
    if (!split || split.days <= 0) return [];

    return [
      {
        id: task.id,
        name: task.name,
        contextLabel: task.contextLabel,
        days: roundDays(split.days / Math.max(task.assignees.length, 1)),
      },
    ];
  }

  function taskWeeks(task: PlanningTask, targetWeeks: PlanningWeek[]) {
    const taskStart = task.startDate ? parseISO(task.startDate) : task.dueDate ? parseISO(task.dueDate) : null;
    const taskEnd = task.dueDate ? parseISO(task.dueDate) : task.startDate ? parseISO(task.startDate) : null;

    if (!taskStart || !taskEnd) return [];

    const intervalStart = min([taskStart, taskEnd]);
    const intervalEnd = max([taskStart, taskEnd]);
    const totalSpan = Math.max(1, differenceInCalendarDays(intervalEnd, intervalStart) + 1);
    const duration = task.duration ?? totalSpan;

    return targetWeeks.map((week) => {
      const weekStart = parseISO(week.start);
      const weekEnd = parseISO(week.end);

      if (!isWithinInterval(intervalStart, { start: weekStart, end: weekEnd }) && !isWithinInterval(intervalEnd, { start: weekStart, end: weekEnd }) && (intervalStart > weekEnd || intervalEnd < weekStart)) {
        return { weekKey: week.key, days: 0 };
      }

      const overlapStart = max([intervalStart, weekStart]);
      const overlapEnd = min([intervalEnd, weekEnd]);
      const overlapDays = Math.max(0, differenceInCalendarDays(overlapEnd, overlapStart) + 1);

      return {
        weekKey: week.key,
        days: roundDays((duration * overlapDays) / totalSpan),
      };
    });
  }

}

function taskTableItemToPlanningTask(task: TaskTableItem): PlanningTask {
  return {
    id: task.id,
    name: task.name,
    status: task.status,
    startDate: task.startDate ? task.startDate.slice(0, 10) : null,
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : null,
    duration: task.duration,
    contextLabel: task.context.label,
    assignees: task.assignees.map((assignee) => ({
      id: assignee.id,
      name: assignee.name,
      department: assignee.department ?? "Unassigned",
      capacity: 5,
    })),
  };
}

function getDemoPlanningPeople(projectId: string): PlanningPerson[] {
  const seen = new Map<string, PlanningPerson>();
  for (const task of getDemoTaskTableItems(projectId)) {
    for (const assignee of task.assignees) {
      seen.set(assignee.id, {
        id: assignee.id,
        name: assignee.name,
        department: assignee.department ?? "Unassigned",
        capacity: 5,
      });
    }
  }

  return Array.from(seen.values()).sort((a, b) => a.department.localeCompare(b.department) || a.name.localeCompare(b.name));
}

function buildWeeks(start: string, end: string): PlanningWeek[] {
  return eachWeekOfInterval(
    {
      start: parseISO(start),
      end: parseISO(end),
    },
    { weekStartsOn: 1 },
  ).map((weekStart) => {
    const startDate = weekStart < parseISO(start) ? parseISO(start) : weekStart;
    const endDate = endOfWeek(weekStart, { weekStartsOn: 1 }) > parseISO(end) ? parseISO(end) : endOfWeek(weekStart, { weekStartsOn: 1 });

    return {
      key: format(startDate, "yyyy-MM-dd"),
      start: format(startDate, "yyyy-MM-dd"),
      end: format(endDate, "yyyy-MM-dd"),
      label: `${format(startDate, "MMM d")} - ${format(addDays(endDate, 0), "MMM d")}`,
    };
  });
}

function roundDays(value: number) {
  return Math.round(value * 10) / 10;
}
