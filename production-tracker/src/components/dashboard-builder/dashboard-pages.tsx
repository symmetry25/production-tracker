"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeader, Metric } from "@/components/extensions/entity-type-pages";
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
      <div className="grid auto-rows-[270px] gap-4 xl:grid-cols-12">
        {dashboard.widgets.map((widget) => (
          <WidgetCard key={widget.id} config={widget.config} data={widgetData[widget.id]} />
        ))}
      </div>
    </div>
  );
}

export function DashboardEditor({ dashboard }: { dashboard: DashboardItem }) {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Edit dashboard" title={`${dashboard.name} 构建器`} description="左侧是 Widget 库，中间是画布，右侧是数据映射。当前版本提供可视化配置预览；API 已支持添加、更新、删除 Widget 和批量布局保存。" />
      <div className="grid min-h-[620px] grid-cols-[240px_minmax(0,1fr)_320px] border border-[#34322b] bg-[#181713]">
        <aside className="border-r border-[#34322b] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d8b46a]">Widget Library</p>
          <div className="mt-4 space-y-2">
            {["指标卡", "柱状图", "环形图", "表格", "进度条", "漏斗图", "仪表盘"].map((item) => <div key={item} className="border border-[#2f2c25] bg-[#11110f] px-3 py-2 text-sm text-[#c9c3b5]">{item}</div>)}
          </div>
        </aside>
        <main className="p-4">
          <div className="grid auto-rows-[180px] grid-cols-12 gap-3">
            {dashboard.widgets.map((widget) => (
              <div key={widget.id} className="col-span-6 border border-[#34322b] bg-[#11110f] p-3">
                <p className="text-sm font-semibold">{widget.config.title}</p>
                <p className="mt-2 font-mono text-xs text-[#8f8a7e]">{widget.config.type} · {widget.config.dataSource.entityTypeId}</p>
                <p className="mt-4 text-xs leading-5 text-[#aaa599]">layout x:{widget.config.layout.x} y:{widget.config.layout.y} w:{widget.config.layout.w} h:{widget.config.layout.h}</p>
              </div>
            ))}
          </div>
        </main>
        <aside className="border-l border-[#34322b] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d8b46a]">Config Panel</p>
          <div className="mt-4 space-y-3 text-sm text-[#c9c3b5]">
            <p>选择 Widget 后可配置数据源、分组字段、聚合函数、过滤条件、颜色方案和自动刷新。</p>
            <p className="font-mono text-xs text-[#8f8a7e]">POST /api/dashboards/{dashboard.id}/widgets</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function WidgetCard({ config, data }: { config: WidgetConfig; data?: { rows: unknown[]; total: number } }) {
  const rows = (data?.rows ?? []) as { name?: string; value?: number }[];
  const className = config.type === "metric_card" ? "xl:col-span-4" : "xl:col-span-6";

  return (
    <section className={`${className} border border-[#34322b] bg-[#181713]`}>
      <div className="border-b border-[#2a2a28] px-4 py-3">
        <p className="text-sm font-semibold">{config.title}</p>
      </div>
      {config.type === "metric_card" ? (
        <div className="p-5">
          <p className="font-mono text-4xl text-[#e8c678]">{Number(rows[0]?.value ?? 0).toLocaleString("zh-CN")}</p>
          <p className="mt-3 text-xs text-[#8f8a7e]">records {data?.total ?? 0}</p>
        </div>
      ) : config.type === "pie_chart" ? (
        <ResponsiveContainer width="100%" height={210} minWidth={1} minHeight={1}>
          <PieChart>
            <Pie data={rows} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78}>
              {rows.map((row, index) => <Cell key={row.name ?? index} fill={palette[index % palette.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={210} minWidth={1} minHeight={1}>
          <BarChart data={rows} margin={{ top: 18, right: 14, bottom: 0, left: -12 }}>
            <XAxis dataKey="name" tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="#d8b46a" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}

const tooltipStyle = {
  background: "#181713",
  border: "1px solid #34322b",
  color: "#f4f1e8",
  fontSize: 12,
};
