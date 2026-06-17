"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { PlanningUserRow, PlanningUserWeek, ResourcePlanningData } from "@/lib/resource-planning";

const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

type ChartMode = "step" | "line";
type DetailMode = "heatmap" | "area";
type InspectGroup = "department" | "user";
type SelectedCell = { userId: string; weekKey: string };
type InspectRow = { name: string; subtitle: string; capacity: number; workload: number; delta: number };

export function ResourcePlanningWorkspace({ data }: { data: ResourcePlanningData }) {
  const [chartMode, setChartMode] = useState<ChartMode>("step");
  const [detailMode, setDetailMode] = useState<DetailMode>("heatmap");
  const [inspectGroup, setInspectGroup] = useState<InspectGroup>("department");
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);

  const defaultCell = useMemo(() => findDefaultCell(data), [data]);
  const activeCell = selectedCell ?? defaultCell;
  const selectedUser = data.users.find((user) => user.id === activeCell?.userId) ?? data.users[0];
  const selectedWeek = selectedUser?.weeks.find((week) => week.weekKey === activeCell?.weekKey) ?? selectedUser?.weeks[0];
  const selectedWeekMeta = data.weeks.find((week) => week.key === selectedWeek?.weekKey) ?? data.weeks[0];
  const inspectRows = useMemo(() => buildInspectRows(data, inspectGroup), [data, inspectGroup]);
  const lineType = chartMode === "step" ? "stepAfter" : "monotone";

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="border border-[#34322b] bg-[#181713]">
          <PanelHeader
            eyebrow="capacity chart"
            title="Studio 容量与工作量"
            meta="Weekly · Person Days"
            actions={
              <SegmentedControl
                label="Chart mode"
                value={chartMode}
                options={[
                  { value: "step", label: "Step" },
                  { value: "line", label: "Line" },
                ]}
                onChange={setChartMode}
              />
            }
          />
          <div className="h-[320px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.capacity} margin={{ top: 10, right: 18, left: -14, bottom: 0 }}>
                <CartesianGrid stroke="#2a2a28" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#5a564e" }} />
                <Line type={lineType} dataKey="capacity" name="Capacity" stroke="#4a9eff" strokeWidth={2} dot={false} />
                <Line type={lineType} dataKey="workload" name="Workload" stroke="#d8b46a" strokeWidth={2} dot={{ r: 3 }} />
                <Line type={lineType} dataKey="daysOverUnder" name="Over / Under" stroke="#ff8b7c" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-[#34322b] bg-[#181713]">
          <PanelHeader eyebrow="summary" title="资源窗口" meta={`${data.weeks.length} weeks`} />
          <div className="grid grid-cols-2 border-b border-[#2a2a28]">
            <Metric label="Capacity" value={days(data.totals.capacity)} />
            <Metric label="Workload" value={days(data.totals.workload)} />
            <Metric label="Over / Under" value={signedDays(data.totals.delta)} tone={data.totals.delta > 0 ? "over" : "ok"} />
            <Metric label="Overbooked" value={`${data.totals.overbookedUsers} users`} tone={data.totals.overbookedUsers ? "watch" : "ok"} />
          </div>
          <div className="grid grid-cols-[1fr_1fr] border-b border-[#2a2a28]">
            <div className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">unassigned</p>
              <p className="mt-2 font-mono text-2xl font-semibold text-[#e8c678]">{days(data.totals.unassignedWorkload)}</p>
            </div>
            <div className="border-l border-[#2a2a28] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">calendar loss</p>
              <p className="mt-2 font-mono text-2xl font-semibold text-[#7bb8ff]">{days(calendarLoss(data))}</p>
            </div>
          </div>
          <div className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">next exception</p>
            <CalendarExceptionList data={data} compact />
          </div>
        </div>
      </section>

      <section className="grid gap-0 border border-[#34322b] bg-[#181713] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <PanelHeader eyebrow="person-day grid" title="人员周人天网格" meta="Click a cell to inspect assignments" />
          <div className="overflow-auto">
            <div className="min-w-[1180px]">
              <div
                className="grid border-b border-[#2a2a28] bg-[#1e1e1c] text-[11px] font-medium uppercase tracking-[0.12em] text-[#6e6e69]"
                style={{ gridTemplateColumns: `232px repeat(${data.weeks.length}, minmax(116px, 1fr)) 124px` }}
              >
                <div className="px-4 py-2">User</div>
                {data.weeks.map((week) => (
                  <div key={week.key} className={["border-l border-[#2a2a28] px-3 py-2 text-right", week.unavailableDays > 0 ? "text-[#8cc6ff]" : ""].join(" ")}>
                    <p>{week.label}</p>
                    {week.unavailableDays > 0 ? <p className="mt-1 font-mono text-[10px] normal-case tracking-normal">-{days(week.unavailableDays)}</p> : null}
                  </div>
                ))}
                <div className="border-l border-[#2a2a28] px-3 py-2 text-right">Total</div>
              </div>

              {data.users.map((user) => (
                <div
                  key={user.id}
                  className="grid min-h-16 border-b border-[#2a2a28] text-xs"
                  style={{ gridTemplateColumns: `232px repeat(${data.weeks.length}, minmax(116px, 1fr)) 124px` }}
                >
                  <div className="flex min-w-0 items-center gap-3 px-4">
                    <div className="grid size-9 shrink-0 place-items-center border border-[#34322b] bg-[#11110f] font-semibold text-[#e8c678]">{initials(user.name)}</div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#f4f1e8]">{user.name}</p>
                      <p className="truncate text-[11px] text-[#8f8a7e]">{user.department}</p>
                    </div>
                  </div>
                  {user.weeks.map((week) => {
                    const isSelected = activeCell?.userId === user.id && activeCell.weekKey === week.weekKey;

                    return (
                      <button
                        key={week.weekKey}
                        type="button"
                        onClick={() => setSelectedCell({ userId: user.id, weekKey: week.weekKey })}
                        className={[
                          "min-h-16 border-l border-[#2a2a28] px-3 py-2 text-right font-mono transition hover:brightness-125 focus:outline-none focus:ring-2 focus:ring-[#d8b46a]",
                          cellTone(week.delta),
                          isSelected ? "relative z-10 ring-2 ring-[#d8b46a]" : "",
                        ].join(" ")}
                        style={week.unavailableDays > 0 ? exceptionCellStyle : undefined}
                        title={`${week.workload} of ${week.capacity} Days Assigned`}
                      >
                        <p className="text-sm">{numberFormatter.format(week.workload)} / {numberFormatter.format(week.capacity)}</p>
                        <p className="mt-1 text-[10px] opacity-75">{signedDays(week.delta)}</p>
                        <p className="mt-1 text-[10px] opacity-60">{week.tasks.length ? `${week.tasks.length} tasks` : "clear"}</p>
                      </button>
                    );
                  })}
                  <div className={["border-l border-[#2a2a28] px-3 py-2 text-right font-mono", cellTone(user.delta)].join(" ")}>
                    <p>{days(user.totalWorkload)}</p>
                    <p className="mt-1 text-[10px] opacity-70">{signedDays(user.delta)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <CellInspector user={selectedUser} week={selectedWeek} weekLabel={selectedWeekMeta?.label ?? "Week"} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
        <div className="border border-[#34322b] bg-[#181713]">
          <PanelHeader
            eyebrow="workload detail"
            title={detailMode === "heatmap" ? "部门热力图" : "过载面积图"}
            meta={detailMode === "heatmap" ? "Blue under · red over" : "Area · over/under"}
            actions={
              <SegmentedControl
                label="Detail mode"
                value={detailMode}
                options={[
                  { value: "heatmap", label: "Heatmap" },
                  { value: "area", label: "Area" },
                ]}
                onChange={setDetailMode}
              />
            }
          />
          {detailMode === "heatmap" ? <DepartmentHeatmap data={data} /> : <OverUnderArea data={data} />}
        </div>

        <div className="border border-[#34322b] bg-[#181713]">
          <PanelHeader
            eyebrow="inspect chart data"
            title={inspectGroup === "department" ? "部门容量明细" : "人员容量明细"}
            meta="capacity / workload / delta"
            actions={
              <SegmentedControl
                label="Inspect group"
                value={inspectGroup}
                options={[
                  { value: "department", label: "Dept" },
                  { value: "user", label: "User" },
                ]}
                onChange={setInspectGroup}
              />
            }
          />
          <div className="p-4">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inspectRows} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#2a2a28" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#8f8a7e", fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis tick={{ fill: "#8f8a7e", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#24221d" }} />
                  <Bar dataKey="capacity" name="Capacity" fill="#4a9eff" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="workload" name="Workload" fill="#d8b46a" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {inspectRows.map((row) => (
                <InspectDataRow key={`${inspectGroup}-${row.name}`} row={row} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CellInspector({ user, week, weekLabel }: { user?: PlanningUserRow; week?: PlanningUserWeek; weekLabel: string }) {
  if (!user || !week) {
    return (
      <aside className="border-t border-[#34322b] p-4 xl:border-l xl:border-t-0">
        <p className="text-sm text-[#aaa599]">选择一个人员周格子查看任务。</p>
      </aside>
    );
  }

  return (
    <aside className="border-t border-[#34322b] bg-[#151410] p-4 xl:border-l xl:border-t-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d8b46a]">cell inspector</p>
      <h3 className="mt-2 text-lg font-semibold text-[#f4f1e8]">{user.name}</h3>
      <p className="mt-1 text-xs text-[#8f8a7e]">{user.department} · {weekLabel}</p>

      <div className="mt-4 grid grid-cols-3 border border-[#2a2a28]">
        <MiniMetric label="Assigned" value={days(week.workload)} />
        <MiniMetric label="Capacity" value={days(week.capacity)} />
        <MiniMetric label="Delta" value={signedDays(week.delta)} tone={week.delta > 0 ? "over" : "ok"} />
      </div>

      {week.exceptions.length > 0 ? (
        <div className="mt-4 border border-[#2a2a28] bg-[#101b28] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8cc6ff]">calendar exception</p>
          <div className="mt-2 space-y-2">
            {week.exceptions.map((exception) => (
              <div key={`${exception.date}-${exception.type}`} className="text-xs leading-5 text-[#c9d9e8]">
                <span className="font-mono text-[#8cc6ff]">{exception.date}</span>
                <span className="mx-2 text-[#55718c]">/</span>
                <span>{exception.description ?? exception.type}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">tasks</p>
          <p className="font-mono text-xs text-[#8f8a7e]">{week.tasks.length} items</p>
        </div>
        <div className="mt-2 space-y-2">
          {week.tasks.length > 0 ? (
            week.tasks.map((task) => (
              <div key={task.id} className="border border-[#2a2a28] bg-[#181713] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#f4f1e8]">{task.contextLabel} · {task.name}</p>
                    <p className="mt-1 text-xs text-[#8f8a7e]">{statusLabel(task.status)}</p>
                  </div>
                  <span className="shrink-0 border border-[#3c3830] px-2 py-1 font-mono text-xs text-[#e8c678]">{days(task.days)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="border border-dashed border-[#34322b] px-3 py-8 text-center text-xs text-[#7f7a70]">这一周没有已分配任务。</div>
          )}
        </div>
      </div>
    </aside>
  );
}

function DepartmentHeatmap({ data }: { data: ResourcePlanningData }) {
  return (
    <div className="overflow-auto p-4">
      <div className="min-w-[820px] space-y-2">
        {data.departments.map((department) => (
          <div key={department.department} className="grid items-center gap-2 text-xs" style={{ gridTemplateColumns: `160px repeat(${data.weeks.length}, minmax(64px, 1fr))` }}>
            <div className="truncate text-[#c9c3b5]">{department.department}</div>
            {department.weeks.map((week) => (
              <div
                key={week.weekKey}
                className={["px-2 py-2 text-right font-mono", heatTone(week.delta)].join(" ")}
                style={week.unavailableDays > 0 ? exceptionCellStyle : undefined}
                title={week.unavailableDays > 0 ? `Calendar exception: -${days(week.unavailableDays)}` : undefined}
              >
                {signedDays(week.delta)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function OverUnderArea({ data }: { data: ResourcePlanningData }) {
  return (
    <div className="h-[286px] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.capacity} margin={{ top: 10, right: 18, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#2a2a28" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#5a564e" }} />
          <Area type="monotone" dataKey="workload" name="Workload" stroke="#d8b46a" fill="#d8b46a" fillOpacity={0.22} />
          <Area type="monotone" dataKey="capacity" name="Capacity" stroke="#4a9eff" fill="#4a9eff" fillOpacity={0.16} />
          <Area type="monotone" dataKey="daysOverUnder" name="Days over/under" stroke="#ff8b7c" fill="#ff8b7c" fillOpacity={0.14} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function InspectDataRow({ row }: { row: InspectRow }) {
  const maxValue = Math.max(row.capacity, row.workload, 1);
  const capacityWidth = `${Math.max(4, (row.capacity / maxValue) * 100)}%`;
  const workloadWidth = `${Math.max(4, (row.workload / maxValue) * 100)}%`;

  return (
    <div className="border border-[#2a2a28] px-3 py-2 text-xs">
      <div className="grid grid-cols-[1fr_72px] gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-[#c9c3b5]">{row.name}</p>
          <p className="truncate text-[11px] text-[#7f7a70]">{row.subtitle}</p>
        </div>
        <span className={["text-right font-mono", row.delta > 0 ? "text-[#ff8b7c]" : "text-[#75d9a7]"].join(" ")}>{signedDays(row.delta)}</span>
      </div>
      <div className="mt-2 space-y-1">
        <div className="h-1.5 bg-[#24231f]">
          <div className="h-full bg-[#4a9eff]" style={{ width: capacityWidth }} />
        </div>
        <div className="h-1.5 bg-[#24231f]">
          <div className="h-full bg-[#d8b46a]" style={{ width: workloadWidth }} />
        </div>
      </div>
    </div>
  );
}

function CalendarExceptionList({ data, compact = false }: { data: ResourcePlanningData; compact?: boolean }) {
  const exceptions = data.calendarExceptions.slice(0, compact ? 2 : undefined);

  if (exceptions.length === 0) {
    return <p className="mt-2 text-xs leading-6 text-[#aaa599]">当前窗口没有停工或半日例外。</p>;
  }

  return (
    <div className="mt-2 space-y-2">
      {exceptions.map((exception) => (
        <div key={`${exception.date}-${exception.type}`} className="grid grid-cols-[88px_1fr] gap-3 text-xs leading-5">
          <span className="font-mono text-[#8cc6ff]">{exception.date}</span>
          <span className="truncate text-[#aaa599]">{exception.description ?? exception.type}</span>
        </div>
      ))}
    </div>
  );
}

function PanelHeader({ eyebrow, title, meta, actions }: { eyebrow: string; title: string; meta?: string; actions?: ReactNode }) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-4 border-b border-[#34322b] px-4 py-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d8b46a]">{eyebrow}</p>
        <h2 className="mt-1 truncate text-lg font-semibold">{title}</h2>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {meta ? <p className="hidden text-xs text-[#8f8a7e] 2xl:block">{meta}</p> : null}
        {actions}
      </div>
    </div>
  );
}

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex border border-[#34322b] bg-[#11110f]" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={[
            "h-8 px-3 text-xs font-semibold transition",
            value === option.value ? "bg-[#d8b46a] text-[#171713]" : "text-[#aaa599] hover:bg-[#22201c] hover:text-[#f4f1e8]",
          ].join(" ")}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Metric({ label, value, tone = "normal" }: { label: string; value: string; tone?: "normal" | "ok" | "watch" | "over" }) {
  return (
    <div className="border-r border-b border-[#2a2a28] px-4 py-3 last:border-r-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7f7a70]">{label}</p>
      <p className={["mt-2 font-mono text-xl font-semibold", metricTone(tone)].join(" ")}>{value}</p>
    </div>
  );
}

function MiniMetric({ label, value, tone = "normal" }: { label: string; value: string; tone?: "normal" | "ok" | "over" }) {
  return (
    <div className="border-r border-[#2a2a28] px-2 py-3 last:border-r-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7f7a70]">{label}</p>
      <p className={["mt-2 font-mono text-sm font-semibold", metricTone(tone)].join(" ")}>{value}</p>
    </div>
  );
}

function metricTone(tone: "normal" | "ok" | "watch" | "over") {
  if (tone === "over") return "text-[#ff8b7c]";
  if (tone === "watch") return "text-[#e8c678]";
  if (tone === "ok") return "text-[#75d9a7]";
  return "text-[#f4f1e8]";
}

function buildInspectRows(data: ResourcePlanningData, group: InspectGroup): InspectRow[] {
  if (group === "user") {
    return data.users.map((user) => ({
      name: user.name,
      subtitle: user.department,
      capacity: user.totalCapacity,
      workload: user.totalWorkload,
      delta: user.delta,
    }));
  }

  return data.departments.map((department) => {
    const capacity = roundDays(department.weeks.reduce((sum, week) => sum + week.capacity, 0));
    const workload = roundDays(department.weeks.reduce((sum, week) => sum + week.workload, 0));

    return {
      name: department.department,
      subtitle: `${department.weeks.length} weeks`,
      capacity,
      workload,
      delta: roundDays(workload - capacity),
    };
  });
}

function findDefaultCell(data: ResourcePlanningData): SelectedCell | null {
  const overbooked = data.users.flatMap((user) => user.weeks.map((week) => ({ userId: user.id, weekKey: week.weekKey, score: week.delta }))).sort((a, b) => b.score - a.score)[0];

  if (overbooked) return { userId: overbooked.userId, weekKey: overbooked.weekKey };

  const firstUser = data.users[0];
  const firstWeek = firstUser?.weeks[0];
  return firstUser && firstWeek ? { userId: firstUser.id, weekKey: firstWeek.weekKey } : null;
}

function cellTone(delta: number) {
  if (delta > 1) return "bg-[#301b1b] text-[#ff8b7c]";
  if (delta < -2) return "bg-[#142233] text-[#7bb8ff]";
  return "bg-[#11110f] text-[#c9c3b5]";
}

function heatTone(delta: number) {
  if (delta > 4) return "bg-[#4a1f1f] text-[#ffb0a4]";
  if (delta > 0) return "bg-[#2d1a1a] text-[#ff8b7c]";
  if (delta < -6) return "bg-[#102944] text-[#8cc6ff]";
  if (delta < 0) return "bg-[#142233] text-[#7bb8ff]";
  return "bg-[#20201d] text-[#aaa599]";
}

function days(value: number) {
  return `${numberFormatter.format(value)}d`;
}

function signedDays(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${numberFormatter.format(rounded)}d`;
}

function calendarLoss(data: ResourcePlanningData) {
  return roundDays(data.weeks.reduce((sum, week) => sum + week.unavailableDays * data.users.length, 0));
}

function roundDays(value: number) {
  return Math.round(value * 10) / 10;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

const tooltipStyle = {
  background: "#181713",
  border: "1px solid #34322b",
  color: "#f4f1e8",
  fontSize: 12,
};

const exceptionCellStyle = {
  backgroundImage:
    "linear-gradient(135deg, rgba(255,255,255,0.055) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.055) 50%, rgba(255,255,255,0.055) 75%, transparent 75%, transparent)",
  backgroundSize: "12px 12px",
};
