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

import { ChartViewport } from "@/components/charts/chart-viewport";
import type { TaskStatus } from "@/generated/prisma/enums";
import { STATUS_COLORS } from "@/lib/status-colors";
import type { AssetStatusDatum, ChartDatum, PercentFinalDatum, TaskStatusTrendDatum, VelocityDatum, VersionStatusDatum } from "@/lib/dashboard-data";
import type { Dictionary } from "@/lib/i18n";

const taskStatuses = ["WAITING_TO_START", "READY_TO_START", "IN_PROGRESS", "PENDING_REVIEW", "APPROVED", "FINAL", "ON_HOLD", "OMIT"] as const;
type ChartLabels = Dictionary["pages"]["overview"]["charts"];

export function DonutChart({ data, labels }: { data: ChartDatum[]; labels: ChartLabels }) {
  const localizedData = data.map((item) => ({ ...item, name: localizeTaskStatusLabel(item.name, labels) }));

  return (
    <ChartShell empty={data.length === 0} minHeight={300} emptyLabel={labels.empty}>
      <ChartViewport title={labels.shotStatus.title} minHeight={240} labels={labels.chartTools}>
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <PieChart>
            <Pie data={localizedData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={2}>
              {localizedData.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </ChartViewport>
      <Legend rows={localizedData.map((item) => ({ label: item.name, value: item.value, color: item.color }))} />
    </ChartShell>
  );
}

export function StackedBarChart({ data, labels }: { data: AssetStatusDatum[]; labels: ChartLabels }) {
  const localizedData = data.map((item) => ({ ...item, type: labels.assetTypes[item.type as keyof ChartLabels["assetTypes"]] ?? item.type }));

  return (
    <ChartShell empty={data.length === 0} emptyLabel={labels.empty}>
      <ChartViewport title={labels.assetStatus.title} minHeight={260} labels={labels.chartTools}>
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <BarChart data={localizedData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="#2a2a28" vertical={false} />
            <XAxis dataKey="type" tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [value, labels.taskStatuses[name as TaskStatus] ?? name]} />
            {taskStatuses.map((status) => (
              <Bar key={status} dataKey={status} stackId="status" fill={STATUS_COLORS[status].dot} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartViewport>
    </ChartShell>
  );
}

export function StackedAreaChart({ data, labels }: { data: TaskStatusTrendDatum[]; labels: ChartLabels }) {
  return (
    <ChartShell empty={data.length === 0} emptyLabel={labels.empty}>
      <ChartViewport title={labels.taskStatus.title} minHeight={260} labels={labels.chartTools}>
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <AreaChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="#2a2a28" vertical={false} />
            <XAxis dataKey="department" tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [value, labels.taskStatuses[name as TaskStatus] ?? name]} />
            {taskStatuses.map((status) => (
              <Area key={status} dataKey={status} stackId="status" stroke={STATUS_COLORS[status].dot} fill={STATUS_COLORS[status].dot} fillOpacity={0.7} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </ChartViewport>
    </ChartShell>
  );
}

export function VelocityChart({ data, labels }: { data: VelocityDatum[]; labels: ChartLabels }) {
  return (
    <ChartShell empty={data.length === 0} minHeight={240} emptyLabel={labels.empty}>
      <ChartViewport title={labels.velocity.title} minHeight={220} labels={labels.chartTools}>
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="#2a2a28" vertical={false} />
            <XAxis dataKey="week" tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [value, labels.taskStatuses[String(name).toUpperCase() as TaskStatus] ?? name]} />
            <Line type="monotone" dataKey="approved" name={labels.taskStatuses.APPROVED} stroke="#1d9e75" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="final" name={labels.taskStatuses.FINAL} stroke="#d8b46a" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartViewport>
    </ChartShell>
  );
}

export function VersionStatusBars({ data, labels }: { data: VersionStatusDatum[]; labels: ChartLabels }) {
  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <ChartShell empty={data.length === 0} minHeight={230} emptyLabel={labels.empty}>
      <ChartViewport title={labels.versionStatus.title} minHeight={190} labels={labels.chartTools}>
        <div className="space-y-3 p-4">
          {data.map((item) => (
            <div key={item.status}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-[#c9c3b5]">{labels.versionStatuses[item.status]}</span>
                <span className="font-mono text-[#8f8a7e]">{item.value}</span>
              </div>
              <div className="h-2 bg-[#2a2a28]">
                <div className="h-full bg-[#4a9eff]" style={{ width: `${(item.value / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </ChartViewport>
    </ChartShell>
  );
}

export function HorizontalBars({ data, labels }: { data: PercentFinalDatum[]; labels: ChartLabels }) {
  return (
    <ChartShell empty={data.length === 0} minHeight={260} emptyLabel={labels.empty}>
      <ChartViewport title={labels.pctFinalByDept.title} minHeight={220} labels={labels.chartTools}>
        <div className="space-y-3 p-4">
          {data.map((item) => (
            <div key={item.department}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-[#c9c3b5]">{item.department}</span>
                <span className="font-mono text-[#8f8a7e]">{item.pctFinal}% · {item.final}/{item.total}</span>
              </div>
              <div className="h-2 bg-[#2a2a28]">
                <div className="h-full bg-[#d8b46a]" style={{ width: `${item.pctFinal}%` }} />
              </div>
            </div>
          ))}
        </div>
      </ChartViewport>
    </ChartShell>
  );
}

function ChartShell({ empty, children, emptyLabel, minHeight = 260 }: { empty: boolean; children: React.ReactNode; emptyLabel: string; minHeight?: number }) {
  if (empty) {
    return <EmptyChart label={emptyLabel} />;
  }

  return <div className="p-4" style={{ minHeight }}>{children}</div>;
}

function EmptyChart({ label }: { label: string }) {
  return <div className="grid min-h-48 place-items-center p-4 text-sm text-[#8f8a7e]">{label}</div>;
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

function localizeTaskStatusLabel(label: string, labels: ChartLabels) {
  const entry = Object.entries(STATUS_COLORS).find(([, value]) => value.label === label);
  return entry ? labels.taskStatuses[entry[0] as TaskStatus] : label;
}
