"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ResourcePlanningData } from "@/lib/resource-planning";

const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export function ResourcePlanningWorkspace({ data }: { data: ResourcePlanningData }) {
  return (
    <div className="space-y-5">
      <section className="grid grid-cols-[1fr_460px] gap-5">
        <div className="border border-[#34322b] bg-[#181713]">
          <PanelHeader eyebrow="capacity chart" title="Studio 容量与工作量" meta="Weekly · Person Days" />
          <div className="h-[320px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.capacity} margin={{ top: 10, right: 18, left: -14, bottom: 0 }}>
                <CartesianGrid stroke="#2a2a28" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="stepAfter" dataKey="capacity" name="Capacity" stroke="#4a9eff" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="workload" name="Workload" stroke="#d8b46a" strokeWidth={2} dot={{ r: 3 }} />
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
          <div className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">unassigned workload</p>
            <p className="mt-2 font-mono text-3xl font-semibold text-[#e8c678]">{days(data.totals.unassignedWorkload)}</p>
            <p className="mt-3 text-xs leading-6 text-[#aaa599]">没有分配给人的任务会在这里暴露，避免排期表看起来正常，但实际无人承接。</p>
          </div>
        </div>
      </section>

      <section className="border border-[#34322b] bg-[#181713]">
        <PanelHeader eyebrow="person-day grid" title="人员周人天网格" meta="Fixed user column · horizontal weeks" />
        <div className="overflow-auto">
          <div className="min-w-[1120px]">
            <div className="grid border-b border-[#2a2a28] bg-[#1e1e1c] text-[11px] font-medium uppercase tracking-[0.12em] text-[#6e6e69]" style={{ gridTemplateColumns: `220px repeat(${data.weeks.length}, minmax(106px, 1fr)) 120px` }}>
              <div className="px-4 py-2">User</div>
              {data.weeks.map((week) => (
                <div key={week.key} className="border-l border-[#2a2a28] px-3 py-2 text-right">{week.label}</div>
              ))}
              <div className="border-l border-[#2a2a28] px-3 py-2 text-right">Total</div>
            </div>

            {data.users.map((user) => (
              <div key={user.id} className="grid min-h-14 border-b border-[#2a2a28] text-xs" style={{ gridTemplateColumns: `220px repeat(${data.weeks.length}, minmax(106px, 1fr)) 120px` }}>
                <div className="flex min-w-0 items-center gap-3 px-4">
                  <div className="grid size-8 shrink-0 place-items-center border border-[#34322b] bg-[#11110f] font-semibold text-[#e8c678]">{initials(user.name)}</div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#f4f1e8]">{user.name}</p>
                    <p className="truncate text-[11px] text-[#8f8a7e]">{user.department}</p>
                  </div>
                </div>
                {user.weeks.map((week) => (
                  <div key={week.weekKey} className={["border-l border-[#2a2a28] px-3 py-2 text-right font-mono", cellTone(week.delta)].join(" ")} title={`${week.workload} of ${week.capacity} Days Assigned`}>
                    <p>{numberFormatter.format(week.workload)}</p>
                    <p className="mt-1 text-[10px] opacity-70">{signedDays(week.delta)}</p>
                  </div>
                ))}
                <div className={["border-l border-[#2a2a28] px-3 py-2 text-right font-mono", cellTone(user.delta)].join(" ")}>
                  <p>{days(user.totalWorkload)}</p>
                  <p className="mt-1 text-[10px] opacity-70">{signedDays(user.delta)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-[1.1fr_0.9fr] gap-5">
        <div className="border border-[#34322b] bg-[#181713]">
          <PanelHeader eyebrow="workload heatmap" title="部门热力图" meta="Blue under · red over" />
          <div className="overflow-auto p-4">
            <div className="min-w-[820px] space-y-2">
              {data.departments.map((department) => (
                <div key={department.department} className="grid items-center gap-2 text-xs" style={{ gridTemplateColumns: `160px repeat(${data.weeks.length}, minmax(64px, 1fr))` }}>
                  <div className="truncate text-[#c9c3b5]">{department.department}</div>
                  {department.weeks.map((week) => (
                    <div key={week.weekKey} className={["px-2 py-2 text-right font-mono", heatTone(week.delta)].join(" ")}>
                      {signedDays(week.delta)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-[#34322b] bg-[#181713]">
          <PanelHeader eyebrow="inspect chart data" title="部门容量明细" meta="Department view" />
          <div className="p-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.capacity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#2a2a28" vertical={false} />
                  <XAxis dataKey="start" tick={{ fill: "#8f8a7e", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#8f8a7e", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="daysOverUnder" name="Days over/under" stroke="#d8b46a" fill="#d8b46a" fillOpacity={0.24} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {data.departments.map((department) => {
                const capacity = department.weeks.reduce((sum, week) => sum + week.capacity, 0);
                const workload = department.weeks.reduce((sum, week) => sum + week.workload, 0);
                const delta = workload - capacity;

                return (
                  <div key={department.department} className="grid grid-cols-[1fr_80px_80px_80px] border border-[#2a2a28] px-3 py-2 text-xs">
                    <span className="truncate text-[#c9c3b5]">{department.department}</span>
                    <span className="text-right font-mono text-[#8f8a7e]">{days(capacity)}</span>
                    <span className="text-right font-mono text-[#e8c678]">{days(workload)}</span>
                    <span className={["text-right font-mono", delta > 0 ? "text-[#ff8b7c]" : "text-[#75d9a7]"].join(" ")}>{signedDays(delta)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PanelHeader({ eyebrow, title, meta }: { eyebrow: string; title: string; meta?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#34322b] px-4 py-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d8b46a]">{eyebrow}</p>
        <h2 className="mt-1 text-lg font-semibold">{title}</h2>
      </div>
      {meta ? <p className="text-xs text-[#8f8a7e]">{meta}</p> : null}
    </div>
  );
}

function Metric({ label, value, tone = "normal" }: { label: string; value: string; tone?: "normal" | "ok" | "watch" | "over" }) {
  return (
    <div className="border-r border-b border-[#2a2a28] px-4 py-3 last:border-r-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7f7a70]">{label}</p>
      <p className={["mt-2 font-mono text-xl font-semibold", tone === "over" ? "text-[#ff8b7c]" : tone === "watch" ? "text-[#e8c678]" : tone === "ok" ? "text-[#75d9a7]" : "text-[#f4f1e8]"].join(" ")}>{value}</p>
    </div>
  );
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

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const tooltipStyle = {
  background: "#181713",
  border: "1px solid #34322b",
  color: "#f4f1e8",
  fontSize: 12,
};
