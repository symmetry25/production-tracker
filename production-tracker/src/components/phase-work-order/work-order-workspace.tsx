"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { downloadCsv } from "@/lib/csv";
import type { WorkOrderItem } from "@/lib/phase-work-order-data";

type WorkOrderDraft = {
  title: string;
  description: string;
  status: WorkOrderStatus;
};

type WorkOrderStatus = "open" | "scheduled" | "review" | "approved" | "blocked" | "closed";
type WorkOrderFilter = "ALL" | WorkOrderStatus;

const demoProjectId = "demo-mkali-mission";
const demoIdPrefix = "demo-";
const statusOptions: WorkOrderStatus[] = ["open", "scheduled", "review", "approved", "blocked", "closed"];
const statusMeta: Record<WorkOrderStatus, { label: string; dot: string; bg: string; text: string }> = {
  open: { label: "Open", dot: "#4a9eff", bg: "#1a2233", text: "#9bc7ff" },
  scheduled: { label: "Scheduled", dot: "#d8b46a", bg: "#2d2300", text: "#e8c678" },
  review: { label: "In Review", dot: "#ef9f27", bg: "#2d2300", text: "#efbf76" },
  approved: { label: "Approved", dot: "#1d9e75", bg: "#153728", text: "#9cccae" },
  blocked: { label: "Blocked", dot: "#e24b4a", bg: "#3a1717", text: "#ffaaa1" },
  closed: { label: "Closed", dot: "#8f8a7e", bg: "#2a2a28", text: "#c9c3b5" },
};

