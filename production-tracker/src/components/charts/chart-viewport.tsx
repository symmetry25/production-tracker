"use client";

import { useState, type ReactNode, type WheelEvent } from "react";

const minZoom = 0.72;
const maxZoom = 1.9;
const zoomStep = 0.14;

export function ChartViewport({
  title,
  children,
  minHeight = 260,
  compact = false,
}: {
  title: string;
  children: ReactNode;
  minHeight?: number;
  compact?: boolean;
}) {
  const [zoom, setZoom] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const toolbar = (
    <ChartViewportToolbar
      zoom={zoom}
      expanded={expanded}
      compact={compact}
      onZoomIn={() => setZoom((value) => clampZoom(value + zoomStep))}
      onZoomOut={() => setZoom((value) => clampZoom(value - zoomStep))}
      onReset={() => setZoom(1)}
      onToggleExpanded={() => setExpanded((value) => !value)}
    />
  );

  return (
    <div className={expanded ? "fixed inset-4 z-50 flex flex-col border border-[#3d392f] bg-[#181713] shadow-[0_28px_100px_rgba(0,0,0,0.72)]" : "relative min-h-0 flex-1"}>
      {expanded ? <div className="pointer-events-none fixed inset-0 -z-10 bg-black/70" /> : null}
      <div className={expanded ? "flex min-h-12 items-center justify-between border-b border-[#34322b] bg-[#1e1e1c] px-4" : "absolute right-2 top-2 z-10"}>
        {expanded ? (
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7f7a70]">expanded chart</p>
            <h2 className="truncate text-sm font-semibold text-[#f4f1e8]">{title}</h2>
          </div>
        ) : null}
        {toolbar}
      </div>
      <div
        className={["min-h-0 overflow-auto", expanded ? "flex-1 p-5" : ""].join(" ")}
        onWheel={(event) => handleWheel(event, setZoom)}
      >
        <div
          className="origin-top-left transition-transform duration-150"
          style={{
            minHeight: expanded ? "72vh" : minHeight,
            width: `${Math.round(zoom * 100)}%`,
            height: expanded ? "72vh" : minHeight,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function ChartViewportToolbar({
  zoom,
  expanded,
  compact,
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleExpanded,
}: {
  zoom: number;
  expanded: boolean;
  compact: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleExpanded: () => void;
}) {
  return (
    <div className="flex items-center border border-[#34322b] bg-[#11110f] text-[11px] shadow-[0_8px_22px_rgba(0,0,0,0.28)]">
      <ToolButton label="缩小图表" onClick={onZoomOut}>-</ToolButton>
      <button type="button" onClick={onReset} className={["border-l border-[#34322b] font-mono text-[#e8c678] hover:bg-[#1f1d18]", compact ? "min-w-12 px-2 py-1.5" : "min-w-16 px-3 py-2"].join(" ")} title="重置缩放">
        {Math.round(zoom * 100)}%
      </button>
      <ToolButton label="放大图表" onClick={onZoomIn}>+</ToolButton>
      <ToolButton label={expanded ? "退出全屏" : "全屏查看"} onClick={onToggleExpanded}>{expanded ? "Exit" : "Full"}</ToolButton>
    </div>
  );
}

function ToolButton({ children, label, onClick }: { children: string; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="border-l border-[#34322b] px-2.5 py-1.5 font-semibold text-[#c9c3b5] hover:bg-[#1f1d18] hover:text-[#f4f1e8] first:border-l-0" title={label} aria-label={label}>
      {children}
    </button>
  );
}

function handleWheel(event: WheelEvent<HTMLDivElement>, setZoom: (updater: (value: number) => number) => void) {
  if (!event.ctrlKey && !event.metaKey) return;
  event.preventDefault();
  setZoom((value) => clampZoom(value + (event.deltaY < 0 ? zoomStep : -zoomStep)));
}

function clampZoom(value: number) {
  return Math.min(maxZoom, Math.max(minZoom, Number(value.toFixed(2))));
}
