"use client";

import { useMemo, useState, type PointerEvent, type WheelEvent } from "react";

import type { ResourceBudgetData, VendorSpend } from "@/lib/resource-data";

type FlowNode = {
  id: string;
  label: string;
  amount: number;
  color: string;
  column: 0 | 1 | 2;
};

type FlowLink = {
  id: string;
  from: string;
  to: string;
  amount: number;
  color: string;
  note: string;
};

type PositionedNode = FlowNode & {
  x: number;
  y: number;
  width: number;
  height: number;
};

const columnX = [48, 390, 746] as const;
const nodeWidth = 170;
const svgHeight = 640;
const minZoom = 0.72;
const maxZoom = 1.9;
const zoomStep = 0.14;
type PanState = { x: number; y: number };
type DragState = { pointerId: number; startX: number; startY: number; originX: number; originY: number };

const vendorColors: Record<VendorSpend["category"], string> = {
  equipment: "#c84c39",
  vehicle: "#567d3f",
  hotel: "#b87949",
  location: "#477a38",
  vfx: "#7d4b72",
  production: "#157a6e",
};

const categoryLabels: Record<VendorSpend["category"], string> = {
  equipment: "器材公司",
  vehicle: "车辆",
  hotel: "酒店住宿",
  location: "场地",
  vfx: "VFX供应商",
  production: "制片杂项",
};

