"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { DashboardLayoutEditor } from "@/components/dashboard-builder/dashboard-layout-editor";
import { DashboardRefreshControls } from "@/components/dashboard-builder/dashboard-refresh-controls";
import { DashboardWidgetContent, normalizeDashboardRows, type DashboardWidgetData } from "@/components/dashboard-builder/dashboard-widget-renderer";
import { WidgetAddPanel } from "@/components/dashboard-builder/widget-add-panel";
import { PageHeader, Metric } from "@/components/extensions/entity-type-pages";
import type { EntityTypeItem } from "@/lib/custom-data-store";
import type { DashboardItem, WidgetConfig } from "@/lib/dashboard-builder";

export function DashboardsIndex({ dashboards }: { dashboards: DashboardItem[] }) {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Dashboard builder"
        title="自定义可视化仪表盘"
        description="选择实体类型作为数据源，把指标卡、柱状图、环形图、表格和进度组件组合成给监制/制片厂看的专业看板。"
        action={<Link href="/app/dashboards/new" className="h-9 border border-[#d8b46a]/55 bg-[#d8b46a]/10 px-4 py-2 text-xs font-semibold text-[#e8c678] hover:border-[#e8c678]">新建仪表盘</Link>}
      />
      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Dashboards" value={dashboards.length} />
        <Metric label="Widgets" value={dashboards.reduce((sum, dashboard) => sum + dashboard.widgets.length, 0)} />
        <Metric label="Shared" value={dashboards.filter((dashboard) => dashboard.isShared).length} />
      </div>
      {dashboards.length ? (
        <section className="grid gap-3 xl:grid-cols-2">
          {dashboards.map((dashboard) => (
            <section key={dashboard.id} data-dashboard-card={dashboard.id} className="border border-[#34322b] bg-[#181713] p-4 transition hover:border-[#d8b46a]/70">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{dashboard.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#aaa599]">{dashboard.description}</p>
                </div>
                <span className="font-mono text-sm text-[#e8c678]">{dashboard.widgets.length}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="border border-[#34322b] px-2 py-1 text-[#8f8a7e]">{dashboard.isShared ? "Shared" : "Private"}</span>
                  <span className="text-[#6f6a60]">打开查看，进入后可继续编辑布局</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/app/dashboards/${dashboard.id}`} className="border border-[#3f3c33] px-3 py-1.5 text-[#c9c3b5] hover:border-[#d8b46a]">打开</Link>
                  <Link href={`/app/dashboards/${dashboard.id}/edit`} className="border border-[#3f3c33] px-3 py-1.5 text-[#c9c3b5] hover:border-[#d8b46a]">编辑</Link>
                  <DashboardDeleteButton dashboardId={dashboard.id} />
                </div>
              </div>
            </section>
          ))}
        </section>
      ) : (
        <section className="border border-dashed border-[#3f3c33] bg-[#181713] px-5 py-8">
          <p className="text-sm font-semibold text-[#f4f1e8]">还没有仪表盘</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8f8a7e]">从制片成本或供应商审计模板开始，会自动放入金额、占比、进度和明细表；也可以创建空白画布再手动添加 Widget。</p>
          <Link href="/app/dashboards/new" className="mt-4 inline-flex h-9 items-center border border-[#d8b46a]/55 bg-[#d8b46a]/10 px-4 text-xs font-semibold text-[#e8c678] hover:border-[#e8c678]">创建第一个仪表盘</Link>
        </section>
      )}
    </div>
  );
}

function DashboardDeleteButton({ dashboardId }: { dashboardId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "confirm" | "deleting" | "error">("idle");

  async function deleteDashboard() {
    if (status === "idle") {
      setStatus("confirm");
      return;
    }

    setStatus("deleting");
    const response = await fetch(`/api/dashboards/${dashboardId}`, { method: "DELETE" });
    if (!response.ok) {
      setStatus("error");
      return;
    }

    router.refresh();
  }

  return (
    <button type="button" onClick={deleteDashboard} disabled={status === "deleting"} className="border border-[#3f3c33] px-3 py-1.5 text-[#ff9c8c] hover:border-[#ff9c8c] disabled:opacity-50">
      {status === "confirm" ? "确认删除" : status === "deleting" ? "删除中" : status === "error" ? "重试删除" : "删除"}
    </button>
  );
}

export function DashboardView({ dashboard, widgetData }: { dashboard: DashboardItem; widgetData: Record<string, DashboardWidgetData> }) {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Dashboard view"
        title={dashboard.name}
        description={dashboard.description}
        action={
          <div className="flex items-center gap-2">
            <DashboardRefreshControls updatedAt={dashboard.updatedAt} />
            <a href={`/app/dashboards/${dashboard.id}/edit`} className="h-9 border border-[#3f3c33] px-4 py-2 text-xs text-[#c9c3b5] hover:border-[#d8b46a]">编辑构建器</a>
          </div>
        }
      />
      <div className="grid auto-rows-[72px] grid-cols-12 gap-3">
        {dashboard.widgets.map((widget) => (
          <WidgetCard key={widget.id} config={widget.config} data={widgetData[widget.id]} />
        ))}
      </div>
    </div>
  );
}

export function DashboardEditor({ dashboard, entities, widgetData }: { dashboard: DashboardItem; entities: EntityTypeItem[]; widgetData: Record<string, DashboardWidgetData> }) {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Edit dashboard" title={`${dashboard.name} 构建器`} description="左侧是 Widget 库，中间是可拖拽画布，右侧是布局与数据映射。保存后仪表盘页面会按同一套 12 列布局渲染。" />
      <WidgetAddPanel dashboardId={dashboard.id} entities={entities} />
      <DashboardLayoutEditor key={`${dashboard.updatedAt}-${dashboard.widgets.length}`} dashboard={dashboard} entities={entities} widgetData={widgetData} />
    </div>
  );
}

function WidgetCard({ config, data }: { config: WidgetConfig; data?: DashboardWidgetData }) {
  const rows = normalizeDashboardRows(data?.rows ?? []);
  const layout = clampLayout(config.layout);

  return (
    <section className="flex min-h-0 flex-col overflow-hidden border border-[#34322b] bg-[#181713]" style={{ gridColumn: `${layout.x + 1} / span ${layout.w}`, gridRow: `${layout.y + 1} / span ${layout.h}` }}>
      <div className="shrink-0 border-b border-[#2a2a28] px-4 py-3">
        <p className="text-sm font-semibold">{config.title}</p>
      </div>
      <DashboardWidgetContent type={config.type} rows={rows} total={data?.total ?? 0} title={config.title} />
    </section>
  );
}

function clampLayout(layout: WidgetConfig["layout"]) {
  const width = Math.min(12, Math.max(2, Math.round(layout.w || 6)));
  return {
    x: Math.min(12 - width, Math.max(0, Math.round(layout.x || 0))),
    y: Math.max(0, Math.round(layout.y || 0)),
    w: width,
    h: Math.min(12, Math.max(2, Math.round(layout.h || 4))),
  };
}
