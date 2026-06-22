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
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartViewport } from "@/components/charts/chart-viewport";
import { chartTheme } from "@/lib/chart-theme";
import type { WidgetConfig } from "@/lib/dashboard-builder";

export type DashboardWidgetData = { rows: unknown[]; total: number };
export type ChartRow = { name: string; value: number };

const palette = ["#d8b46a", "#4a9eff", "#1d9e75", "#ef9f27", "#7f77dd", "#e24b4a", "#4f7f9b"];

export function DashboardWidgetContent({ type, rows, total, title = "Dashboard widget", compact = false }: { type: WidgetConfig["type"]; rows: ChartRow[]; total: number; title?: string; compact?: boolean }) {
  if (!rows.length) {
    return <div className="flex min-h-0 flex-1 items-center justify-center text-xs text-[#6e6e69]">暂无可视化数据</div>;
  }

  if (type === "metric_card") {
    return (
      <div className="min-h-0 flex-1 p-5">
        <p className="font-mono text-4xl text-[#e8c678]">{formatNumber(rows[0]?.value ?? 0)}</p>
        <p className="mt-3 text-xs text-[#8f8a7e]">records {total.toLocaleString("zh-CN")}</p>
      </div>
    );
  }

  if (type === "pie_chart") {
    return (
      <ChartViewport title={title} compact={compact} minHeight={compact ? 180 : 240}>
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <PieChart>
            <Pie data={rows} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
              {rows.map((row, index) => <Cell key={row.name ?? index} fill={palette[index % palette.length]} />)}
            </Pie>
            <Tooltip contentStyle={chartTheme.tooltip} formatter={(value) => formatNumber(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      </ChartViewport>
    );
  }

  if (type === "line_chart" || type === "timeline") {
    return (
      <ChartViewport title={title} compact={compact} minHeight={compact ? 180 : 240}>
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <LineChart data={rows} margin={{ top: 18, right: 18, bottom: 0, left: -12 }}>
            <CartesianGrid stroke={chartTheme.gridSubtle} vertical={false} />
            <XAxis dataKey="name" tick={chartTheme.axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={chartTheme.axisTick} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartTheme.tooltip} formatter={(value) => formatNumber(Number(value))} />
            <Line type="monotone" dataKey="value" stroke="#d8b46a" strokeWidth={2} dot={{ r: 2, fill: "#d8b46a" }} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartViewport>
    );
  }

  if (type === "area_chart") {
    return (
      <ChartViewport title={title} compact={compact} minHeight={compact ? 180 : 240}>
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <AreaChart data={rows} margin={{ top: 18, right: 18, bottom: 0, left: -12 }}>
            <defs>
              <linearGradient id={`area-${slugify(title)}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#d8b46a" stopOpacity={0.42} />
                <stop offset="100%" stopColor="#d8b46a" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={chartTheme.gridSubtle} vertical={false} />
            <XAxis dataKey="name" tick={chartTheme.axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={chartTheme.axisTick} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartTheme.tooltip} formatter={(value) => formatNumber(Number(value))} />
            <Area type="monotone" dataKey="value" stroke="#d8b46a" strokeWidth={2} fill={`url(#area-${slugify(title)})`} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartViewport>
    );
  }

  if (type === "radar_chart") {
    return (
      <ChartViewport title={title} compact={compact} minHeight={compact ? 180 : 240}>
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <RadarChart data={rows.slice(0, 8)} outerRadius={compact ? 72 : 92}>
            <PolarGrid stroke={chartTheme.radarGrid} />
            <PolarAngleAxis dataKey="name" tick={{ fill: "#aaa599", fontSize: 10 }} />
            <Tooltip contentStyle={chartTheme.tooltip} formatter={(value) => formatNumber(Number(value))} />
            <Radar dataKey="value" stroke="#4a9eff" fill="#4a9eff" fillOpacity={0.24} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </ChartViewport>
    );
  }

  if (type === "progress_bar") return <ProgressRows rows={rows} />;
  if (type === "funnel") return <FunnelRows rows={rows} />;
  if (type === "gauge") return <Gauge rows={rows} />;
  if (type === "table") return <WidgetTable rows={rows} total={total} />;

  return (
    <ChartViewport title={title} compact={compact} minHeight={compact ? 180 : 240}>
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <BarChart data={rows} margin={{ top: 18, right: 14, bottom: 0, left: -12 }}>
          <XAxis dataKey="name" tick={chartTheme.axisTick} axisLine={false} tickLine={false} />
          <YAxis tick={chartTheme.axisTick} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={chartTheme.tooltip} formatter={(value) => formatNumber(Number(value))} />
          <Bar dataKey="value" fill="#d8b46a" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartViewport>
  );
}

export function normalizeDashboardRows(rows: unknown[]): ChartRow[] {
  return rows
    .map((row, index) => {
      if (!isRecord(row)) return { name: `Row ${index + 1}`, value: Number(row) || 0 };
      if ("name" in row || "value" in row) {
        return { name: String(row.name ?? `Row ${index + 1}`), value: toFiniteNumber(row.value) };
      }

      const data = isRecord(row.data) ? row.data : row;
      const nameEntry = Object.entries(data).find(([, value]) => typeof value === "string" && value.trim());
      const valueEntry = Object.entries(data).find(([, value]) => Number.isFinite(Number(value)));
      return {
        name: String(nameEntry?.[1] ?? `Row ${index + 1}`),
        value: toFiniteNumber(valueEntry?.[1]),
      };
    })
    .filter((row) => Number.isFinite(row.value));
}

function ProgressRows({ rows }: { rows: ChartRow[] }) {
  const maxValue = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
      {rows.slice(0, 6).map((row, index) => {
        const percent = maxValue <= 100 ? clampNumber(row.value, 0, 100) : Math.round((row.value / maxValue) * 100);
        return (
          <div key={`${row.name}-${index}`}>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="truncate text-[#c9c3b5]">{row.name}</span>
              <span className="font-mono text-[#e8c678]">{formatNumber(row.value)}</span>
            </div>
            <div className="mt-2 h-2 bg-[#24231f]">
              <div className="h-full bg-[#d8b46a]" style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FunnelRows({ rows }: { rows: ChartRow[] }) {
  const sorted = [...rows].sort((a, b) => b.value - a.value).slice(0, 6);
  const maxValue = Math.max(...sorted.map((row) => row.value), 1);
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center gap-2 overflow-hidden p-4">
      {sorted.map((row, index) => {
        const width = 42 + Math.round((row.value / maxValue) * 58);
        return (
          <div key={`${row.name}-${index}`} className="mx-auto flex h-8 items-center justify-center px-3 text-[11px] font-semibold text-[#11110f]" style={{ width: `${width}%`, backgroundColor: palette[index % palette.length], clipPath: "polygon(8% 0, 92% 0, 100% 100%, 0 100%)" }}>
            <span className="truncate">{row.name} · {formatNumber(row.value)}</span>
          </div>
        );
      })}
    </div>
  );
}

function Gauge({ rows }: { rows: ChartRow[] }) {
  const primary = rows[0]?.value ?? 0;
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const percent = rows.length > 1 ? Math.round((primary / Math.max(total, 1)) * 100) : primary <= 100 ? Math.round(primary) : 100;
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-4">
      <div className="relative h-40 w-40 rounded-full" style={{ background: `conic-gradient(#d8b46a ${clampNumber(percent, 0, 100)}%, #25231e 0)` }}>
        <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-[#181713]">
          <span className="font-mono text-3xl text-[#e8c678]">{clampNumber(percent, 0, 100)}%</span>
          <span className="mt-1 max-w-[110px] truncate text-xs text-[#8f8a7e]">{rows[0]?.name ?? "progress"}</span>
          <span className="mt-1 font-mono text-[11px] text-[#c9c3b5]">{formatNumber(primary)}</span>
        </div>
      </div>
    </div>
  );
}

function WidgetTable({ rows, total }: { rows: ChartRow[]; total: number }) {
  return (
    <div className="min-h-0 flex-1 overflow-auto p-3">
      <table className="w-full border-collapse text-left text-xs">
        <thead className="sticky top-0 bg-[#1e1e1c] text-[10px] uppercase tracking-[0.12em] text-[#6e6e69]">
          <tr>
            <th className="border-b border-[#2a2a28] px-2 py-2">名称</th>
            <th className="border-b border-[#2a2a28] px-2 py-2 text-right">数值</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 10).map((row, index) => (
            <tr key={`${row.name}-${index}`} className="border-b border-[#2a2a28] last:border-b-0">
              <td className="max-w-[180px] truncate px-2 py-2 text-[#c9c3b5]">{row.name}</td>
              <td className="px-2 py-2 text-right font-mono text-[#e8c678]">{formatNumber(row.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[11px] text-[#6e6e69]">total records {total.toLocaleString("zh-CN")}</p>
    </div>
  );
}

function formatNumber(value: number) {
  return Number(value).toLocaleString("zh-CN", { maximumFractionDigits: 0 });
}

function toFiniteNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "widget";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