export function WorkOrderWorkspace({ projectId, workOrders }: { projectId: string; workOrders: WorkOrderItem[] }) {
  const router = useRouter();
  const [orderItems, setOrderItems] = useState(() => workOrders.map(normalizeOrder));
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkOrderFilter>("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WorkOrderItem | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const summary = useMemo(() => buildWorkOrderSummary(orderItems), [orderItems]);
  const filteredOrders = useMemo(() => {
    const lowered = query.trim().toLowerCase();

    return orderItems.filter((order) => {
      const matchesQuery = !lowered || order.title.toLowerCase().includes(lowered) || (order.description ?? "").toLowerCase().includes(lowered);
      const matchesStatus = statusFilter === "ALL" || normalizeStatus(order.status) === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [orderItems, query, statusFilter]);

  async function createWorkOrder(input: WorkOrderDraft) {
    const draft = normalizeDraft(input);
    setPendingId("new-work-order");
    setMessage(null);

    if (projectId === demoProjectId) {
      setOrderItems((current) => [createDemoOrder(draft, current), ...current]);
      setCreateOpen(false);
      setPendingId(null);
      setMessage("演示工单已创建。");
      return;
    }

    const response = await fetch(`/api/projects/${projectId}/work-orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("创建工单失败。");
      return;
    }

    setCreateOpen(false);
    setMessage("工单已创建。");
    startTransition(() => router.refresh());
  }

  async function updateWorkOrder(orderId: string, input: WorkOrderDraft) {
    const draft = normalizeDraft(input);
    setPendingId(orderId);
    setMessage(null);

    if (orderId.startsWith(demoIdPrefix)) {
      patchLocalOrder(orderId, draft);
      setEditingOrder(null);
      setPendingId(null);
      setMessage("演示工单已更新。");
      return;
    }

    const response = await fetch(`/api/work-orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("更新工单失败。");
      return;
    }

    setEditingOrder(null);
    setMessage("工单已更新。");
    startTransition(() => router.refresh());
  }

  async function updateStatus(orderId: string, status: WorkOrderStatus) {
    const order = orderItems.find((item) => item.id === orderId);
    if (!order) return;

    await updateWorkOrder(orderId, {
      title: order.title,
      description: order.description ?? "",
      status,
    });
  }

  async function deleteWorkOrder(orderId: string) {
    setPendingId(orderId);
    setMessage(null);

    if (orderId.startsWith(demoIdPrefix)) {
      setOrderItems((current) => current.filter((order) => order.id !== orderId));
      setEditingOrder((current) => (current?.id === orderId ? null : current));
      setPendingId(null);
      setMessage("演示工单已删除。");
      return;
    }

    const response = await fetch(`/api/work-orders/${orderId}`, { method: "DELETE" });

    setPendingId(null);

    if (!response.ok) {
      setMessage("删除工单失败。");
      return;
    }

    setMessage("工单已删除。");
    startTransition(() => router.refresh());
  }

  function patchLocalOrder(orderId: string, patch: Partial<WorkOrderItem>) {
    setOrderItems((current) => current.map((order) => (order.id === orderId ? normalizeOrder({ ...order, ...patch }) : order)));
    setEditingOrder((current) => (current?.id === orderId ? normalizeOrder({ ...current, ...patch }) : current));
  }

  return (
    <div>
      {message ? <div className="mb-3 border border-[#3f3c33] bg-[#181713] px-3 py-2 text-sm text-[#d8b46a]">{message}</div> : null}

      <section className="mb-4 border border-[#34322b] bg-[#181713]">
        <div className="grid border-b border-[#2a2a28] md:grid-cols-6">
          <Metric label="Orders" value={summary.total} />
          <Metric label="Open" value={summary.open} />
          <Metric label="Review" value={summary.review} tone={summary.review ? "warn" : "normal"} />
          <Metric label="Blocked" value={summary.blocked} tone={summary.blocked ? "danger" : "normal"} />
          <Metric label="Approved" value={summary.approved} tone={summary.approved ? "good" : "normal"} />
          <Metric label="Closed" value={summary.closed} />
        </div>
        <div className="grid gap-2 p-3 xl:grid-cols-[minmax(260px,1fr)_170px_auto_auto]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索工单、供应商、审计事项"
            className="h-9 border border-[#34322b] bg-[#11110f] px-3 text-sm text-[#f4f1e8] outline-none placeholder:text-[#6e6e69] focus:border-[#d8b46a]"
          />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as WorkOrderFilter)} className="h-9 border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#c9c3b5] outline-none focus:border-[#d8b46a]">
            <option value="ALL">全部状态</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {statusMeta[status].label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => downloadCsv("work-orders.csv", buildWorkOrderCsvRows(orderItems))}
            className="h-9 border border-[#34322b] px-3 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
          >
            Export CSV
          </button>
          <button type="button" onClick={() => setCreateOpen(true)} className="h-9 bg-[#378add] px-4 text-xs font-semibold text-white transition hover:bg-[#4a9eff]">
            Add Work Order
          </button>
        </div>
      </section>

      <section className="overflow-hidden border border-[#34322b] bg-[#181713]">
        <div className="grid min-w-[1040px] grid-cols-[minmax(260px,1.2fr)_170px_minmax(360px,1.4fr)_170px_180px] border-b border-[#2a2a28] bg-[#1e1e1c] text-[11px] font-medium uppercase tracking-[0.12em] text-[#6e6e69]">
          <HeaderCell>Work order</HeaderCell>
          <HeaderCell>Status</HeaderCell>
          <HeaderCell>Description</HeaderCell>
          <HeaderCell>Created</HeaderCell>
          <HeaderCell>Actions</HeaderCell>
        </div>
        <div className="overflow-x-auto">
          {filteredOrders.length ? (
            filteredOrders.map((order) => {
              const normalizedStatus = normalizeStatus(order.status);

              return (
                <div key={order.id} className="grid min-h-16 min-w-[1040px] grid-cols-[minmax(260px,1.2fr)_170px_minmax(360px,1.4fr)_170px_180px] items-center border-b border-[#2a2a28] text-sm hover:bg-[#252523]">
                  <div className="min-w-0 px-3">
                    <p className="truncate font-medium text-[#f4f1e8]">{order.title}</p>
                    <p className="mt-1 text-xs text-[#7f7a70]">#{order.id.slice(-8)}</p>
                  </div>
                  <div className="px-3">
                    <select
                      value={normalizedStatus}
                      disabled={pendingId === order.id}
                      onChange={(event) => updateStatus(order.id, event.target.value as WorkOrderStatus)}
                      className="h-8 w-full border border-[#34322b] bg-[#11110f] px-2 text-xs outline-none focus:border-[#d8b46a]"
                      style={{ color: statusMeta[normalizedStatus].text }}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {statusMeta[status].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="line-clamp-2 px-3 text-xs leading-5 text-[#aaa599]">{order.description || "No description"}</p>
                  <div className="px-3 font-mono text-xs text-[#8f8a7e]">{formatDateTime(order.createdAt)}</div>
                  <div className="flex items-center justify-end gap-2 px-3">
                    <button type="button" onClick={() => setEditingOrder(order)} className="h-8 border border-[#34322b] px-3 text-xs text-[#c9c3b5] hover:border-[#d8b46a] hover:text-[#e8c678]">
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={pendingId === order.id}
                      onClick={() => deleteWorkOrder(order.id)}
                      className="h-8 border border-[#3d2b2b] px-3 text-xs text-[#e28b81] hover:border-[#e24b4a] hover:text-[#ffaaa1] disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid min-h-56 place-items-center px-6 py-10 text-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">No matching work order</p>
                <p className="mt-3 text-sm text-[#aaa599]">调整筛选，或者新增一个制片、审计或供应商工单。</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {createOpen ? <WorkOrderDialog mode="create" pending={pendingId === "new-work-order"} onClose={() => setCreateOpen(false)} onSave={createWorkOrder} /> : null}
      {editingOrder ? (
        <WorkOrderDialog
          mode="edit"
          workOrder={editingOrder}
          pending={pendingId === editingOrder.id}
          onClose={() => setEditingOrder(null)}
          onSave={(input) => updateWorkOrder(editingOrder.id, input)}
        />
      ) : null}
    </div>
  );
}

function WorkOrderDialog({ mode, workOrder, pending, onClose, onSave }: { mode: "create" | "edit"; workOrder?: WorkOrderItem; pending: boolean; onClose: () => void; onSave: (input: WorkOrderDraft) => void }) {
  const [draft, setDraft] = useState<WorkOrderDraft>(() => ({
    title: workOrder?.title ?? "",
    description: workOrder?.description ?? "",
    status: normalizeStatus(workOrder?.status ?? "open"),
  }));
  const isInvalid = draft.title.trim().length < 2;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/62 px-6">
      <div className="w-full max-w-2xl border border-[#3d392f] bg-[#181713] shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-[#34322b] px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Work Order</p>
            <h2 className="mt-1 text-xl font-semibold text-[#f4f1e8]">{mode === "create" ? "新建工单" : "编辑工单"}</h2>
          </div>
          <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-[#aaa599] hover:text-[#f4f1e8]">
            关闭
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">Title</span>
              <input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                className="mt-2 h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm text-[#f4f1e8] outline-none focus:border-[#d8b46a]"
                placeholder="例如 VFX 付款门槛审查 / 酒店住宿确认"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">Status</span>
              <select
                value={draft.status}
                onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as WorkOrderStatus }))}
                className="mt-2 h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm text-[#f4f1e8] outline-none focus:border-[#d8b46a]"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {statusMeta[status].label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">Description</span>
            <textarea
              value={draft.description}
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              rows={5}
              className="mt-2 w-full resize-none border border-[#34322b] bg-[#11110f] px-3 py-3 text-sm leading-6 text-[#f4f1e8] outline-none focus:border-[#d8b46a]"
              placeholder="写清楚负责人、交付物、付款/审计条件、下一步动作。"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#34322b] px-5 py-4">
          <button type="button" onClick={onClose} className="h-10 border border-[#3f3c33] px-4 text-sm text-[#c9c3b5]">
            取消
          </button>
          <button type="button" disabled={isInvalid || pending} onClick={() => onSave(draft)} className="h-10 bg-[#378add] px-5 text-sm font-semibold text-white disabled:opacity-50">
            {pending ? "保存中..." : "保存工单"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, tone = "normal" }: { label: string; value: number; tone?: "normal" | "good" | "warn" | "danger" }) {
  const toneClass = tone === "good" ? "text-[#9cccae]" : tone === "warn" ? "text-[#e8c678]" : tone === "danger" ? "text-[#e28b81]" : "text-[#f4f1e8]";
  return (
    <div className="border-b border-r border-[#34322b] px-4 py-3 last:border-r-0 md:border-b-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">{label}</p>
      <p className={["mt-1 font-mono text-lg", toneClass].join(" ")}>{value}</p>
    </div>
  );
}

function HeaderCell({ children }: { children: React.ReactNode }) {
  return <div className="flex h-9 items-center px-3">{children}</div>;
}

function normalizeOrder(order: WorkOrderItem): WorkOrderItem {
  return { ...order, status: normalizeStatus(order.status) };
}

function normalizeStatus(status: string): WorkOrderStatus {
  return statusOptions.includes(status as WorkOrderStatus) ? (status as WorkOrderStatus) : "open";
}

function normalizeDraft(input: WorkOrderDraft) {
  return {
    title: input.title.trim(),
    description: input.description.trim(),
    status: input.status,
  };
}

function createDemoOrder(input: ReturnType<typeof normalizeDraft>, current: WorkOrderItem[]): WorkOrderItem {
  const baseId = `demo-workorder-${slugify(input.title) || "new"}`;
  let id = baseId;
  let index = 1;

  while (current.some((order) => order.id === id)) {
    index += 1;
    id = `${baseId}-${index}`;
  }

  return {
    id,
    title: input.title,
    description: input.description || null,
    status: input.status,
    createdAt: new Date().toISOString(),
  };
}

function buildWorkOrderSummary(workOrders: WorkOrderItem[]) {
  return {
    total: workOrders.length,
    open: workOrders.filter((order) => normalizeStatus(order.status) === "open").length,
    review: workOrders.filter((order) => normalizeStatus(order.status) === "review").length,
    blocked: workOrders.filter((order) => normalizeStatus(order.status) === "blocked").length,
    approved: workOrders.filter((order) => normalizeStatus(order.status) === "approved").length,
    closed: workOrders.filter((order) => normalizeStatus(order.status) === "closed").length,
  };
}

function buildWorkOrderCsvRows(workOrders: WorkOrderItem[]) {
  return [
    ["title", "status", "description", "created_at"],
    ...workOrders.map((order) => [order.title, statusMeta[normalizeStatus(order.status)].label, order.description ?? "", order.createdAt]),
  ];
}

function formatDateTime(value: string) {
  const iso = value.includes("T") ? value : new Date(value).toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-|-$/g, "");
}
