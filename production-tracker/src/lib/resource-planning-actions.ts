import type { PlanningUserRow, PlanningUserWeek, ResourcePlanningData } from "@/lib/resource-planning";

export function reassignTaskInPlanningData(data: ResourcePlanningData, taskId: string, fromUserId: string, toUserId: string): ResourcePlanningData {
  if (fromUserId === toUserId) return data;

  const sourceUser = data.users.find((user) => user.id === fromUserId);
  const targetUser = data.users.find((user) => user.id === toUserId);

  if (!sourceUser || !targetUser) return data;

  const taskCopies = sourceUser.weeks.flatMap((week) =>
    week.tasks
      .filter((task) => task.id === taskId)
      .map((task) => ({
        weekKey: week.weekKey,
        task,
      })),
  );

  if (taskCopies.length === 0) return data;

  const users = data.users.map((user) => {
    if (user.id === fromUserId) {
      return recalculateUser({
        ...user,
        weeks: user.weeks.map((week) => recalculateWeek({ ...week, tasks: week.tasks.filter((task) => task.id !== taskId) })),
      });
    }

    if (user.id === toUserId) {
      return recalculateUser({
        ...user,
        weeks: user.weeks.map((week) => {
          const incoming = taskCopies.find((copy) => copy.weekKey === week.weekKey);
          if (!incoming || week.tasks.some((task) => task.id === taskId)) return week;

          return recalculateWeek({
            ...week,
            tasks: [...week.tasks, incoming.task],
          });
        }),
      });
    }

    return user;
  });

  return recalculateResourcePlanningData({ ...data, users });
}

function recalculateResourcePlanningData(data: ResourcePlanningData): ResourcePlanningData {
  const capacity = data.weeks.map((week) => {
    const weekCapacity = roundDays(data.users.reduce((sum, user) => sum + (user.weeks.find((item) => item.weekKey === week.key)?.capacity ?? 0), 0));
    const workload = roundDays(data.users.reduce((sum, user) => sum + (user.weeks.find((item) => item.weekKey === week.key)?.workload ?? 0), 0));

    return {
      ...week,
      capacity: weekCapacity,
      workload,
      daysOverUnder: roundDays(workload - weekCapacity),
    };
  });
  const departments = data.departments.map((department) => {
    const members = data.users.filter((user) => user.department === department.department);

    return {
      ...department,
      weeks: data.weeks.map((week) => {
        const weekCapacity = roundDays(members.reduce((sum, user) => sum + (user.weeks.find((item) => item.weekKey === week.key)?.capacity ?? 0), 0));
        const workload = roundDays(members.reduce((sum, user) => sum + (user.weeks.find((item) => item.weekKey === week.key)?.workload ?? 0), 0));

        return {
          weekKey: week.key,
          capacity: weekCapacity,
          workload,
          delta: roundDays(workload - weekCapacity),
          unavailableDays: week.unavailableDays,
        };
      }),
    };
  });
  const totalCapacity = roundDays(capacity.reduce((sum, week) => sum + week.capacity, 0));
  const totalWorkload = roundDays(capacity.reduce((sum, week) => sum + week.workload, 0));

  return {
    ...data,
    capacity,
    departments,
    totals: {
      ...data.totals,
      capacity: totalCapacity,
      workload: totalWorkload,
      delta: roundDays(totalWorkload - totalCapacity),
      overbookedUsers: data.users.filter((user) => user.delta > 0).length,
    },
  };
}

function recalculateUser(user: PlanningUserRow): PlanningUserRow {
  const totalCapacity = roundDays(user.weeks.reduce((sum, week) => sum + week.capacity, 0));
  const totalWorkload = roundDays(user.weeks.reduce((sum, week) => sum + week.workload, 0));

  return {
    ...user,
    totalCapacity,
    totalWorkload,
    delta: roundDays(totalWorkload - totalCapacity),
  };
}

function recalculateWeek(week: PlanningUserWeek): PlanningUserWeek {
  const workload = roundDays(week.tasks.reduce((sum, task) => sum + task.days, 0));

  return {
    ...week,
    workload,
    delta: roundDays(workload - week.capacity),
  };
}

function roundDays(value: number) {
  return Math.round(value * 10) / 10;
}
