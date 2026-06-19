"use client";

import { useState, type ReactNode, type WheelEvent } from "react";

import type { Dictionary } from "@/lib/i18n";

const minZoom = 0.72;
const maxZoom = 1.9;
const zoomStep = 0.14;
type ChartToolLabels = Dictionary["pages"]["overview"]["charts"]["chartTools"];

const defaultLabels: ChartToolLabels = {
  expandedChart: "expanded chart",
  zoomOut: "Zoom out",
  resetZoom: "Reset zoom",
  zoomIn: "Zoom in",
  full: "Full",
  fullLabel: "View fullscreen",
  exit: "Exit",
  exitLabel: "Exit fullscreen",
};

export function ChartViewport({
  title,
  children,
  minHeight = 260,
  compact = false,
  labels = defaultLabels,
}: {
  title: string;
  children: ReactNode;
  minHeight?: number;
  compact?: boolean;
  labels?: ChartToolLabels;
}) {
  const [zoom, setZoom] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const toolbar = (
    <ChartViewportToolbar
      zoom={zoom}
      expanded={expanded}
      compact={compact}
      labels={labels}
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7f7a70]">{labels.expandedChart}</p>
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
  labels,
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleExpanded,
}: {
  zoom: number;
  expanded: boolean;
  compact: boolean;
  labels: ChartToolLabels;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleExpanded: () => void;
}) {
  return (
    <div className="flex items-center border border-[#34322b] bg-[#11110f] text-[11px] shadow-[0_8px_22px_rgba(0,0,0,0.28)]">
      <ToolButton label={labels.zoomOut} onClick={onZoomOut}>-</ToolButton>
      <button type="button" onClick={onReset} className={["border-l border-[#34322b] font-mono text-[#e8c678] hover:bg-[#1f1d18]", compact ? "min-w-12 px-2 py-1.5" : "min-w-16 px-3 py-2"].join(" ")} title={labels.resetZoom}>
        {Math.round(zoom * 100)}%
      </button>
      <ToolButton label={labels.zoomIn} onClick={onZoomIn}>+</ToolButton>
      <ToolButton label={expanded ? labels.exitLabel : labels.fullLabel} onClick={onToggleExpanded}>{expanded ? labels.exit : labels.full}</ToolButton>
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
