"use client";

import * as ContextMenu from "@radix-ui/react-context-menu";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { TaskStatus } from "@/generated/prisma/enums";

import { downloadCsv, downloadXlsx } from "@/lib/csv";
import { contextMenuLabels, getContextMenuLocale } from "@/lib/context-menu-i18n";
import type { ShotTableItem } from "@/lib/shot-data";
import { PIPELINE_COLORS, PIPELINE_STEPS, STATUS_COLORS } from "@/lib/status-colors";

const statusCycle: TaskStatus[] = ["WAITING_TO_START", "READY_TO_START", "IN_PROGRESS", "PENDING_REVIEW", "APPROVED", "FINAL"];
const shotMenuStatuses: TaskStatus[] = ["WAITING_TO_START", "READY_TO_START", "IN_PROGRESS", "PENDING_REVIEW", "FINAL", "ON_HOLD"];
const demoIdPrefix = "demo-";

type ShotRiskFilter = "ALL" | "NEEDS_REVIEW" | "BLOCKED" | "NO_FRAMES";
type ShotInput = Pick<ShotTableItem, "code" | "sequenceCode" | "status" | "description" | "cutIn" | "cutOut">;

export function ShotTable({ projectId, shots }: { projectId: string; shots: ShotTableItem[] }) {
  const router = useRouter();
  const [shotItems, setShotItems] = useState(shots);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [detailShot, setDetailShot] = useState<ShotTableItem | null>(null);
  const [editShot, setEditShot] = useState<ShotTableItem | null>(null);
  const [newShotOpen, setNewShotOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sequenceFilter, setSequenceFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TaskStatus>("ALL");
  const [riskFilter, setRiskFilter] = useState<ShotRiskFilter>("ALL");
  const [selectedShotIds, setSelectedShotIds] = useState<string[]>([]);
  const [, startTransition] = useTransition();

  const sequenceOptions = useMemo(() => Array.from(new Set(shotItems.map((shot) => shot.sequenceCode))).sort(), [shotItems]);
  const summary = useMemo(() => getShotSummary(shotItems), [shotItems]);
  const filteredShots = useMemo(
    () => filterShots(shotItems, { query, sequenceFilter, statusFilter, riskFilter }),
    [query, riskFilter, sequenceFilter, shotItems, statusFilter],
  );
  const groups = groupShotsBySequence(filteredShots);
  const activeFilterCount = [query.trim(), sequenceFilter !== "ALL", statusFilter !== "ALL", riskFilter !== "ALL"].filter(Boolean).length;
  const selectedShotIdSet = useMemo(() => new Set(selectedShotIds), [selectedShotIds]);
  const selectedShots = useMemo(() => shotItems.filter((shot) => selectedShotIdSet.has(shot.id)), [selectedShotIdSet, shotItems]);
  const filteredShotIds = useMemo(() => filteredShots.map((shot) => shot.id), [filteredShots]);
  const allFilteredSelected = filteredShotIds.length > 0 && filteredShotIds.every((id) => selectedShotIdSet.has(id));
  const selectedFrameCount = selectedShots.reduce((sum, shot) => sum + (shot.cutDuration ?? 0), 0);
  const selectedSequenceCount = new Set(selectedShots.map((shot) => shot.sequenceCode)).size;

  function patchLocalShot(shotId: string, patch: Partial<ShotTableItem>) {
    setShotItems((current) => current.map((shot) => (shot.id === shotId ? normalizeShot({ ...shot, ...patch }) : shot)));
    setDetailShot((current) => (current?.id === shotId ? normalizeShot({ ...current, ...patch }) : current));
    setEditShot((current) => (current?.id === shotId ? normalizeShot({ ...current, ...patch }) : current));
  }

  function patchLocalTask(taskId: string, status: TaskStatus) {
    const updatePipeline = (shot: ShotTableItem): ShotTableItem => ({
      ...shot,
      pipeline: Object.fromEntries(
        Object.entries(shot.pipeline).map(([step, task]) => [step, task?.id === taskId ? { ...task, status } : task]),
      ) as ShotTableItem["pipeline"],
    });

    setShotItems((current) => current.map(updatePipeline));
    setDetailShot((current) => (current ? updatePipeline(current) : current));
    setEditShot((current) => (current ? updatePipeline(current) : current));
  }

  async function updateTaskStatus(taskId: string, currentStatus: TaskStatus) {
    const nextStatus = statusCycle[(statusCycle.indexOf(currentStatus) + 1) % statusCycle.length];
    setPendingId(taskId);
    setMessage(null);

    if (taskId.startsWith(demoIdPrefix)) {
      patchLocalTask(taskId, nextStatus);
      setPendingId(null);
      setMessage("演示镜头任务状态已更新。");
      return;
    }

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("更新任务状态失败。");
      return;
    }

    startTransition(() => router.refresh());
  }

  async function updateShotStatus(shotId: string, status: TaskStatus) {
    setPendingId(shotId);
    setMessage(null);

    if (shotId.startsWith(demoIdPrefix)) {
      patchLocalShot(shotId, { status });
      setPendingId(null);
      setMessage("演示镜头状态已更新。");
      return;
    }

    const response = await fetch(`/api/shots/${shotId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("更新镜头状态失败。");
      return;
    }

    startTransition(() => router.refresh());
  }

  function toggleShotSelection(shotId: string, selected: boolean) {
    setSelectedShotIds((current) => {
      if (selected) return current.includes(shotId) ? current : [...current, shotId];
      return current.filter((id) => id !== shotId);
    });
  }

  function toggleFilteredSelection(selected: boolean) {
    setSelectedShotIds((current) => {
      if (!selected) return current.filter((id) => !filteredShotIds.includes(id));
      const next = new Set(current);
      for (const id of filteredShotIds) next.add(id);
      return Array.from(next);
    });
  }

  async function bulkSetShotStatus(status: TaskStatus) {
    if (selectedShotIds.length === 0) return;

    const shotIds = [...selectedShotIds];
    const realShotIds = shotIds.filter((shotId) => !shotId.startsWith(demoIdPrefix));
    setPendingId("bulk-status");
    setMessage(null);

    if (realShotIds.length) {
      const responses = await Promise.all(
        realShotIds.map((shotId) =>
          fetch(`/api/shots/${shotId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          }),
        ),
      );

      if (responses.some((response) => !response.ok)) {
        setPendingId(null);
        setMessage("批量更新镜头状态失败，请检查权限或镜头状态。");
        return;
      }
    }

    const patchSelectedShot = (shot: ShotTableItem) => (shotIds.includes(shot.id) ? normalizeShot({ ...shot, status }) : shot);
    setShotItems((current) => current.map(patchSelectedShot));
    setDetailShot((current) => (current ? patchSelectedShot(current) : current));
    setEditShot((current) => (current ? patchSelectedShot(current) : current));
    setPendingId(null);
    setSelectedShotIds([]);
    setMessage(`已更新 ${shotIds.length} 个镜头。`);

    if (realShotIds.length) {
      startTransition(() => router.refresh());
    }
  }

  async function updateShot(shotId: string, input: ShotInput) {
    const normalized = normalizeShot({
      ...input,
      code: input.code.trim().toUpperCase(),
      sequenceCode: input.sequenceCode.trim().toUpperCase(),
      cutDuration: null,
      pipeline: editShot?.pipeline ?? createBlankPipeline(shotId),
      id: shotId,
    });
    setPendingId(shotId);
    setMessage(null);

    if (shotId.startsWith(demoIdPrefix)) {
      patchLocalShot(shotId, normalized);
      setPendingId(null);
      setEditShot(null);
      setMessage("演示镜头信息已更新。");
      return;
    }

    const response = await fetch(`/api/shots/${shotId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: normalized.code,
        sequenceCode: normalized.sequenceCode,
        status: normalized.status,
        description: normalized.description,
        cutIn: normalized.cutIn,
        cutOut: normalized.cutOut,
      }),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("更新镜头信息失败。");
      return;
    }

    patchLocalShot(shotId, normalized);
    setEditShot(null);
    startTransition(() => router.refresh());
  }

  async function deleteShot(shotId: string) {
    setPendingId(shotId);
    setMessage(null);

    if (shotId.startsWith(demoIdPrefix)) {
      setShotItems((current) => current.filter((shot) => shot.id !== shotId));
      setDetailShot((current) => (current?.id === shotId ? null : current));
      setEditShot((current) => (current?.id === shotId ? null : current));
      setSelectedShotIds((current) => current.filter((id) => id !== shotId));
      setPendingId(null);
      setMessage("演示镜头已删除。");
      return;
    }

    const response = await fetch(`/api/shots/${shotId}`, {
      method: "DELETE",
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("删除镜头失败。");
      return;
    }

    setSelectedShotIds((current) => current.filter((id) => id !== shotId));
    startTransition(() => router.refresh());
  }

  async function createShot(input: ShotInput) {
    const code = input.code.trim().toUpperCase();
    const sequenceCode = input.sequenceCode.trim().toUpperCase();
    const id = `demo-shot-${code.toLowerCase()}`;
    setPendingId("new-shot");
    setMessage(null);

    if (projectId === "demo-mkali-mission") {
      setShotItems((current) => {
        const baseId = current.some((shot) => shot.id === id) ? `${id}-copy` : id;
        let copyIndex = current.some((shot) => shot.id === baseId) ? 1 : 0;
        while (copyIndex > 0 && current.some((shot) => shot.id === `${baseId}-${copyIndex}`)) copyIndex += 1;
        const shotId = copyIndex > 0 ? `${baseId}-${copyIndex}` : baseId;
        const shot = normalizeShot({
          ...input,
          id: shotId,
          code,
          sequenceCode,
          cutDuration: null,
          pipeline: createBlankPipeline(shotId),
        });
        return [shot, ...current];
      });
      setPendingId(null);
      setNewShotOpen(false);
      setMessage("演示镜头已创建。");
      return;
    }

    const response = await fetch(`/api/projects/${projectId}/shots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        sequenceCode,
        description: input.description ?? "",
        cutIn: input.cutIn ?? undefined,
        cutOut: input.cutOut ?? undefined,
      }),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("创建镜头失败。");
      return;
    }

    setNewShotOpen(false);
    setMessage("镜头已创建。");
    startTransition(() => router.refresh());
  }

  async function duplicateShot(shot: ShotTableItem) {
    setPendingId(shot.id);
    setMessage(null);
    const nextCode = `${shot.code}_COPY`;

    if (shot.id.startsWith(demoIdPrefix)) {
      setShotItems((current) => {
        const baseId = `${shot.id}-copy`;
        let copyIndex = current.filter((item) => item.id.startsWith(baseId)).length + 1;
        while (current.some((item) => item.id === `${baseId}-${copyIndex}`)) copyIndex += 1;
        const copyId = `${baseId}-${copyIndex}`;
        const copy = normalizeShot({
          ...shot,
          id: copyId,
          code: `${shot.code}_COPY_${copyIndex}`,
          status: "WAITING_TO_START",
          pipeline: createBlankPipeline(copyId),
        });
        return [copy, ...current];
      });
      setPendingId(null);
      setMessage("演示镜头已复制。");
      return;
    }

    const response = await fetch(`/api/projects/${projectId}/shots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: nextCode,
        sequenceCode: shot.sequenceCode,
        description: shot.description ?? "",
        cutIn: shot.cutIn ?? undefined,
        cutOut: shot.cutOut ?? undefined,
      }),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("复制镜头失败，可能是镜头编号已经存在。");
      return;
    }

    setMessage("镜头已复制。");
    startTransition(() => router.refresh());
  }

  async function copyShotUrl(shotId: string) {
    const url = `${window.location.origin}/app/projects/${projectId}/shots?shot=${encodeURIComponent(shotId)}`;
    await navigator.clipboard.writeText(url).catch(() => undefined);
    setMessage("Shot URL 已复制。");
  }

  function openInReview(shot: ShotTableItem) {
    router.push(`/app/projects/${projectId}/media?context=${encodeURIComponent(shot.code)}`);
  }

  if (shotItems.length === 0) {
    return (
      <div className="grid min-h-72 place-items-center border border-dashed border-[#3f3c33] bg-[#181713] p-10 text-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">No shots</p>
          <h2 className="mt-3 text-2xl font-semibold">还没有镜头</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#aaa599]">创建镜头后，会按 Sequence 分组展示 LAY/ANM/CFX/FX/LGT/CMP 状态。</p>
          <button type="button" onClick={() => setNewShotOpen(true)} className="mt-5 h-10 bg-[#378add] px-4 text-sm font-semibold text-white transition hover:bg-[#4a9eff]">
            创建第一个镜头
          </button>
        </div>
        {newShotOpen ? <ShotEditDialog shot={createBlankShot()} mode="create" pending={pendingId === "new-shot"} onClose={() => setNewShotOpen(false)} onSave={createShot} /> : null}
      </div>
    );
  }

  return (
    <div>
      {message ? <div className="mb-3 border border-[#3f3c33] bg-[#181713] px-3 py-2 text-sm text-[#d8b46a]">{message}</div> : null}

      <div className="mb-3 grid gap-3 xl:grid-cols-[1fr_340px]">
        <section className="border border-[#34322b] bg-[#181713]">
          <div className="grid grid-cols-4 border-b border-[#2a2a28]">
            <SummaryCell label="Shots" value={summary.total} />
            <SummaryCell label="Final / Approved" value={summary.done} tone="good" />
            <SummaryCell label="Review queue" value={summary.review} tone="warn" />
            <SummaryCell label="Blocked" value={summary.blocked} tone="bad" />
          </div>
          <div className="grid gap-2 p-3 lg:grid-cols-[minmax(220px,1fr)_150px_170px_170px_auto]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索镜头、描述、Sequence"
              className="h-9 border border-[#34322b] bg-[#11110f] px-3 text-sm text-[#f4f1e8] outline-none placeholder:text-[#6e6e69] focus:border-[#d8b46a]"
            />
            <select value={sequenceFilter} onChange={(event) => setSequenceFilter(event.target.value)} className="h-9 border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#c9c3b5] outline-none focus:border-[#d8b46a]">
              <option value="ALL">全部序列</option>
              {sequenceOptions.map((sequence) => <option key={sequence} value={sequence}>{sequence}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "ALL" | TaskStatus)} className="h-9 border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#c9c3b5] outline-none focus:border-[#d8b46a]">
              <option value="ALL">全部状态</option>
              {Object.values(TaskStatus).map((status) => <option key={status} value={status}>{STATUS_COLORS[status].label}</option>)}
            </select>
            <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value as ShotRiskFilter)} className="h-9 border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#c9c3b5] outline-none focus:border-[#d8b46a]">
              <option value="ALL">全部风险</option>
              <option value="NEEDS_REVIEW">待审查</option>
              <option value="BLOCKED">停滞 / 等待</option>
              <option value="NO_FRAMES">缺少帧数</option>
            </select>
            <div className="flex gap-2">
              <button type="button" onClick={() => setNewShotOpen(true)} className="h-9 bg-[#378add] px-3 text-xs font-semibold text-white transition hover:bg-[#4a9eff]">
                Add Shot
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSequenceFilter("ALL");
                  setStatusFilter("ALL");
                  setRiskFilter("ALL");
                }}
                disabled={!activeFilterCount}
                className="h-9 border border-[#34322b] px-3 text-xs text-[#c9c3b5] transition hover:border-[#d8b46a] disabled:opacity-45"
              >
                重置
              </button>
              <button
                type="button"
                onClick={() => downloadCsv("shot-status-report.csv", buildShotCsvRows(filteredShots))}
                className="h-9 border border-[#34322b] px-3 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
              >
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => downloadXlsx("shot-status-report.xlsx", buildShotCsvRows(filteredShots), "Shots")}
                className="h-9 border border-[#34322b] px-3 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
              >
                Export XLSX
              </button>
            </div>
          </div>
        </section>

        <aside className="border border-[#34322b] bg-[#181713] p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d8b46a]">Producer queue</p>
            <span className="font-mono text-[11px] text-[#7f7a70]">{filteredShots.length}/{shotItems.length}</span>
          </div>
          <div className="mt-3 space-y-2">
            {summary.riskShots.length ? summary.riskShots.slice(0, 3).map((shot) => (
              <button key={shot.id} type="button" onClick={() => setQuery(shot.code)} className="block w-full border border-[#2f2c25] bg-[#11110f] px-3 py-2 text-left hover:border-[#d8b46a]/60">
                <span className="block truncate text-sm font-medium text-[#f4f1e8]">{shot.code}</span>
                <span className="mt-1 block truncate text-xs text-[#8f8a7e]">{getRiskLabel(shot)}</span>
              </button>
            )) : <p className="border border-dashed border-[#34322b] px-3 py-4 text-sm text-[#8f8a7e]">当前没有明显镜头风险。</p>}
          </div>
        </aside>
      </div>

      {selectedShots.length ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border border-[#4b432f] bg-[#1f1b12] px-3 py-2 text-sm">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#c9c3b5]">
            <span className="font-semibold uppercase tracking-[0.16em] text-[#e8c678]">{selectedShots.length} selected</span>
            <span className="font-mono">{selectedSequenceCount} sequences</span>
            <span className="font-mono text-[#aaa599]">{selectedFrameCount.toLocaleString()} frames</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value=""
              disabled={pendingId === "bulk-status"}
              onChange={(event) => {
                if (event.target.value) void bulkSetShotStatus(event.target.value as TaskStatus);
                event.currentTarget.value = "";
              }}
              className="h-8 border border-[#4b432f] bg-[#11110f] px-2 text-xs text-[#f4f1e8] outline-none focus:border-[#d8b46a]"
            >
              <option value="">批量改状态</option>
              {shotMenuStatuses.map((status) => (
                <option key={status} value={status}>
                  {STATUS_COLORS[status].label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => downloadCsv("selected-shot-status-report.csv", buildShotCsvRows(selectedShots))}
              className="h-8 border border-[#4b432f] px-3 text-xs font-semibold text-[#c9c3b5] hover:border-[#d8b46a] hover:text-[#e8c678]"
            >
              Export selected
            </button>
            <button
              type="button"
              onClick={() => downloadXlsx("selected-shot-status-report.xlsx", buildShotCsvRows(selectedShots), "Selected Shots")}
              className="h-8 border border-[#4b432f] px-3 text-xs font-semibold text-[#c9c3b5] hover:border-[#d8b46a] hover:text-[#e8c678]"
            >
              Excel selected
            </button>
            <button
              type="button"
              onClick={() => setSelectedShotIds([])}
              className="h-8 border border-[#4b432f] px-3 text-xs text-[#aaa599] hover:border-[#d8b46a] hover:text-[#f4f1e8]"
            >
              清空选择
            </button>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto border border-[#34322b] bg-[#181713]">
        <div className="grid min-w-[1164px] grid-cols-[44px_92px_1.15fr_120px_96px_repeat(6,minmax(76px,1fr))] border-b border-[#2a2a28] bg-[#1e1e1c] text-[11px] font-medium uppercase tracking-[0.12em] text-[#6e6e69]">
          <div className="flex h-9 items-center justify-center px-2">
            <input
              type="checkbox"
              aria-label="选择当前筛选的镜头"
              checked={allFilteredSelected}
              onChange={(event) => toggleFilteredSelection(event.target.checked)}
              className="size-4 accent-[#d8b46a]"
            />
          </div>
          <HeaderCell>Seq</HeaderCell>
          <HeaderCell>Shot</HeaderCell>
          <HeaderCell>Status</HeaderCell>
          <HeaderCell>Frames</HeaderCell>
          {PIPELINE_STEPS.map((step) => (
            <HeaderCell key={step}>
              <span style={{ color: PIPELINE_COLORS[step] }}>{step}</span>
            </HeaderCell>
          ))}
        </div>

        {filteredShots.length ? Object.entries(groups).map(([sequence, sequenceShots]) => (
          <div key={sequence}>
            <div className="border-b border-[#2a2a28] bg-[#1a1a18] px-3 py-2 text-sm font-medium text-[#9e9d97]">
              ▼ {sequence} ({sequenceShots.length})
            </div>
            {sequenceShots.map((shot) => (
              <ContextMenu.Root key={shot.id}>
                <ContextMenu.Trigger asChild>
                  <div
                    className={[
                      "grid min-h-14 min-w-[1164px] grid-cols-[44px_92px_1.15fr_120px_96px_repeat(6,minmax(76px,1fr))] border-b border-[#2a2a28] text-sm hover:bg-[#252523]",
                      selectedShotIdSet.has(shot.id) ? "outline outline-1 -outline-offset-1 outline-[#d8b46a]/45" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-center px-2">
                      <input
                        type="checkbox"
                        aria-label={`选择镜头 ${shot.code}`}
                        checked={selectedShotIdSet.has(shot.id)}
                        onChange={(event) => toggleShotSelection(shot.id, event.target.checked)}
                        onClick={(event) => event.stopPropagation()}
                        className="size-4 accent-[#d8b46a]"
                      />
                    </div>
                    <div className="flex items-center px-3">
                      <div className="grid h-9 w-16 place-items-center border border-[#34322b] bg-[#11110f] font-mono text-[10px] text-[#7f7a70]">
                        {shot.sequenceCode}
                      </div>
                    </div>
                    <button type="button" onClick={() => setDetailShot(shot)} className="flex min-w-0 flex-col justify-center px-3 text-left">
                      <span className="font-medium text-[#4a9eff] hover:underline">{shot.code}</span>
                      <span className="truncate text-xs text-[#8f8a7e]">{shot.description || "No description"}</span>
                    </button>
                    <div className="flex items-center px-3">
                      <StatusPill status={shot.status} />
                    </div>
                    <div className="flex flex-col justify-center px-3 font-mono text-xs text-[#aaa599]">
                      <span>{shot.cutDuration ?? "--"}</span>
                      <span className="mt-1 text-[10px] text-[#6e6e69]">{shot.cutIn ?? "--"}-{shot.cutOut ?? "--"}</span>
                    </div>
                    {PIPELINE_STEPS.map((step) => {
                      const task = shot.pipeline[step];
                      const status = task?.status ?? "WAITING_TO_START";

                      return (
                        <div key={step} className="flex items-center justify-center px-2">
                          <button
                            type="button"
                            disabled={!task || pendingId === task.id}
                            onClick={() => task && updateTaskStatus(task.id, task.status)}
                            className="grid size-7 place-items-center rounded-sm hover:bg-[#30302c] disabled:cursor-not-allowed"
                            title={task?.assignees.join(", ") || STATUS_COLORS.WAITING_TO_START.label}
                          >
                            <PipelineDot status={status} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </ContextMenu.Trigger>
                <ShotContextMenu
                  shot={shot}
                  onCopy={() => copyShotUrl(shot.id)}
                  onDelete={() => deleteShot(shot.id)}
                  onDuplicate={() => duplicateShot(shot)}
                  onEdit={() => setEditShot(shot)}
                  onOpenReview={() => openInReview(shot)}
                  onPreview={() => setDetailShot(shot)}
                  onSetStatus={(status) => updateShotStatus(shot.id, status)}
                />
              </ContextMenu.Root>
            ))}
          </div>
        )) : (
          <div className="grid min-h-52 place-items-center border-t border-[#2a2a28] text-center">
            <div>
              <p className="text-sm font-semibold text-[#f4f1e8]">没有匹配的镜头</p>
              <p className="mt-2 text-xs text-[#8f8a7e]">调整搜索、序列、状态或风险筛选后再看。</p>
            </div>
          </div>
        )}
      </div>

      {detailShot ? (
        <ShotDetailDialog
          shot={detailShot}
          onClose={() => setDetailShot(null)}
          onEdit={() => {
            setEditShot(detailShot);
            setDetailShot(null);
          }}
        />
      ) : null}

      {editShot ? (
        <ShotEditDialog
          shot={editShot}
          mode="edit"
          pending={pendingId === editShot.id}
          onClose={() => setEditShot(null)}
          onSave={(input) => updateShot(editShot.id, input)}
        />
      ) : null}

      {newShotOpen ? (
        <ShotEditDialog
          shot={createBlankShot()}
          mode="create"
          pending={pendingId === "new-shot"}
          onClose={() => setNewShotOpen(false)}
          onSave={createShot}
        />
      ) : null}
    </div>
  );
}

function ShotContextMenu({
  shot,
  onCopy,
  onDelete,
  onDuplicate,
  onEdit,
  onOpenReview,
  onPreview,
  onSetStatus,
}: {
  shot: ShotTableItem;
  onCopy: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onOpenReview: () => void;
  onPreview: () => void;
  onSetStatus: (status: TaskStatus) => void;
}) {
  const menu = contextMenuLabels[getContextMenuLocale()];

  return (
    <ContextMenu.Portal>
      <ContextMenu.Content className="z-50 min-w-64 border border-[#3b382f] bg-[#181713] p-1 text-sm text-[#d8d3c7] shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <ContextMenu.Label className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">{menu.shot.selected} {shot.code}</ContextMenu.Label>
        <MenuItem onSelect={onEdit}>✎ {menu.shot.edit}</MenuItem>
        <MenuItem onSelect={onDuplicate}>⧉ {menu.shot.duplicate}</MenuItem>
        <MenuItem onSelect={onPreview}>▶ {menu.shot.preview}</MenuItem>
        <MenuItem onSelect={onOpenReview}>⏵ {menu.shot.openReview}</MenuItem>
        <MenuItem onSelect={onCopy}>⌘ {menu.shot.copyUrl}</MenuItem>
        <Separator />
        <ContextMenu.Label className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">{menu.groups.status}</ContextMenu.Label>
        {shotMenuStatuses.map((status) => (
          <MenuItem key={status} onSelect={() => onSetStatus(status)}>
            <span className="mr-2 inline-block size-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[status].dot }} />
            {STATUS_COLORS[status].label}
          </MenuItem>
        ))}
        <Separator />
        <MenuItem danger onSelect={onDelete}>
          {menu.shot.delete}
        </MenuItem>
      </ContextMenu.Content>
    </ContextMenu.Portal>
  );
}

function ShotDetailDialog({ shot, onClose, onEdit }: { shot: ShotTableItem; onClose: () => void; onEdit: () => void }) {
  const doneSteps = PIPELINE_STEPS.filter((step) => {
    const status = shot.pipeline[step]?.status;
    return status === "FINAL" || status === "APPROVED";
  }).length;
  const progress = Math.round((doneSteps / PIPELINE_STEPS.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/62">
      <aside className="flex h-full w-full max-w-2xl flex-col border-l border-[#3d392f] bg-[#181713] shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
        <div className="flex items-start justify-between border-b border-[#34322b] px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Shot detail</p>
            <h2 className="mt-1 truncate text-2xl font-semibold text-[#f4f1e8]">{shot.code}</h2>
            <p className="mt-2 text-sm text-[#8f8a7e]">{shot.sequenceCode} · {STATUS_COLORS[shot.status].label}</p>
          </div>
          <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-[#aaa599] hover:text-[#f4f1e8]">
            关闭
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-5">
          <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            <div className="grid aspect-video place-items-center border border-[#34322b] bg-[#11110f]">
              <div className="text-center">
                <p className="font-mono text-2xl text-[#e8c678]">{shot.sequenceCode}</p>
                <p className="mt-2 text-xs text-[#7f7a70]">{shot.cutDuration ?? "--"} frames</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 border border-[#2f2c25] bg-[#11110f]">
                <DetailMetric label="Progress" value={`${progress}%`} />
                <DetailMetric label="Frames" value={String(shot.cutDuration ?? "--")} />
                <DetailMetric label="Risk" value={isRiskShot(shot) ? "Open" : "Clear"} />
              </div>
              <div className="border border-[#2f2c25] bg-[#11110f] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6e6e69]">Description</p>
                <p className="mt-2 text-sm leading-6 text-[#c9c3b5]">{shot.description || "No description"}</p>
              </div>
            </div>
          </div>

          <section className="mt-4 border border-[#2f2c25] bg-[#11110f]">
            <div className="border-b border-[#2a2a28] px-4 py-3">
              <p className="text-sm font-semibold text-[#f4f1e8]">Pipeline</p>
            </div>
            <div className="grid grid-cols-6">
              {PIPELINE_STEPS.map((step) => {
                const task = shot.pipeline[step];
                const status = task?.status ?? "WAITING_TO_START";
                return (
                  <div key={step} className="border-r border-[#2a2a28] p-3 last:border-r-0">
                    <p className="font-mono text-xs" style={{ color: PIPELINE_COLORS[step] }}>{step}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <PipelineDot status={status} />
                      <span className="truncate text-xs text-[#c9c3b5]">{STATUS_COLORS[status].label}</span>
                    </div>
                    <p className="mt-2 truncate text-[10px] text-[#7f7a70]">{task?.assignees.join(", ") || "Unassigned"}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#34322b] px-5 py-4">
          <button type="button" onClick={onClose} className="h-9 border border-[#3f3c33] px-4 text-sm text-[#c9c3b5]">关闭</button>
          <button type="button" onClick={onEdit} className="h-9 bg-[#378add] px-4 text-sm font-semibold text-white transition hover:bg-[#4a9eff]">编辑镜头</button>
        </div>
      </aside>
    </div>
  );
}

function ShotEditDialog({
  shot,
  mode,
  pending,
  onClose,
  onSave,
}: {
  shot: ShotTableItem;
  mode: "create" | "edit";
  pending: boolean;
  onClose: () => void;
  onSave: (input: ShotInput) => void;
}) {
  const [code, setCode] = useState(shot.code);
  const [sequenceCode, setSequenceCode] = useState(shot.sequenceCode);
  const [status, setStatus] = useState(shot.status);
  const [cutIn, setCutIn] = useState(shot.cutIn?.toString() ?? "");
  const [cutOut, setCutOut] = useState(shot.cutOut?.toString() ?? "");
  const [description, setDescription] = useState(shot.description ?? "");
  const parsedCutIn = parseOptionalInt(cutIn);
  const parsedCutOut = parseOptionalInt(cutOut);
  const canSave = code.trim().length >= 2 && sequenceCode.trim().length >= 1 && parsedCutIn.valid && parsedCutOut.valid;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/62 px-6">
      <div className="w-full max-w-2xl border border-[#3d392f] bg-[#181713] shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-[#34322b] px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">{mode === "create" ? "Shot setup" : "Edit shot"}</p>
            <h2 className="mt-1 text-xl font-semibold text-[#f4f1e8]">{mode === "create" ? "创建镜头" : shot.code}</h2>
          </div>
          <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-[#aaa599] hover:text-[#f4f1e8]">
            关闭
          </button>
        </div>

        <form
          className="grid grid-cols-2 gap-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSave) return;
            onSave({
              code,
              sequenceCode,
              status,
              cutIn: parsedCutIn.value,
              cutOut: parsedCutOut.value,
              description: description.trim() || null,
            });
          }}
        >
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Shot Code</span>
            <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} required className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm uppercase outline-none focus:border-[#d8b46a]" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Sequence</span>
            <input value={sequenceCode} onChange={(event) => setSequenceCode(event.target.value.toUpperCase())} required className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm uppercase outline-none focus:border-[#d8b46a]" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)} className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]">
              {Object.values(TaskStatus).map((shotStatus) => <option key={shotStatus} value={shotStatus}>{STATUS_COLORS[shotStatus].label}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Cut In</span>
              <input value={cutIn} onChange={(event) => setCutIn(event.target.value)} type="number" min={0} className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Cut Out</span>
              <input value={cutOut} onChange={(event) => setCutOut(event.target.value)} type="number" min={0} className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]" />
            </label>
          </div>
          <label className="col-span-2 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">描述</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="w-full resize-none border border-[#34322b] bg-[#11110f] px-3 py-3 text-sm outline-none focus:border-[#d8b46a]" />
          </label>

          {!canSave ? <p className="col-span-2 border border-[#6f5631] bg-[#211b12] px-3 py-2 text-sm text-[#e8c678]">镜头编号、Sequence 必填，帧数必须是整数。</p> : null}

          <div className="col-span-2 flex justify-end gap-2 border-t border-[#34322b] pt-4">
            <button type="button" onClick={onClose} className="h-10 border border-[#3f3c33] px-4 text-sm text-[#c9c3b5]">
              取消
            </button>
            <button type="submit" disabled={pending || !canSave} className="h-10 bg-[#378add] px-5 text-sm font-semibold text-white disabled:opacity-70">
              {pending ? "保存中..." : mode === "create" ? "创建镜头" : "保存镜头"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MenuItem({ children, danger = false, onSelect }: { children: React.ReactNode; danger?: boolean; onSelect?: () => void }) {
  return (
    <ContextMenu.Item
      onSelect={onSelect}
      className={[
        "flex cursor-default items-center px-3 py-2 outline-none hover:bg-[#252523]",
        danger ? "text-[#e24b4a] hover:bg-[#2d1a1a]" : "text-[#d8d3c7]",
      ].join(" ")}
    >
      {children}
    </ContextMenu.Item>
  );
}

function Separator() {
  return <ContextMenu.Separator className="my-1 h-px bg-[#302d26]" />;
}

function HeaderCell({ children }: { children: React.ReactNode }) {
  return <div className="flex h-9 items-center px-3">{children}</div>;
}

function StatusPill({ status }: { status: keyof typeof STATUS_COLORS }) {
  const color = STATUS_COLORS[status];

  return (
    <span className="rounded-sm px-2 py-1 text-xs font-medium" style={{ backgroundColor: color.bg, color: color.text }}>
      {color.label}
    </span>
  );
}

function PipelineDot({ status }: { status: keyof typeof STATUS_COLORS }) {
  const color = STATUS_COLORS[status];
  const isWaiting = status === "WAITING_TO_START";
  const isReady = status === "READY_TO_START";
  const isProgress = status === "IN_PROGRESS";

  return (
    <span
      className="size-3 rounded-full"
      style={{
        backgroundColor: isReady ? "transparent" : color.dot,
        border: isReady ? `1.5px solid ${color.dot}` : "none",
        opacity: isWaiting ? 0.18 : isProgress ? 0.68 : 1,
      }}
    />
  );
}

function SummaryCell({ label, value, tone = "neutral" }: { label: string; value: number; tone?: "neutral" | "good" | "warn" | "bad" }) {
  const color = tone === "good" ? "#83d6ae" : tone === "warn" ? "#e8c678" : tone === "bad" ? "#ff9c8c" : "#f4f1e8";

  return (
    <div className="border-r border-[#2a2a28] px-3 py-3 last:border-r-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6e6e69]">{label}</p>
      <p className="mt-2 font-mono text-2xl" style={{ color }}>{value}</p>
    </div>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-[#2a2a28] p-3 last:border-r-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6e6e69]">{label}</p>
      <p className="mt-2 font-mono text-xl text-[#e8c678]">{value}</p>
    </div>
  );
}

function groupShotsBySequence(shots: ShotTableItem[]) {
  return shots.reduce<Record<string, ShotTableItem[]>>((groups, shot) => {
    groups[shot.sequenceCode] ??= [];
    groups[shot.sequenceCode].push(shot);
    return groups;
  }, {});
}

function getShotSummary(shots: ShotTableItem[]) {
  const riskShots = shots.filter((shot) => isRiskShot(shot));

  return {
    total: shots.length,
    done: shots.filter((shot) => shot.status === "FINAL" || shot.status === "APPROVED").length,
    review: shots.filter((shot) => isReviewShot(shot)).length,
    blocked: shots.filter((shot) => isBlockedShot(shot)).length,
    riskShots,
  };
}

function filterShots(
  shots: ShotTableItem[],
  filters: {
    query: string;
    sequenceFilter: string;
    statusFilter: "ALL" | TaskStatus;
    riskFilter: ShotRiskFilter;
  },
) {
  const search = filters.query.trim().toLowerCase();

  return shots.filter((shot) => {
    const searchText = [
      shot.code,
      shot.sequenceCode,
      shot.description ?? "",
      STATUS_COLORS[shot.status].label,
      ...PIPELINE_STEPS.map((step) => STATUS_COLORS[shot.pipeline[step]?.status ?? "WAITING_TO_START"].label),
    ].join(" ").toLowerCase();
    const matchesSearch = !search || searchText.includes(search);
    const matchesSequence = filters.sequenceFilter === "ALL" || shot.sequenceCode === filters.sequenceFilter;
    const matchesStatus = filters.statusFilter === "ALL" || shot.status === filters.statusFilter;
    const matchesRisk = filters.riskFilter === "ALL"
      || (filters.riskFilter === "NEEDS_REVIEW" && isReviewShot(shot))
      || (filters.riskFilter === "BLOCKED" && isBlockedShot(shot))
      || (filters.riskFilter === "NO_FRAMES" && !shot.cutDuration);

    return matchesSearch && matchesSequence && matchesStatus && matchesRisk;
  });
}

function isRiskShot(shot: ShotTableItem) {
  return isReviewShot(shot) || isBlockedShot(shot) || !shot.cutDuration;
}

function isReviewShot(shot: ShotTableItem) {
  return shot.status === "PENDING_REVIEW" || Object.values(shot.pipeline).some((task) => task?.status === "PENDING_REVIEW");
}

function isBlockedShot(shot: ShotTableItem) {
  return shot.status === "ON_HOLD" || shot.status === "WAITING_TO_START" || Object.values(shot.pipeline).some((task) => task?.status === "ON_HOLD");
}

function getRiskLabel(shot: ShotTableItem) {
  if (isReviewShot(shot)) return "待监制/导演审查";
  if (isBlockedShot(shot)) return "等待启动或存在停滞状态";
  if (!shot.cutDuration) return "缺少 Cut Duration";
  return "风险待确认";
}

function createBlankPipeline(shotId: string): ShotTableItem["pipeline"] {
  return Object.fromEntries(PIPELINE_STEPS.map((step) => [step, {
    id: `${shotId}-${step.toLowerCase()}`,
    name: step,
    status: "WAITING_TO_START" as TaskStatus,
    dueDate: null,
    assignees: [],
  }])) as ShotTableItem["pipeline"];
}

function createBlankShot(): ShotTableItem {
  return {
    id: "new-shot",
    code: "",
    sequenceCode: "RAID",
    status: "WAITING_TO_START",
    description: "",
    cutIn: 1001,
    cutOut: 1101,
    cutDuration: 100,
    pipeline: createBlankPipeline("new-shot"),
  };
}

function normalizeShot(shot: ShotTableItem): ShotTableItem {
  const cutDuration = typeof shot.cutIn === "number" && typeof shot.cutOut === "number" ? Math.max(0, shot.cutOut - shot.cutIn) : null;
  return {
    ...shot,
    code: shot.code.trim().toUpperCase(),
    sequenceCode: shot.sequenceCode.trim().toUpperCase(),
    description: shot.description?.trim() || null,
    cutDuration,
  };
}

function parseOptionalInt(value: string): { valid: boolean; value: number | null } {
  if (!value.trim()) return { valid: true, value: null };
  const parsed = Number(value);
  return { valid: Number.isInteger(parsed) && parsed >= 0, value: Number.isInteger(parsed) && parsed >= 0 ? parsed : null };
}

function buildShotCsvRows(shots: ShotTableItem[]) {
  return [
    ["sequence", "shot", "status", "cut_in", "cut_out", "cut_duration", "description", ...PIPELINE_STEPS.map((step) => `${step}_status`)],
    ...shots.map((shot) => [
      shot.sequenceCode,
      shot.code,
      STATUS_COLORS[shot.status].label,
      shot.cutIn ?? "",
      shot.cutOut ?? "",
      shot.cutDuration ?? "",
      shot.description ?? "",
      ...PIPELINE_STEPS.map((step) => STATUS_COLORS[shot.pipeline[step]?.status ?? "WAITING_TO_START"].label),
    ]),
  ];
}
