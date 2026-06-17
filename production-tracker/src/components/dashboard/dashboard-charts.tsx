"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { STATUS_COLORS } from "@/lib/status-colors";
import type { AssetStatusDatum, ChartDatum, PercentFinalDatum, TaskStatusTrendDatum, VelocityDatum, VersionStatusDatum } from "@/lib/dashboard-data";

const taskStatuses = ["WAITING_TO_START", "READY_TO_START", "IN_PROGRESS", "PENDING_REVIEW", "APPROVED", "FINAL", "ON_HOLD", "OMIT"] as const;

export function DonutChart({ data }: { data: ChartDatum[] }) {
  return (
    <ChartShell empty={data.length === 0}>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={2}>
            {data.map((item) => (
              <Cell key={item.name} fill={item.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <Legend rows={data.map((item) => ({ label: item.name, value: item.value, color: item.color }))} />
    </ChartShell>
  );
}

export function StackedBarChart({ data }: { data: AssetStatusDatum[] }) {
  return (
    <ChartShell empty={data.length === 0}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="#2a2a28" vertical={false} />
          <XAxis dataKey="type" tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          {taskStatuses.map((status) => (
            <Bar key={status} dataKey={status} stackId="status" fill={STATUS_COLORS[status].dot} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function StackedAreaChart({ data }: { data: TaskStatusTrendDatum[] }) {
  return (
    <ChartShell empty={data.length === 0}>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="#2a2a28" vertical={false} />
          <XAxis dataKey="department" tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          {taskStatuses.map((status) => (
            <Area key={status} dataKey={status} stackId="status" stroke={STATUS_COLORS[status].dot} fill={STATUS_COLORS[status].dot} fillOpacity={0.7} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function VelocityChart({ data }: { data: VelocityDatum[] }) {
  return (
    <ChartShell empty={data.length === 0}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="#2a2a28" vertical={false} />
          <XAxis dataKey="week" tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="approved" stroke="#1d9e75" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="final" stroke="#d8b46a" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function VersionStatusBars({ data }: { data: VersionStatusDatum[] }) {
  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <div className="space-y-3 p-4">
      {data.map((item) => (
        <div key={item.status}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-[#c9c3b5]">{item.label}</span>
            <span className="font-mono text-[#8f8a7e]">{item.value}</span>
          </div>
          <div className="h-2 bg-[#2a2a28]">
            <div className="h-full bg-[#4a9eff]" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HorizontalBars({ data }: { data: PercentFinalDatum[] }) {
  return (
    <div className="space-y-3 p-4">
      {data.length ? (
        data.map((item) => (
          <div key={item.department}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-[#c9c3b5]">{item.department}</span>
              <span className="font-mono text-[#8f8a7e]">{item.pctFinal}% · {item.final}/{item.total}</span>
            </div>
            <div className="h-2 bg-[#2a2a28]">
              <div className="h-full bg-[#d8b46a]" style={{ width: `${item.pctFinal}%` }} />
            </div>
          </div>
        ))
      ) : (
        <EmptyChart />
      )}
    </div>
  );
}

function ChartShell({ empty, children }: { empty: boolean; children: React.ReactNode }) {
  if (empty) {
    return <EmptyChart />;
  }

  return <div className="p-4">{children}</div>;
}

function EmptyChart() {
  return <div className="grid min-h-48 place-items-center p-4 text-sm text-[#8f8a7e]">暂无可视化数据。</div>;
}

function Legend({ rows }: { rows: { label: string; value: number; color: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-2 border border-[#2a2a28] px-2 py-1">
          <span className="flex min-w-0 items-center gap-2">
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
            <span className="truncate text-[#c9c3b5]">{row.label}</span>
          </span>
          <span className="font-mono text-[#8f8a7e]">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

const tooltipStyle = {
  background: "#181713",
  border: "1px solid #34322b",
  color: "#f4f1e8",
  fontSize: 12,
};