export function SankeyFlow({ data }: { data: ResourceBudgetData }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<PanState>({ x: 0, y: 0 });
  const [drag, setDrag] = useState<DragState | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const model = useMemo(() => buildSankeyModel(data), [data]);
  const activeLink = model.links.find((link) => link.id === activeId) ?? null;

  function resetCanvas() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function beginPan(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: pan.x, originY: pan.y });
  }

  function updatePan(event: PointerEvent<HTMLDivElement>) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    setPan({
      x: drag.originX + event.clientX - drag.startX,
      y: drag.originY + event.clientY - drag.startY,
    });
  }

  function endPan(event: PointerEvent<HTMLDivElement>) {
    if (drag?.pointerId === event.pointerId) {
      setDrag(null);
    }
  }

  return (
    <section className={["border border-[#34322b] bg-[#181713]", isExpanded ? "fixed inset-4 z-50 flex flex-col shadow-2xl shadow-black/70" : ""].join(" ")}>
      <div className="flex items-start justify-between gap-5 border-b border-[#34322b] px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d8b46a]">sankey flow</p>
          <h2 className="mt-1 text-lg font-semibold">资金流向桑基图</h2>
        </div>
        <div className="flex items-start gap-4">
          <div className="text-right text-xs text-[#8f8a7e]">
            <p>总预算 → 部门/类别 → 供应商与执行项</p>
            <p className="mt-1 font-mono text-[#e8c678]">{formatMoney(data.project.totalBudget)}</p>
          </div>
          <ChartToolbar
            zoom={zoom}
            isExpanded={isExpanded}
            onZoomIn={() => setZoom((value) => clampZoom(value + zoomStep))}
            onZoomOut={() => setZoom((value) => clampZoom(value - zoomStep))}
            onReset={resetCanvas}
            onToggleExpanded={() => setIsExpanded((value) => !value)}
          />
        </div>
      </div>

      {isExpanded ? <div className="pointer-events-none fixed inset-0 -z-10 bg-black/70" /> : null}

      <div className={["grid min-h-0 grid-cols-[1fr_260px]", isExpanded ? "flex-1" : ""].join(" ")}>
        <div
          className={["overflow-hidden p-4", isExpanded ? "h-full" : ""].join(" ")}
          onWheel={(event) => handleChartWheel(event, setZoom)}
        >
          <div
            className={["h-full min-h-[640px] touch-none select-none", drag ? "cursor-grabbing" : "cursor-grab"].join(" ")}
            onPointerDown={beginPan}
            onPointerMove={updatePan}
            onPointerUp={endPan}
            onPointerCancel={endPan}
          >
            <svg
              viewBox="0 0 980 640"
              className={["origin-top-left transition-transform duration-150", isExpanded ? "h-[78vh]" : "h-[640px]", "min-w-[920px]"].join(" ")}
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
              role="img"
              aria-label="资金流向桑基图"
            >
              <defs>
                <filter id="sankeyGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#d8b46a" floodOpacity="0.22" />
                </filter>
              </defs>

              {model.links.map((link) => {
                const from = model.positionedNodes.get(link.from);
                const to = model.positionedNodes.get(link.to);
                if (!from || !to) return null;

                const width = Math.max(5, Math.min(34, (link.amount / model.maxAmount) * 34));
                const isActive = activeId === link.id;
                const startX = from.x + from.width;
                const startY = from.y + from.height / 2;
                const endX = to.x;
                const endY = to.y + to.height / 2;
                const mid = startX + (endX - startX) * 0.52;
                const d = `M ${startX} ${startY} C ${mid} ${startY}, ${mid} ${endY}, ${endX} ${endY}`;

                return (
                  <path
                    key={link.id}
                    d={d}
                    fill="none"
                    stroke={link.color}
                    strokeLinecap="round"
                    strokeOpacity={isActive || !activeId ? 0.58 : 0.16}
                    strokeWidth={isActive ? width + 4 : width}
                    filter={isActive ? "url(#sankeyGlow)" : undefined}
                    onMouseEnter={() => setActiveId(link.id)}
                    onMouseLeave={() => setActiveId(null)}
                    className="cursor-pointer transition"
                  />
                );
              })}

              {model.nodes.map((node) => {
                const isRelated =
                  !activeId || model.links.some((link) => link.id === activeId && (link.from === node.id || link.to === node.id));

                return (
                  <g key={node.id} opacity={isRelated ? 1 : 0.38}>
                    <rect x={node.x} y={node.y} width={node.width} height={node.height} fill="#11110f" stroke="#34322b" />
                    <rect x={node.x} y={node.y} width={4} height={node.height} fill={node.color} />
                    <text x={node.x + 14} y={node.y + 21} fill="#f4f1e8" fontSize="12" fontWeight="700">
                      {node.label.length > 15 ? `${node.label.slice(0, 15)}…` : node.label}
                    </text>
                    <text x={node.x + 14} y={node.y + 42} fill="#8f8a7e" fontSize="11" fontFamily="monospace">
                      {formatCompactMoney(node.amount)}
                    </text>
                  </g>
                );
              })}

              <ColumnLabel x={columnX[0]} label="Source" />
              <ColumnLabel x={columnX[1]} label="Department / Category" />
              <ColumnLabel x={columnX[2]} label="Vendor / Item" />
            </svg>
          </div>
        </div>

        <aside className="border-l border-[#34322b] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">selected flow</p>
          {activeLink ? (
            <div className="mt-4 border border-[#34322b] bg-[#11110f] p-3">
              <p className="text-sm font-semibold text-[#f4f1e8]">{labelFor(model.positionedNodes, activeLink.from)} → {labelFor(model.positionedNodes, activeLink.to)}</p>
              <p className="mt-3 font-mono text-xl font-semibold text-[#e8c678]">{formatMoney(activeLink.amount)}</p>
              <p className="mt-3 text-xs leading-5 text-[#aaa599]">{activeLink.note}</p>
            </div>
          ) : (
            <div className="mt-4 border border-dashed border-[#34322b] p-3 text-xs leading-6 text-[#8f8a7e]">
              鼠标悬停在任意流线上，可以查看具体金额、来源和审计说明。
            </div>
          )}

          <div className="mt-4 space-y-2">
            {model.links
              .slice()
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 7)
              .map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onMouseEnter={() => setActiveId(link.id)}
                  onMouseLeave={() => setActiveId(null)}
                  className="block w-full border border-[#2f2c25] bg-[#11110f] px-3 py-2 text-left text-xs hover:border-[#d8b46a]/70"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="truncate text-[#c9c3b5]">{labelFor(model.positionedNodes, link.to)}</span>
                    <span className="font-mono text-[#e8c678]">{formatCompactMoney(link.amount)}</span>
                  </span>
                </button>
              ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function ChartToolbar({
  zoom,
  isExpanded,
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleExpanded,
}: {
  zoom: number;
  isExpanded: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleExpanded: () => void;
}) {
  return (
    <div className="flex items-center border border-[#34322b] bg-[#11110f] text-xs">
      <ToolButton label="缩小图表" onClick={onZoomOut}>-</ToolButton>
      <button type="button" onClick={onReset} className="min-w-16 border-l border-[#34322b] px-3 py-2 font-mono text-[#e8c678] hover:bg-[#1f1d18]" title="重置缩放">
        {Math.round(zoom * 100)}%
      </button>
      <ToolButton label="放大图表" onClick={onZoomIn}>+</ToolButton>
      <ToolButton label={isExpanded ? "退出全屏" : "全屏查看"} onClick={onToggleExpanded}>{isExpanded ? "Exit" : "Full"}</ToolButton>
    </div>
  );
}

function ToolButton({ children, label, onClick }: { children: string; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="border-l border-[#34322b] px-3 py-2 font-semibold text-[#c9c3b5] hover:bg-[#1f1d18] hover:text-[#f4f1e8] first:border-l-0" title={label} aria-label={label}>
      {children}
    </button>
  );
}

function ColumnLabel({ x, label }: { x: number; label: string }) {
  return (
    <text x={x} y={24} fill="#7f7a70" fontSize="10" fontWeight="700" letterSpacing="2">
      {label.toUpperCase()}
    </text>
  );
}

function handleChartWheel(event: WheelEvent<HTMLDivElement>, setZoom: (updater: (value: number) => number) => void) {
  event.preventDefault();
  setZoom((value) => clampZoom(value + (event.deltaY < 0 ? zoomStep : -zoomStep) * (event.shiftKey ? 1.8 : 1)));
}

function clampZoom(value: number) {
  return Math.min(maxZoom, Math.max(minZoom, Number(value.toFixed(2))));
}

function buildSankeyModel(data: ResourceBudgetData) {
  const nodes: FlowNode[] = [
    { id: "source-budget", label: "总预算", amount: data.project.totalBudget, color: "#d8b46a", column: 0 },
    { id: "source-vendor", label: "供应商合同", amount: data.vendors.reduce((sum, vendor) => sum + vendor.amount, 0), color: "#4f7f9b", column: 0 },
    ...data.departments.slice(0, 8).map((department) => ({
      id: `department-${department.id}`,
      label: department.name,
      amount: department.budget,
      color: department.color,
      column: 1 as const,
    })),
    ...getVendorCategoryNodes(data),
    ...data.vendors.map((vendor) => ({
      id: `vendor-${vendor.id}`,
      label: vendor.name,
      amount: vendor.amount,
      color: vendorColors[vendor.category],
      column: 2 as const,
    })),
    ...data.payments
      .filter((payment) => payment.status === "blocked")
      .map((payment) => ({
        id: `payment-${payment.id}`,
        label: payment.label,
        amount: payment.amount,
        color: "#e24b4a",
        column: 2 as const,
      })),
  ];

  const links: FlowLink[] = [
    ...data.departments.slice(0, 8).map((department) => ({
      id: `budget-${department.id}`,
      from: "source-budget",
      to: `department-${department.id}`,
      amount: department.budget,
      color: department.color,
      note: `${department.name}: 预算 ${formatMoney(department.budget)}，已用 ${formatMoney(department.actual)}。`,
    })),
    ...getVendorCategoryNodes(data).map((category) => ({
      id: `vendor-category-${category.id}`,
      from: "source-vendor",
      to: category.id,
      amount: category.amount,
      color: category.color,
      note: `${category.label}: 供应商合同金额 ${formatMoney(category.amount)}。`,
    })),
    ...data.vendors.map((vendor) => ({
      id: `category-vendor-${vendor.id}`,
      from: `category-${vendor.category}`,
      to: `vendor-${vendor.id}`,
      amount: vendor.amount,
      color: vendorColors[vendor.category],
      note: vendor.auditFlag,
    })),
    ...data.payments
      .filter((payment) => payment.status === "blocked")
      .map((payment) => ({
        id: `blocked-${payment.id}`,
        from: `vendor-${payment.vendorId}`,
        to: `payment-${payment.id}`,
        amount: payment.amount,
        color: "#e24b4a",
        note: payment.gate,
      })),
  ];

  const positionedNodes = positionNodes(nodes);

  return {
    nodes: Array.from(positionedNodes.values()),
    links,
    positionedNodes,
    maxAmount: Math.max(...links.map((link) => link.amount), 1),
  };
}

function getVendorCategoryNodes(data: ResourceBudgetData): FlowNode[] {
  const totals = data.vendors.reduce<Record<VendorSpend["category"], number>>(
    (current, vendor) => ({
      ...current,
      [vendor.category]: (current[vendor.category] ?? 0) + vendor.amount,
    }),
    {} as Record<VendorSpend["category"], number>,
  );

  return Object.entries(totals).map(([category, amount]) => ({
    id: `category-${category}`,
    label: categoryLabels[category as VendorSpend["category"]],
    amount,
    color: vendorColors[category as VendorSpend["category"]],
    column: 1 as const,
  }));
}

function positionNodes(nodes: FlowNode[]) {
  const result = new Map<string, PositionedNode>();

  for (const column of [0, 1, 2] as const) {
    const columnNodes = nodes.filter((node) => node.column === column);
    const gap = column === 1 ? 13 : 16;
    const availableHeight = svgHeight - 64 - (columnNodes.length - 1) * gap;
    const totalAmount = columnNodes.reduce((sum, node) => sum + node.amount, 0) || 1;
    let y = 44;

    for (const node of columnNodes) {
      const height = Math.max(42, Math.min(82, (node.amount / totalAmount) * availableHeight));
      result.set(node.id, {
        ...node,
        x: columnX[column],
        y,
        width: nodeWidth,
        height,
      });
      y += height + gap;
    }
  }

  return result;
}

function labelFor(nodes: Map<string, PositionedNode>, id: string) {
  return nodes.get(id)?.label ?? id;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value);
}
