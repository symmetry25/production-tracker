import { addDays, eachWeekOfInterval, endOfWeek, format, isWithinInterval, parseISO } from "date-fns";

import type { PlanningCalendarException, PlanningWeek, ResourcePlanningData } from "@/lib/resource-planning";

export function rebuildResourcePlanningWithCalendarExceptions(data: ResourcePlanningData, calendarExceptions: PlanningCalendarException[]): ResourcePlanningData {
  const weeks = buildWeeks(data.weeks[0]?.start ?? "2026-05-01", data.weeks.at(-1)?.end ?? "2026-06-30", calendarExceptions);
  const weeksByKey = new Map(weeks.map((week) => [week.key, week]));
  const users = data.users.map((user) => {
    const baselineCapacity = Math.max(...user.weeks.map((week) => week.capacity + week.unavailableDays), user.capacity);
    const userWeeks = user.weeks.map((week) => {
      const nextWeek = weeksByKey.get(week.weekKey);
      const unavailableDays = nextWeek?.unavailableDays ?? 0;
      const capacity = Math.max(0, roundDays(baselineCapacity - unavailableDays));

      return {
        ...week,
        capacity,
        delta: roundDays(week.workload - capacity),
        unavailableDays,
        exceptions: nextWeek?.exceptions ?? [],
      };
    });
    const totalCapacity = roundDays(userWeeks.reduce((sum, week) => sum + week.capacity, 0));
    const totalWorkload = roundDays(userWeeks.reduce((sum, week) => sum + week.workload, 0));

    return {
      ...user,
      weeks: userWeeks,
      totalCapacity,
      totalWorkload,
      delta: roundDays(totalWorkload - totalCapacity),
    };
  });
  const capacity = weeks.map((week) => {
    const weekCapacity = roundDays(users.reduce((sum, user) => sum + (user.weeks.find((item) => item.weekKey === week.key)?.capacity ?? 0), 0));
    const workload = roundDays(users.reduce((sum, user) => sum + (user.weeks.find((item) => item.weekKey === week.key)?.workload ?? 0), 0));

    return {
      ...week,
      capacity: weekCapacity,
      workload,
      daysOverUnder: roundDays(workload - weekCapacity),
    };
  });
  const departments = data.departments.map((department) => {
    const members = users.filter((user) => user.department === department.department);

    return {
      ...department,
      weeks: weeks.map((week) => {
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
    weeks,
    capacity,
    users,
    departments,
    calendarExceptions,
    totals: {
      ...data.totals,
      capacity: totalCapacity,
      workload: totalWorkload,
      delta: roundDays(totalWorkload - totalCapacity),
      overbookedUsers: users.filter((user) => user.delta > 0).length,
    },
  };
}

function buildWeeks(start: string, end: string, calendarExceptions: PlanningCalendarException[] = []): PlanningWeek[] {
  return eachWeekOfInterval(
    {
      start: parseISO(start),
      end: parseISO(end),
    },
    { weekStartsOn: 1 },
  ).map((weekStart) => {
    const startDate = weekStart < parseISO(start) ? parseISO(start) : weekStart;
    const endDate = endOfWeek(weekStart, { weekStartsOn: 1 }) > parseISO(end) ? parseISO(end) : endOfWeek(weekStart, { weekStartsOn: 1 });
    const exceptions = calendarExceptions.filter((exception) =>
      isWithinInterval(parseISO(exception.date), {
        start: startDate,
        end: endDate,
      }),
    );

    return {
      key: format(startDate, "yyyy-MM-dd"),
      start: format(startDate, "yyyy-MM-dd"),
      end: format(endDate, "yyyy-MM-dd"),
      label: `${format(startDate, "MMM d")} - ${format(addDays(endDate, 0), "MMM d")}`,
      unavailableDays: roundDays(exceptions.reduce((sum, exception) => sum + exceptionToUnavailableDays(exception), 0)),
      exceptions,
    };
  });
}

function exceptionToUnavailableDays(exception: PlanningCalendarException) {
  if (exception.type === "REDUCED_HOURS") {
    return Math.max(0, Math.min(1, (8 - exception.hoursWorked) / 8));
  }

  return 1;
}

function roundDays(value: number) {
  return Math.round(value * 10) / 10;
}
