"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { WidgetActions } from "@/components/dashboard-builder/widget-actions";
import type { DashboardItem, DashboardWidgetItem, WidgetConfig } from "@/lib/dashboard-builder";

const COLUMNS = 12;
const GRID_GAP = 8;
const ROW_HEIGHT = 58;
const MIN_WIDTH = 2;
const MIN_HEIGHT = 2;
const MAX_HEIGHT = 12;

type Layout = WidgetConfig["layout"];
type LayoutMap = Record<string, Layout>;
type Interaction = {
  widgetId: string;
  mode: "drag" | "resize";
  startX: number;
  startY: number;
  origin: Layout;
};

const widgetLabels: Record<WidgetConfig["type"], string> = {
  metric_card: "指标卡",
  bar_chart: "柱状图",
  line_chart: "折线图",
  pie_chart: "环形图",
  stacked_bar: "堆叠柱状图",
  heatmap: "热力图",
  scatter: "散点图",
  table: "数据表",
  progress_bar: "进度条",
  funnel: "漏斗图",
  gauge: "仪表盘",
  timeline: "时间线",
  map: "地图",
  text: "文本",
};

export function DashboardLayoutEditor({ dashboard }: { dashboard: DashboardItem }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const savedLayouts = useMemo(() => createLayoutMap(dashboard.widgets), [dashboard.widgets]);
  const [layouts, setLayouts] = useState<LayoutMap>(savedLayouts);
  const [selectedWidgetId, setSelectedWidgetId] = useState(dashboard.widgets[0]?.id ?? "");
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const cellWidth = Math.max(64, (canvasWidth - (COLUMNS - 1) * GRID_GAP) / COLUMNS);
  const maxRows = Math.max(10, ...dashboard.widgets.map((widget) => {
    const layout = layouts[widget.id] ?? widget.config.layout;
    return layout.y + layout.h;
  })) + 2;
  const canvasHeight = maxRows * ROW_HEIGHT + (maxRows - 1) * GRID_GAP;
  const selectedWidget = dashboard.widgets.find((widget) => widget.id === selectedWidgetId) ?? dashboard.widgets[0];
  const selectedLayout = selectedWidget ? layouts[selectedWidget.id] ?? selectedWidget.config.layout : null;
  const dirty = dashboard.widgets.some((widget) => !sameLayout(layouts[widget.id], savedLayouts[widget.id]));

  useEffect(() => {
    const node = canvasRef.current;
    if (!node) return;

    const updateWidth = () => setCanvasWidth(node.clientWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!interaction) return;
    const activeInteraction = interaction;

    function handlePointerMove(event: PointerEvent) {
      event.preventDefault();
      const deltaColumns = Math.round((event.clientX - activeInteraction.startX) / (cellWidth + GRID_GAP));
      const deltaRows = Math.round((event.clientY - activeInteraction.startY) / (ROW_HEIGHT + GRID_GAP));

      setLayouts((current) => {
        const nextLayout = activeInteraction.mode === "drag"
          ? clampLayout({
            ...activeInteraction.origin,
            x: activeInteraction.origin.x + deltaColumns,
            y: activeInteraction.origin.y + deltaRows,
          })
          : clampLayout({
            ...activeInteraction.origin,
            w: activeInteraction.origin.w + deltaColumns,
            h: activeInteraction.origin.h + deltaRows,
          });

        return { ...current, [activeInteraction.widgetId]: nextLayout };
      });
      setSaveState("idle");
    }

    function handlePointerUp() {
      setInteraction(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [cellWidth, interaction]);

  function beginInteraction(event: React.PointerEvent, widget: DashboardWidgetItem, mode: Interaction["mode"]) {
    event.preventDefault();
    event.stopPropagation();
    const layout = layouts[widget.id] ?? widget.config.layout;
    setSelectedWidgetId(widget.id);
    setInteraction({
      widgetId: widget.id,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      origin: clampLayout(layout),
    });
  }

  function updateSelectedLayout(patch: Partial<Layout>) {
    if (!selectedWidget) return;
    setLayouts((current) => ({
      ...current,
      [selectedWidget.id]: clampLayout({ ...(current[selectedWidget.id] ?? selectedWidget.config.layout), ...patch }),
    }));
    setSaveState("idle");
  }

  async function saveLayout() {
    setSaveState("saving");
    const response = await fetch(`/api/dashboards/${dashboard.id}/widgets/layout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        layouts: dashboard.widgets.map((widget) => ({
          widgetId: widget.id,
          layout: clampLayout(layouts[widget.id] ?? widget.config.layout),
        })),
      }),
    });

    if (!response.ok) {
      setSaveState("error");
      return;
    }

    setSaveState("saved");
    router.refresh();
  }

  function resetLayout() {
    setLayouts(savedLayouts);
    setSaveState("idle");
  }

  return (
    <section className="grid min-h-[680px] grid-cols-[250px_minmax(0,1fr)_330px] overflow-hidden border border-[#34322b] bg-[#181713]">
      <aside className="border-r border-[#34322b] bg-[#141310] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d8b46a]">Widget Library</p>
        <p className="mt-2 text-xs leading-5 text-[#8f8a7e]">拖动画布上的标题栏调整位置，拖右下角控制点改变尺寸。</p>
        <div className="mt-4 space-y-2">
          {Object.entries(widgetLabels).slice(0, 9).map(([type, label]) => (
            <div key={type} className="flex items-center justify-between border border-[#2f2c25] bg-[#11110f] px-3 py-2 text-xs text-[#c9c3b5]">
              <span>{label}</span>
              <span className="font-mono text-[10px] uppercase text-[#6e6e69]">{type.replace("_", " ")}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="min-w-0 bg-[#11110f]">
        <div className="flex items-center justify-between border-b border-[#2a2a28] bg-[#1b1a16] px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-[#f4f1e8]">Dashboard Canvas</p>
            <p className="mt-1 text-xs text-[#7f7a70]">12 列网格 · 当前 {dashboard.widgets.length} 个组件 · {dirty ? "有未保存修改" : "布局已同步"}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={resetLayout} disabled={!dirty || saveState === "saving"} className="h-8 border border-[#34322b] px-3 text-xs text-[#c9c3b5] hover:border-[#d8b46a] disabled:opacity-45">
              还原
            </button>
            <button type="button" onClick={saveLayout} disabled={!dirty || saveState === "saving"} className="h-8 border border-[#d8b46a]/60 bg-[#d8b46a]/10 px-3 text-xs font-semibold text-[#e8c678] hover:border-[#e8c678] disabled:opacity-45">
              {saveState === "saving" ? "保存中" : "保存布局"}
            </button>
          </div>
        </div>

        <div className="overflow-auto p-4">
          <div
            ref={canvasRef}
            className="relative min-w-[760px] border border-[#2a2a28] bg-[#151511]"
            style={{
              height: canvasHeight,
              backgroundImage: "linear-gradient(to right, rgba(216,180,106,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(216,180,106,0.06) 1px, transparent 1px)",
              backgroundSize: `${cellWidth + GRID_GAP}px ${ROW_HEIGHT + GRID_GAP}px`,
            }}
            onPointerDown={() => setSelectedWidgetId("")}
          >
            {dashboard.widgets.map((widget) => {
              const layout = clampLayout(layouts[widget.id] ?? widget.config.layout);
              const selected = widget.id === selectedWidgetId;
              const left = layout.x * (cellWidth + GRID_GAP);
              const top = layout.y * (ROW_HEIGHT + GRID_GAP);
              const width = layout.w * cellWidth + (layout.w - 1) * GRID_GAP;
              const height = layout.h * ROW_HEIGHT + (layout.h - 1) * GRID_GAP;

              return (
                <article
                  key={widget.id}
                  className={`absolute flex min-h-0 flex-col overflow-hidden border bg-[#181713] shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition-colors ${selected ? "border-[#d8b46a]" : "border-[#34322b] hover:border-[#5a5549]"}`}
                  style={{ transform: `translate(${left}px, ${top}px)`, width, height }}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    setSelectedWidgetId(widget.id);
                  }}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onPointerDown={(event) => beginInteraction(event, widget, "drag")}
                    className={`flex cursor-grab touch-none items-center justify-between gap-3 border-b px-3 py-2 active:cursor-grabbing ${selected ? "border-[#d8b46a]/45 bg-[#272217]" : "border-[#2a2a28] bg-[#1e1e1c]"}`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#f4f1e8]">{widget.config.title}</p>
                      <p className="mt-1 truncate font-mono text-[10px] uppercase text-[#7f7a70]">{widgetLabels[widget.config.type]} · {widget.config.dataSource.entityTypeId}</p>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] text-[#8f8a7e]">{layout.w}x{layout.h}</span>
                  </div>
                  <div className="min-h-0 flex-1 p-3">
                    <WidgetPreview widget={widget} />
                    <WidgetActions dashboardId={dashboard.id} widgetId={widget.id} />
                  </div>
                  <button
                    type="button"
                    aria-label="调整组件尺寸"
                    onPointerDown={(event) => beginInteraction(event, widget, "resize")}
                    className="absolute bottom-1 right-1 h-5 w-5 cursor-nwse-resize touch-none border border-[#5c574b] bg-[#11110f] text-[10px] text-[#d8b46a]"
                  >
                    ↘
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </main>

      <aside className="border-l border-[#34322b] bg-[#141310] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d8b46a]">Config Panel</p>
        {selectedWidget && selectedLayout ? (
          <div className="mt-4 space-y-4">
            <div>
              <p className="truncate text-sm font-semibold text-[#f4f1e8]">{selectedWidget.config.title}</p>
              <p className="mt-1 font-mono text-[11px] text-[#7f7a70]">{selectedWidget.id}</p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <LayoutNumber label="X" value={selectedLayout.x} onChange={(value) => updateSelectedLayout({ x: value })} />
              <LayoutNumber label="Y" value={selectedLayout.y} onChange={(value) => updateSelectedLayout({ y: value })} />
              <LayoutNumber label="W" value={selectedLayout.w} onChange={(value) => updateSelectedLayout({ w: value })} />
              <LayoutNumber label="H" value={selectedLayout.h} onChange={(value) => updateSelectedLayout({ h: value })} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => updateSelectedLayout({ x: selectedLayout.x - 1 })} className="h-8 border border-[#34322b] text-xs text-[#c9c3b5] hover:border-[#d8b46a]">左移</button>
              <button type="button" onClick={() => updateSelectedLayout({ x: selectedLayout.x + 1 })} className="h-8 border border-[#34322b] text-xs text-[#c9c3b5] hover:border-[#d8b46a]">右移</button>
              <button type="button" onClick={() => updateSelectedLayout({ y: selectedLayout.y - 1 })} className="h-8 border border-[#34322b] text-xs text-[#c9c3b5] hover:border-[#d8b46a]">上移</button>
              <button type="button" onClick={() => updateSelectedLayout({ y: selectedLayout.y + 1 })} className="h-8 border border-[#34322b] text-xs text-[#c9c3b5] hover:border-[#d8b46a]">下移</button>
            </div>

            <div className="border border-[#2f2c25] bg-[#11110f] p-3 text-xs leading-6 text-[#aaa599]">
              <p>数据源：<span className="font-mono text-[#e8c678]">{selectedWidget.config.dataSource.entityTypeId}</span></p>
              <p>分组：<span className="font-mono text-[#c9c3b5]">{selectedWidget.config.dataSource.groupBy ?? "--"}</span></p>
              <p>聚合：<span className="font-mono text-[#c9c3b5]">{selectedWidget.config.dataSource.aggregation?.fn ?? "--"} / {selectedWidget.config.dataSource.aggregation?.field ?? "--"}</span></p>
            </div>

            {saveState === "saved" ? <p className="text-xs text-[#83d6ae]">布局已保存。</p> : null}
            {saveState === "error" ? <p className="text-xs text-[#ff9c8c]">保存失败，请稍后重试。</p> : null}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-[#8f8a7e]">选择一个画布组件后，可以微调坐标、尺寸和查看字段映射。</p>
        )}
      </aside>
    </section>
  );
}

function WidgetPreview({ widget }: { widget: DashboardWidgetItem }) {
  if (widget.config.type === "metric_card") {
    return (
      <div className="h-full min-h-[80px] border border-[#2f2c25] bg-[#11110f] p-3">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#6e6e69]">Metric</p>
        <p className="mt-3 font-mono text-2xl text-[#e8c678]">128.4w</p>
      </div>
    );
  }

  if (widget.config.type === "pie_chart") {
    return (
      <div className="flex h-full min-h-[96px] items-center gap-3 border border-[#2f2c25] bg-[#11110f] p-3">
        <div className="h-16 w-16 shrink-0 rounded-full border-[14px] border-[#d8b46a] border-r-[#4a9eff] border-b-[#1d9e75]" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-2 w-4/5 bg-[#2f2c25]" />
          <div className="h-2 w-3/5 bg-[#2f2c25]" />
          <div className="h-2 w-2/5 bg-[#2f2c25]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[96px] items-end gap-2 border border-[#2f2c25] bg-[#11110f] p-3">
      {[46, 72, 38, 84, 58, 66].map((height, index) => (
        <div key={index} className="flex-1 bg-[#d8b46a]/80" style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}

function LayoutNumber({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7f7a70]">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-8 w-full border border-[#34322b] bg-[#11110f] px-2 font-mono text-xs text-[#f4f1e8] outline-none focus:border-[#d8b46a]"
      />
    </label>
  );
}

function createLayoutMap(widgets: DashboardWidgetItem[]): LayoutMap {
  return Object.fromEntries(widgets.map((widget) => [widget.id, clampLayout(widget.config.layout)]));
}

function clampLayout(layout: Layout): Layout {
  const width = clamp(toInteger(layout.w, 6), MIN_WIDTH, COLUMNS);
  const x = clamp(toInteger(layout.x, 0), 0, COLUMNS - width);
  return {
    x,
    y: Math.max(0, toInteger(layout.y, 0)),
    w: width,
    h: clamp(toInteger(layout.h, 4), MIN_HEIGHT, MAX_HEIGHT),
  };
}

function sameLayout(left?: Layout, right?: Layout) {
  if (!left || !right) return false;
  return left.x === right.x && left.y === right.y && left.w === right.w && left.h === right.h;
}

function toInteger(value: number, fallback: number) {
  return Number.isFinite(value) ? Math.round(value) : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
