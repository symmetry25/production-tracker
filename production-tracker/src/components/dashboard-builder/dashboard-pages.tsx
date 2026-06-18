"use client";

import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { DashboardLayoutEditor } from "@/components/dashboard-builder/dashboard-layout-editor";
import { WidgetAddPanel } from "@/components/dashboard-builder/widget-add-panel";
import { PageHeader, Metric } from "@/components/extensions/entity-type-pages";
import type { EntityTypeItem } from "@/lib/custom-data-store";
import type { DashboardItem, WidgetConfig } from "@/lib/dashboard-builder";

const palette = ["#d8b46a", "#4a9eff", "#1d9e75", "#ef9f27", "#7f77dd", "#e24b4a", "#4f7f9b"];

export function DashboardsIndex({ dashboards }: { dashboards: DashboardItem[] }) {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Dashboard builder" title="自定义可视化仪表盘" description="选择实体类型作为数据源，把指标卡、柱状图、环形图、表格和进度组件组合成给监制/制片厂看的专业看板。" />
      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Dashboards" value={dashboards.length} />
        <Metric label="Widgets" value={dashboards.reduce((sum, dashboard) => sum + dashboard.widgets.length, 0)} />
        <Metric label="Shared" value={dashboards.filter((dashboard) => dashboard.isShared).length} />
      </div>
      <section className="grid gap-3 xl:grid-cols-2">
        {dashboards.map((dashboard) => (
          <a key={dashboard.id} href={`/app/dashboards/${dashboard.id}`} className="border border-[#34322b] bg-[#181713] p-4 transition hover:border-[#d8b46a]/70">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{dashboard.name}</h2>
                <p className="mt-2 text-sm leading-6 text-[#aaa599]">{dashboard.description}</p>
              </div>
              <span className="font-mono text-sm text-[#e8c678]">{dashboard.widgets.length}</span>
            </div>
          </a>
        ))}
      </section>
    </div>
  );
}

export function DashboardView({ dashboard, widgetData }: { dashboard: DashboardItem; widgetData: Record<string, { rows: unknown[]; total: number }> }) {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Dashboard view" title={dashboard.name} description={dashboard.description} action={<a href={`/app/dashboards/${dashboard.id}/edit`} className="h-9 border border-[#3f3c33] px-4 py-2 text-xs text-[#c9c3b5] hover:border-[#d8b46a]">编辑构建器</a>} />
      <div className="grid auto-rows-[72px] grid-cols-12 gap-3">
        {dashboard.widgets.map((widget) => (
          <WidgetCard key={widget.id} config={widget.config} data={widgetData[widget.id]} />
        ))}
      </div>
    </div>
  );
}

export function DashboardEditor({ dashboard, entities }: { dashboard: DashboardItem; entities: EntityTypeItem[] }) {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Edit dashboard" title={`${dashboard.name} 构建器`} description="左侧是 Widget 库，中间是可拖拽画布，右侧是布局与数据映射。保存后仪表盘页面会按同一套 12 列布局渲染。" />
      <WidgetAddPanel dashboardId={dashboard.id} entities={entities} />
      <DashboardLayoutEditor key={`${dashboard.updatedAt}-${dashboard.widgets.length}`} dashboard={dashboard} />
    </div>
  );
}

function WidgetCard({ config, data }: { config: WidgetConfig; data?: { rows: unknown[]; total: number } }) {
  const rows = normalizeRows(data?.rows ?? []);
  const layout = clampLayout(config.layout);

  return (
    <section className="flex min-h-0 flex-col overflow-hidden border border-[#34322b] bg-[#181713]" style={{ gridColumn: `${layout.x + 1} / span ${layout.w}`, gridRow: `${layout.y + 1} / span ${layout.h}` }}>
      <div className="shrink-0 border-b border-[#2a2a28] px-4 py-3">
        <p className="text-sm font-semibold">{config.title}</p>
      </div>
      <WidgetContent type={config.type} rows={rows} total={data?.total ?? 0} />
    </section>
  );
}

function WidgetContent({ type, rows, total }: { type: WidgetConfig["type"]; rows: ChartRow[]; total: number }) {
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
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <PieChart>
            <Pie data={rows} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
              {rows.map((row, index) => <Cell key={row.name ?? index} fill={palette[index % palette.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatNumber(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "line_chart" || type === "timeline") {
    return (
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <LineChart data={rows} margin={{ top: 18, right: 18, bottom: 0, left: -12 }}>
            <CartesianGrid stroke="#24231f" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatNumber(Number(value))} />
            <Line type="monotone" dataKey="value" stroke="#d8b46a" strokeWidth={2} dot={{ r: 2, fill: "#d8b46a" }} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "progress_bar") return <ProgressRows rows={rows} />;
  if (type === "funnel") return <FunnelRows rows={rows} />;
  if (type === "gauge") return <Gauge rows={rows} />;
  if (type === "table") return <WidgetTable rows={rows} total={total} />;

  return (
    <div className="min-h-0 flex-1">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <BarChart data={rows} margin={{ top: 18, right: 14, bottom: 0, left: -12 }}>
          <XAxis dataKey="name" tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatNumber(Number(value))} />
          <Bar dataKey="value" fill="#d8b46a" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
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

const tooltipStyle = {
  background: "#181713",
  border: "1px solid #34322b",
  color: "#f4f1e8",
  fontSize: 12,
};

function clampLayout(layout: WidgetConfig["layout"]) {
  const width = Math.min(12, Math.max(2, Math.round(layout.w || 6)));
  return {
    x: Math.min(12 - width, Math.max(0, Math.round(layout.x || 0))),
    y: Math.max(0, Math.round(layout.y || 0)),
    w: width,
    h: Math.min(12, Math.max(2, Math.round(layout.h || 4))),
  };
}

type ChartRow = { name: string; value: number };

function normalizeRows(rows: unknown[]): ChartRow[] {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
