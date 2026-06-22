"use client";

import * as ContextMenu from "@radix-ui/react-context-menu";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { AssetType, TaskStatus } from "@/generated/prisma/enums";

import { contextMenuLabels, getContextMenuLocale } from "@/lib/context-menu-i18n";
import { downloadCsv, downloadXlsx } from "@/lib/csv";
import type { AssetTableItem } from "@/lib/asset-data";
import type { ShotTableItem } from "@/lib/shot-data";
import { ASSET_TYPE_LABELS, PIPELINE_COLORS, PIPELINE_STEPS, STATUS_COLORS } from "@/lib/status-colors";

const statusCycle: TaskStatus[] = ["WAITING_TO_START", "READY_TO_START", "IN_PROGRESS", "PENDING_REVIEW", "APPROVED", "FINAL"];
const assetMenuStatuses: TaskStatus[] = ["WAITING_TO_START", "READY_TO_START", "IN_PROGRESS", "PENDING_REVIEW", "FINAL", "ON_HOLD"];
const demoTaskIdPrefix = "demo-";

export function AssetTable({ projectId, assets, shots }: { projectId: string; assets: AssetTableItem[]; shots: Pick<ShotTableItem, "id" | "code" | "sequenceCode">[] }) {
  const router = useRouter();
  const [assetItems, setAssetItems] = useState(assets);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [linkAsset, setLinkAsset] = useState<AssetTableItem | null>(null);
  const [detailAsset, setDetailAsset] = useState<AssetTableItem | null>(null);
  const [editAsset, setEditAsset] = useState<AssetTableItem | null>(null);
  const [newAssetOpen, setNewAssetOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | AssetType>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TaskStatus>("ALL");
  const [riskFilter, setRiskFilter] = useState<"ALL" | "NEEDS_REVIEW" | "BLOCKED" | "NO_SHOTS">("ALL");
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [, startTransition] = useTransition();
  const summary = useMemo(() => getAssetSummary(assetItems), [assetItems]);
  const filteredAssets = useMemo(
    () => filterAssets(assetItems, { query, typeFilter, statusFilter, riskFilter }),
    [assetItems, query, riskFilter, statusFilter, typeFilter],
  );
  const groups = groupAssetsByType(filteredAssets);
  const activeFilterCount = [query.trim(), typeFilter !== "ALL", statusFilter !== "ALL", riskFilter !== "ALL"].filter(Boolean).length;
  const totalAssetCount = assetItems.length;
  const selectedAssetIdSet = useMemo(() => new Set(selectedAssetIds), [selectedAssetIds]);
  const selectedAssets = useMemo(() => assetItems.filter((asset) => selectedAssetIdSet.has(asset.id)), [assetItems, selectedAssetIdSet]);
  const filteredAssetIds = useMemo(() => filteredAssets.map((asset) => asset.id), [filteredAssets]);
  const allFilteredSelected = filteredAssetIds.length > 0 && filteredAssetIds.every((id) => selectedAssetIdSet.has(id));
  const selectedLinkedShotCount = new Set(selectedAssets.flatMap((asset) => asset.linkedShots.map((shot) => shot.id))).size;
  const selectedTypeCount = new Set(selectedAssets.map((asset) => asset.type)).size;

  function patchLocalAsset(assetId: string, patch: Partial<AssetTableItem>) {
    setAssetItems((current) => current.map((asset) => asset.id === assetId ? { ...asset, ...patch } : asset));
    setLinkAsset((current) => current?.id === assetId ? { ...current, ...patch } : current);
    setDetailAsset((current) => current?.id === assetId ? { ...current, ...patch } : current);
    setEditAsset((current) => current?.id === assetId ? { ...current, ...patch } : current);
  }

  function patchLocalTask(taskId: string, status: TaskStatus) {
    const updatePipeline = (asset: AssetTableItem): AssetTableItem => ({
      ...asset,
      pipeline: Object.fromEntries(Object.entries(asset.pipeline).map(([step, task]) => [step, task?.id === taskId ? { ...task, status } : task])) as AssetTableItem["pipeline"],
    });
    setAssetItems((current) => current.map(updatePipeline));
    setDetailAsset((current) => current ? updatePipeline(current) : current);
    setEditAsset((current) => current ? updatePipeline(current) : current);
    setLinkAsset((current) => current ? updatePipeline(current) : current);
  }

  async function updateTaskStatus(taskId: string, currentStatus: TaskStatus) {
    const nextStatus = statusCycle[(statusCycle.indexOf(currentStatus) + 1) % statusCycle.length];
    setPendingId(taskId);
    setMessage(null);

    if (taskId.startsWith(demoTaskIdPrefix)) {
      patchLocalTask(taskId, nextStatus);
      setPendingId(null);
      setMessage("演示资产任务状态已更新。");
      return;
    }

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("更新资产任务状态失败。");
      return;
    }

    startTransition(() => router.refresh());
  }

  async function updateAssetStatus(assetId: string, status: TaskStatus) {
    setPendingId(assetId);
    setMessage(null);

    if (assetId.startsWith(demoTaskIdPrefix)) {
      patchLocalAsset(assetId, { status });
      setPendingId(null);
      setMessage("演示资产状态已更新。");
      return;
    }

    const response = await fetch(`/api/assets/${assetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("更新资产状态失败。");
      return;
    }

    startTransition(() => router.refresh());
  }

  function toggleAssetSelection(assetId: string, selected: boolean) {
    setSelectedAssetIds((current) => {
      if (selected) return current.includes(assetId) ? current : [...current, assetId];
      return current.filter((id) => id !== assetId);
    });
  }

  function toggleFilteredSelection(selected: boolean) {
    setSelectedAssetIds((current) => {
      if (!selected) return current.filter((id) => !filteredAssetIds.includes(id));
      const next = new Set(current);
      for (const id of filteredAssetIds) next.add(id);
      return Array.from(next);
    });
  }

  async function bulkSetAssetStatus(status: TaskStatus) {
    if (selectedAssetIds.length === 0) return;

    const assetIds = [...selectedAssetIds];
    const realAssetIds = assetIds.filter((assetId) => !assetId.startsWith(demoTaskIdPrefix));
    setPendingId("bulk-status");
    setMessage(null);

    if (realAssetIds.length) {
      const responses = await Promise.all(
        realAssetIds.map((assetId) =>
          fetch(`/api/assets/${assetId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          }),
        ),
      );

      if (responses.some((response) => !response.ok)) {
        setPendingId(null);
        setMessage("批量更新资产状态失败，请检查权限或资产状态。");
        return;
      }
    }

    const patchSelectedAsset = (asset: AssetTableItem) => (assetIds.includes(asset.id) ? { ...asset, status } : asset);
    setAssetItems((current) => current.map(patchSelectedAsset));
    setLinkAsset((current) => (current ? patchSelectedAsset(current) : current));
    setDetailAsset((current) => (current ? patchSelectedAsset(current) : current));
    setEditAsset((current) => (current ? patchSelectedAsset(current) : current));
    setPendingId(null);
    setSelectedAssetIds([]);
    setMessage(`已更新 ${assetIds.length} 个资产。`);

    if (realAssetIds.length) {
      startTransition(() => router.refresh());
    }
  }

  async function updateAsset(assetId: string, input: Pick<AssetTableItem, "name" | "type" | "status" | "description" | "thumbnailUrl">) {
    setPendingId(assetId);
    setMessage(null);

    if (assetId.startsWith(demoTaskIdPrefix)) {
      patchLocalAsset(assetId, input);
      setPendingId(null);
      setEditAsset(null);
      setMessage("演示资产信息已更新。");
      return;
    }

    const response = await fetch(`/api/assets/${assetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("更新资产信息失败。");
      return;
    }

    patchLocalAsset(assetId, input);
    setEditAsset(null);
    startTransition(() => router.refresh());
  }

  async function deleteAsset(assetId: string) {
    setPendingId(assetId);
    setMessage(null);

    if (assetId.startsWith(demoTaskIdPrefix)) {
      setAssetItems((current) => current.filter((asset) => asset.id !== assetId));
      setDetailAsset((current) => current?.id === assetId ? null : current);
      setEditAsset((current) => current?.id === assetId ? null : current);
      setSelectedAssetIds((current) => current.filter((id) => id !== assetId));
      setPendingId(null);
      setMessage("演示资产已删除。");
      return;
    }

    const response = await fetch(`/api/assets/${assetId}`, {
      method: "DELETE",
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("删除资产失败。");
      return;
    }

    setSelectedAssetIds((current) => current.filter((id) => id !== assetId));
    startTransition(() => router.refresh());
  }

  async function linkShot(assetId: string, shotId: string) {
    setPendingId(`${assetId}:${shotId}`);
    setMessage(null);

    if (assetId.startsWith(demoTaskIdPrefix)) {
      const shot = shots.find((item) => item.id === shotId);
      if (shot) {
        const target = assetItems.find((asset) => asset.id === assetId);
        const linkedShots = target?.linkedShots.some((item) => item.id === shot.id) ? target.linkedShots : [...(target?.linkedShots ?? []), { id: shot.id, code: shot.code }];
        patchLocalAsset(assetId, { linkedShots });
      }
      setPendingId(null);
      setLinkAsset(null);
      setMessage("演示资产已关联镜头。");
      return;
    }

    const response = await fetch(`/api/assets/${assetId}/link-shot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shotId }),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("关联镜头失败。");
      return;
    }

    setLinkAsset(null);
    startTransition(() => router.refresh());
  }

  async function unlinkShot(assetId: string, shotId: string) {
    setPendingId(`${assetId}:${shotId}`);
    setMessage(null);

    if (assetId.startsWith(demoTaskIdPrefix)) {
      const target = assetItems.find((asset) => asset.id === assetId);
      patchLocalAsset(assetId, { linkedShots: (target?.linkedShots ?? []).filter((shot) => shot.id !== shotId) });
      setPendingId(null);
      setMessage("演示资产已移除镜头关联。");
      return;
    }

    const response = await fetch(`/api/assets/${assetId}/link-shot/${shotId}`, {
      method: "DELETE",
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("移除镜头关联失败。");
      return;
    }

    startTransition(() => router.refresh());
  }

  async function copyAssetUrl(assetId: string) {
    const url = `${window.location.origin}/app/assets/${assetId}`;
    await navigator.clipboard.writeText(url).catch(() => undefined);
    setMessage("Asset URL 已复制。");
  }

  async function createAsset(input: Pick<AssetTableItem, "name" | "type" | "status" | "description" | "thumbnailUrl">) {
    setPendingId("new-asset");
    setMessage(null);

    if (projectId === "demo-mkali-mission") {
      setAssetItems((current) => {
        const baseId = `demo-asset-${input.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-") || "new-asset"}`;
        let copyIndex = current.some((item) => item.id === baseId) ? 1 : 0;
        while (copyIndex > 0 && current.some((item) => item.id === `${baseId}-${copyIndex}`)) copyIndex += 1;
        const id = copyIndex > 0 ? `${baseId}-${copyIndex}` : baseId;
        const asset: AssetTableItem = {
          id,
          name: input.name,
          type: input.type,
          status: input.status,
          description: input.description,
          thumbnailUrl: input.thumbnailUrl,
          linkedShots: [],
          pipeline: Object.fromEntries(PIPELINE_STEPS.map((step) => [step, {
            id: `${id}-${step.toLowerCase()}`,
            name: step,
            status: "WAITING_TO_START" as TaskStatus,
          }])) as AssetTableItem["pipeline"],
        };
        return [asset, ...current];
      });
      setPendingId(null);
      setNewAssetOpen(false);
      setMessage("演示资产已创建。");
      return;
    }

    const response = await fetch(`/api/projects/${projectId}/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: input.name,
        type: input.type,
        description: input.description ?? "",
        thumbnailUrl: input.thumbnailUrl ?? "",
      }),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("创建资产失败。");
      return;
    }

    setNewAssetOpen(false);
    setMessage("资产已创建。");
    startTransition(() => router.refresh());
  }

  async function duplicateAsset(asset: AssetTableItem) {
    setPendingId(asset.id);
    setMessage(null);
    const name = `${asset.name} Copy`;

    if (asset.id.startsWith(demoTaskIdPrefix)) {
      setAssetItems((current) => {
        const baseId = `${asset.id}-copy`;
        let copyIndex = current.filter((item) => item.id.startsWith(baseId)).length + 1;
        while (current.some((item) => item.id === `${baseId}-${copyIndex}`)) copyIndex += 1;
        const copyId = `${baseId}-${copyIndex}`;
        const copy: AssetTableItem = {
          ...asset,
          id: copyId,
          name,
          status: "WAITING_TO_START",
          pipeline: Object.fromEntries(PIPELINE_STEPS.map((step) => [step, {
            id: `${copyId}-${step.toLowerCase()}`,
            name: step,
            status: "WAITING_TO_START" as TaskStatus,
          }])) as AssetTableItem["pipeline"],
        };
        return [copy, ...current];
      });
      setPendingId(null);
      setMessage("演示资产已复制。");
      return;
    }

    const response = await fetch(`/api/projects/${projectId}/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type: asset.type,
        description: asset.description ?? "",
        thumbnailUrl: asset.thumbnailUrl ?? "",
      }),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("复制资产失败。");
      return;
    }

    setMessage("资产已复制。");
    startTransition(() => router.refresh());
  }

  if (assetItems.length === 0) {
    return (
      <div className="grid min-h-72 place-items-center border border-dashed border-[#3f3c33] bg-[#181713] p-10 text-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">No assets</p>
          <h2 className="mt-3 text-2xl font-semibold">还没有资产</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#aaa599]">创建资产后，会按类型分组，并显示关联镜头和流水线状态。</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {message ? <div className="mb-3 border border-[#3f3c33] bg-[#181713] px-3 py-2 text-sm text-[#d8b46a]">{message}</div> : null}

      <div className="mb-3 grid gap-3 xl:grid-cols-[1fr_340px]">
        <section className="border border-[#34322b] bg-[#181713]">
          <div className="grid grid-cols-4 border-b border-[#2a2a28]">
            <SummaryCell label="Assets" value={summary.total} />
            <SummaryCell label="Final / Approved" value={summary.done} tone="good" />
            <SummaryCell label="Review queue" value={summary.review} tone="warn" />
            <SummaryCell label="Blocked" value={summary.blocked} tone="bad" />
          </div>
          <div className="grid gap-2 p-3 lg:grid-cols-[minmax(220px,1fr)_150px_170px_170px_auto]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索资产、描述、镜头号"
              className="h-9 border border-[#34322b] bg-[#11110f] px-3 text-sm text-[#f4f1e8] outline-none placeholder:text-[#6e6e69] focus:border-[#d8b46a]"
            />
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as "ALL" | AssetType)} className="h-9 border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#c9c3b5] outline-none focus:border-[#d8b46a]">
              <option value="ALL">全部类型</option>
              {Object.values(AssetType).map((type) => <option key={type} value={type}>{ASSET_TYPE_LABELS[type]}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "ALL" | TaskStatus)} className="h-9 border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#c9c3b5] outline-none focus:border-[#d8b46a]">
              <option value="ALL">全部状态</option>
              {Object.values(TaskStatus).map((status) => <option key={status} value={status}>{STATUS_COLORS[status].label}</option>)}
            </select>
            <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value as "ALL" | "NEEDS_REVIEW" | "BLOCKED" | "NO_SHOTS")} className="h-9 border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#c9c3b5] outline-none focus:border-[#d8b46a]">
              <option value="ALL">全部风险</option>
              <option value="NEEDS_REVIEW">待审查</option>
              <option value="BLOCKED">停滞 / 等待</option>
              <option value="NO_SHOTS">无镜头关联</option>
            </select>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNewAssetOpen(true)}
                className="h-9 bg-[#378add] px-3 text-xs font-semibold text-white transition hover:bg-[#4a9eff]"
              >
                Add Asset
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setTypeFilter("ALL");
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
                onClick={() => downloadCsv("asset-status-report.csv", buildAssetCsvRows(filteredAssets))}
                className="h-9 border border-[#34322b] px-3 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
              >
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => downloadXlsx("asset-status-report.xlsx", buildAssetCsvRows(filteredAssets), "Assets")}
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
            <span className="font-mono text-[11px] text-[#7f7a70]">{filteredAssets.length}/{totalAssetCount}</span>
          </div>
          <div className="mt-3 space-y-2">
            {summary.riskAssets.length ? summary.riskAssets.slice(0, 3).map((asset) => (
              <button key={asset.id} type="button" onClick={() => setQuery(asset.name)} className="block w-full border border-[#2f2c25] bg-[#11110f] px-3 py-2 text-left hover:border-[#d8b46a]/60">
                <span className="block truncate text-sm font-medium text-[#f4f1e8]">{asset.name}</span>
                <span className="mt-1 block truncate text-xs text-[#8f8a7e]">{getRiskLabel(asset)}</span>
              </button>
            )) : <p className="border border-dashed border-[#34322b] px-3 py-4 text-sm text-[#8f8a7e]">当前没有明显资产风险。</p>}
          </div>
        </aside>
      </div>

      {selectedAssets.length ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border border-[#4b432f] bg-[#1f1b12] px-3 py-2 text-sm">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#c9c3b5]">
            <span className="font-semibold uppercase tracking-[0.16em] text-[#e8c678]">{selectedAssets.length} selected</span>
            <span className="font-mono">{selectedTypeCount} types</span>
            <span className="font-mono text-[#aaa599]">{selectedLinkedShotCount} linked shots</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value=""
              disabled={pendingId === "bulk-status"}
              onChange={(event) => {
                if (event.target.value) void bulkSetAssetStatus(event.target.value as TaskStatus);
                event.currentTarget.value = "";
              }}
              className="h-8 border border-[#4b432f] bg-[#11110f] px-2 text-xs text-[#f4f1e8] outline-none focus:border-[#d8b46a]"
            >
              <option value="">批量改状态</option>
              {assetMenuStatuses.map((status) => (
                <option key={status} value={status}>
                  {STATUS_COLORS[status].label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => downloadCsv("selected-asset-status-report.csv", buildAssetCsvRows(selectedAssets))}
              className="h-8 border border-[#4b432f] px-3 text-xs font-semibold text-[#c9c3b5] hover:border-[#d8b46a] hover:text-[#e8c678]"
            >
              Export selected
            </button>
            <button
              type="button"
              onClick={() => downloadXlsx("selected-asset-status-report.xlsx", buildAssetCsvRows(selectedAssets), "Selected Assets")}
              className="h-8 border border-[#4b432f] px-3 text-xs font-semibold text-[#c9c3b5] hover:border-[#d8b46a] hover:text-[#e8c678]"
            >
              Excel selected
            </button>
            <button
              type="button"
              onClick={() => setSelectedAssetIds([])}
              className="h-8 border border-[#4b432f] px-3 text-xs text-[#aaa599] hover:border-[#d8b46a] hover:text-[#f4f1e8]"
            >
              清空选择
            </button>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto border border-[#34322b] bg-[#181713]">
        <div className="grid min-w-[1204px] grid-cols-[44px_110px_1.15fr_120px_180px_repeat(6,minmax(76px,1fr))] border-b border-[#2a2a28] bg-[#1e1e1c] text-[11px] font-medium uppercase tracking-[0.12em] text-[#6e6e69]">
          <div className="flex h-9 items-center justify-center px-2">
            <input
              type="checkbox"
              aria-label="选择当前筛选的资产"
              checked={allFilteredSelected}
              onChange={(event) => toggleFilteredSelection(event.target.checked)}
              className="size-4 accent-[#d8b46a]"
            />
          </div>
          <HeaderCell>Preview</HeaderCell>
          <HeaderCell>Asset</HeaderCell>
          <HeaderCell>Status</HeaderCell>
          <HeaderCell>Shots</HeaderCell>
          {PIPELINE_STEPS.map((step) => (
            <HeaderCell key={step}>
              <span style={{ color: PIPELINE_COLORS[step] }}>{step}</span>
            </HeaderCell>
          ))}
        </div>

        {filteredAssets.length ? Object.entries(groups).map(([type, typeAssets]) => (
          <div key={type}>
            <div className="border-b border-[#2a2a28] bg-[#1a1a18] px-3 py-2 text-sm font-medium text-[#9e9d97]">
              ▼ {ASSET_TYPE_LABELS[type as keyof typeof ASSET_TYPE_LABELS]} ({typeAssets.length})
            </div>
            {typeAssets.map((asset) => (
              <ContextMenu.Root key={asset.id}>
                <ContextMenu.Trigger asChild>
                  <div
                    className={[
                      "grid min-h-20 min-w-[1204px] grid-cols-[44px_110px_1.15fr_120px_180px_repeat(6,minmax(76px,1fr))] border-b border-[#2a2a28] text-sm hover:bg-[#252523]",
                      selectedAssetIdSet.has(asset.id) ? "outline outline-1 -outline-offset-1 outline-[#d8b46a]/45" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-center px-2">
                      <input
                        type="checkbox"
                        aria-label={`选择资产 ${asset.name}`}
                        checked={selectedAssetIdSet.has(asset.id)}
                        onChange={(event) => toggleAssetSelection(asset.id, event.target.checked)}
                        onClick={(event) => event.stopPropagation()}
                        className="size-4 accent-[#d8b46a]"
                      />
                    </div>
                    <div className="flex items-center px-3">
                      <div className="relative grid h-14 w-[90px] place-items-center overflow-hidden border border-[#34322b] bg-[#11110f]">
                        {asset.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={asset.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="font-mono text-[10px] text-[#7f7a70]">{asset.type.slice(0, 3)}</span>
                        )}
                        <span className="absolute bottom-1 right-1 grid size-4 place-items-center bg-black/60 text-[9px] text-white">▶</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => setDetailAsset(asset)} className="flex min-w-0 flex-col justify-center px-3 text-left">
                      <span className="font-medium text-[#4a9eff] hover:underline">{asset.name}</span>
                      <span className="truncate text-xs text-[#8f8a7e]">{asset.description || "No description"}</span>
                    </button>
                    <div className="flex items-center px-3">
                      <StatusPill status={asset.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-1 px-3">
                      {asset.linkedShots.length ? (
                        asset.linkedShots.map((shot) => (
                          <button
                            key={shot.id}
                            type="button"
                            onClick={() => unlinkShot(asset.id, shot.id)}
                            className="border border-[#34322b] bg-[#11110f] px-2 py-1 font-mono text-[11px] text-[#c9c3b5] hover:border-[#e24b4a] hover:text-[#e24b4a]"
                            title="点击移除关联"
                          >
                            {shot.code}
                          </button>
                        ))
                      ) : (
                        <span className="text-xs text-[#7f7a70]">No linked shots</span>
                      )}
                    </div>
                    {PIPELINE_STEPS.map((step) => {
                      const task = asset.pipeline[step];
                      const status = task?.status ?? "WAITING_TO_START";

                      return (
                        <div key={step} className="flex items-center justify-center px-2">
                          <button
                            type="button"
                            disabled={!task || pendingId === task.id}
                            onClick={() => task && updateTaskStatus(task.id, task.status)}
                            className="grid size-7 place-items-center rounded-sm hover:bg-[#30302c] disabled:cursor-not-allowed"
                          >
                            <PipelineDot status={status} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </ContextMenu.Trigger>
                <AssetContextMenu
                  asset={asset}
                  onCopy={() => copyAssetUrl(asset.id)}
                  onDelete={() => deleteAsset(asset.id)}
                  onDuplicate={() => duplicateAsset(asset)}
                  onEdit={() => setEditAsset(asset)}
                  onLink={() => setLinkAsset(asset)}
                  onPreview={() => setDetailAsset(asset)}
                  onSetStatus={(status) => updateAssetStatus(asset.id, status)}
                />
              </ContextMenu.Root>
            ))}
          </div>
        )) : (
          <div className="grid min-h-52 place-items-center border-t border-[#2a2a28] text-center">
            <div>
              <p className="text-sm font-semibold text-[#f4f1e8]">没有匹配的资产</p>
              <p className="mt-2 text-xs text-[#8f8a7e]">调整搜索、类型、状态或风险筛选后再看。</p>
            </div>
          </div>
        )}
      </div>

      {linkAsset ? (
        <LinkShotDialog
          asset={linkAsset}
          shots={shots}
          pendingId={pendingId}
          onClose={() => setLinkAsset(null)}
          onLink={(shotId) => linkShot(linkAsset.id, shotId)}
        />
      ) : null}

      {detailAsset ? (
        <AssetDetailDialog
          asset={detailAsset}
          onClose={() => setDetailAsset(null)}
          onEdit={() => {
            setEditAsset(detailAsset);
            setDetailAsset(null);
          }}
        />
      ) : null}

      {editAsset ? (
        <AssetEditDialog
          asset={editAsset}
          mode="edit"
          pending={pendingId === editAsset.id}
          onClose={() => setEditAsset(null)}
          onSave={(input) => updateAsset(editAsset.id, input)}
        />
      ) : null}

      {newAssetOpen ? (
        <AssetEditDialog
          asset={createBlankAsset()}
          mode="create"
          pending={pendingId === "new-asset"}
          onClose={() => setNewAssetOpen(false)}
          onSave={createAsset}
        />
      ) : null}
    </div>
  );
}

function AssetContextMenu({
  asset,
  onCopy,
  onDelete,
  onDuplicate,
  onEdit,
  onLink,
  onPreview,
  onSetStatus,
}: {
  asset: AssetTableItem;
  onCopy: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onLink: () => void;
  onPreview: () => void;
  onSetStatus: (status: TaskStatus) => void;
}) {
  const menu = contextMenuLabels[getContextMenuLocale()];

  return (
    <ContextMenu.Portal>
      <ContextMenu.Content className="z-50 min-w-64 border border-[#3b382f] bg-[#181713] p-1 text-sm text-[#d8d3c7] shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <ContextMenu.Label className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">{asset.name}</ContextMenu.Label>
        <MenuItem onSelect={onEdit}>✎ {menu.asset.edit}</MenuItem>
        <MenuItem onSelect={onDuplicate}>⧉ {menu.asset.duplicate}</MenuItem>
        <MenuItem onSelect={onPreview}>▶ {menu.asset.preview}</MenuItem>
        <MenuItem onSelect={onCopy}>⌘ {menu.asset.copyUrl}</MenuItem>
        <Separator />
        <ContextMenu.Label className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">{menu.groups.status}</ContextMenu.Label>
        {assetMenuStatuses.map((status) => (
          <MenuItem key={status} onSelect={() => onSetStatus(status)}>
            <span className="mr-2 inline-block size-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[status].dot }} />
            {STATUS_COLORS[status].label}
          </MenuItem>
        ))}
        <Separator />
        <MenuItem onSelect={onLink}>↔ {menu.asset.linkShot}</MenuItem>
        <Separator />
        <MenuItem danger onSelect={onDelete}>
          {menu.asset.delete}
        </MenuItem>
      </ContextMenu.Content>
    </ContextMenu.Portal>
  );
}

function LinkShotDialog({
  asset,
  shots,
  pendingId,
  onClose,
  onLink,
}: {
  asset: AssetTableItem;
  shots: Pick<ShotTableItem, "id" | "code" | "sequenceCode">[];
  pendingId: string | null;
  onClose: () => void;
  onLink: (shotId: string) => void;
}) {
  const linkedIds = new Set(asset.linkedShots.map((shot) => shot.id));

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/62 px-6">
      <div className="w-full max-w-xl border border-[#3d392f] bg-[#181713] shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-[#34322b] px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Link shot</p>
            <h2 className="mt-1 text-xl font-semibold text-[#f4f1e8]">{asset.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-[#aaa599] hover:text-[#f4f1e8]">
            关闭
          </button>
        </div>

        <div className="max-h-96 overflow-auto p-3">
          {shots.length ? (
            shots.map((shot) => {
              const linked = linkedIds.has(shot.id);

              return (
                <button
                  key={shot.id}
                  type="button"
                  disabled={linked || pendingId === `${asset.id}:${shot.id}`}
                  onClick={() => onLink(shot.id)}
                  className="mb-2 grid w-full grid-cols-[90px_1fr_auto] items-center border border-[#302d26] bg-[#11110f] px-3 py-3 text-left text-sm disabled:opacity-55"
                >
                  <span className="font-mono text-xs text-[#8f8a7e]">{shot.sequenceCode}</span>
                  <span className="font-medium text-[#4a9eff]">{shot.code}</span>
                  <span className="text-xs text-[#aaa599]">{linked ? "已关联" : "关联"}</span>
                </button>
              );
            })
          ) : (
            <div className="grid min-h-40 place-items-center border border-dashed border-[#3f3c33] text-sm text-[#aaa599]">还没有可关联的镜头。</div>
          )}
        </div>
      </div>
    </div>
  );
}

function AssetDetailDialog({ asset, onClose, onEdit }: { asset: AssetTableItem; onClose: () => void; onEdit: () => void }) {
  const doneSteps = PIPELINE_STEPS.filter((step) => {
    const status = asset.pipeline[step]?.status;
    return status === "FINAL" || status === "APPROVED";
  }).length;
  const progress = Math.round((doneSteps / PIPELINE_STEPS.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/62">
      <aside className="flex h-full w-full max-w-2xl flex-col border-l border-[#3d392f] bg-[#181713] shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
        <div className="flex items-start justify-between border-b border-[#34322b] px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Asset detail</p>
            <h2 className="mt-1 truncate text-2xl font-semibold text-[#f4f1e8]">{asset.name}</h2>
            <p className="mt-2 text-sm text-[#8f8a7e]">{ASSET_TYPE_LABELS[asset.type]} · {STATUS_COLORS[asset.status].label}</p>
          </div>
          <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-[#aaa599] hover:text-[#f4f1e8]">
            关闭
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-5">
          <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            <div className="relative grid aspect-video place-items-center overflow-hidden border border-[#34322b] bg-[#11110f]">
              {asset.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="font-mono text-sm text-[#7f7a70]">{asset.type}</span>
              )}
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 border border-[#2f2c25] bg-[#11110f]">
                <DetailMetric label="Progress" value={`${progress}%`} />
                <DetailMetric label="Shots" value={asset.linkedShots.length.toString()} />
                <DetailMetric label="Risk" value={isRiskAsset(asset) ? "Open" : "Clear"} />
              </div>
              <div className="border border-[#2f2c25] bg-[#11110f] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6e6e69]">Description</p>
                <p className="mt-2 text-sm leading-6 text-[#c9c3b5]">{asset.description || "No description"}</p>
              </div>
            </div>
          </div>

          <section className="mt-4 border border-[#2f2c25] bg-[#11110f]">
            <div className="border-b border-[#2a2a28] px-4 py-3">
              <p className="text-sm font-semibold text-[#f4f1e8]">Pipeline</p>
            </div>
            <div className="grid grid-cols-6">
              {PIPELINE_STEPS.map((step) => {
                const status = asset.pipeline[step]?.status ?? "WAITING_TO_START";
                return (
                  <div key={step} className="border-r border-[#2a2a28] p-3 last:border-r-0">
                    <p className="font-mono text-xs" style={{ color: PIPELINE_COLORS[step] }}>{step}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <PipelineDot status={status} />
                      <span className="truncate text-xs text-[#c9c3b5]">{STATUS_COLORS[status].label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-4 border border-[#2f2c25] bg-[#11110f] p-4">
            <p className="text-sm font-semibold text-[#f4f1e8]">Linked shots</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {asset.linkedShots.length ? asset.linkedShots.map((shot) => (
                <span key={shot.id} className="border border-[#34322b] px-2 py-1 font-mono text-xs text-[#c9c3b5]">{shot.code}</span>
              )) : <span className="text-sm text-[#8f8a7e]">No linked shots</span>}
            </div>
          </section>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#34322b] px-5 py-4">
          <button type="button" onClick={onClose} className="h-9 border border-[#3f3c33] px-4 text-sm text-[#c9c3b5]">关闭</button>
          <button type="button" onClick={onEdit} className="h-9 bg-[#378add] px-4 text-sm font-semibold text-white transition hover:bg-[#4a9eff]">编辑资产</button>
        </div>
      </aside>
    </div>
  );
}

function AssetEditDialog({
  asset,
  mode,
  pending,
  onClose,
  onSave,
}: {
  asset: AssetTableItem;
  mode: "create" | "edit";
  pending: boolean;
  onClose: () => void;
  onSave: (input: Pick<AssetTableItem, "name" | "type" | "status" | "description" | "thumbnailUrl">) => void;
}) {
  const [name, setName] = useState(asset.name);
  const [type, setType] = useState(asset.type);
  const [status, setStatus] = useState(asset.status);
  const [description, setDescription] = useState(asset.description ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(asset.thumbnailUrl ?? "");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/62 px-6">
      <div className="w-full max-w-2xl border border-[#3d392f] bg-[#181713] shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-[#34322b] px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">{mode === "create" ? "Asset setup" : "Edit asset"}</p>
            <h2 className="mt-1 text-xl font-semibold text-[#f4f1e8]">{mode === "create" ? "创建资产" : asset.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-[#aaa599] hover:text-[#f4f1e8]">
            关闭
          </button>
        </div>

        <form
          className="grid grid-cols-2 gap-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            onSave({
              name,
              type,
              status,
              description: description.trim() || null,
              thumbnailUrl: thumbnailUrl.trim() || null,
            });
          }}
        >
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Asset Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} required className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Type</span>
            <select value={type} onChange={(event) => setType(event.target.value as AssetType)} className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]">
              {Object.values(AssetType).map((assetType) => <option key={assetType} value={assetType}>{ASSET_TYPE_LABELS[assetType]}</option>)}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)} className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]">
              {Object.values(TaskStatus).map((assetStatus) => <option key={assetStatus} value={assetStatus}>{STATUS_COLORS[assetStatus].label}</option>)}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Thumbnail URL</span>
            <input value={thumbnailUrl} onChange={(event) => setThumbnailUrl(event.target.value)} className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]" />
          </label>
          <label className="col-span-2 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">描述</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="w-full resize-none border border-[#34322b] bg-[#11110f] px-3 py-3 text-sm outline-none focus:border-[#d8b46a]" />
          </label>

          <div className="col-span-2 flex justify-end gap-2 border-t border-[#34322b] pt-4">
            <button type="button" onClick={onClose} className="h-10 border border-[#3f3c33] px-4 text-sm text-[#c9c3b5]">
              取消
            </button>
            <button type="submit" disabled={pending || name.trim().length < 2} className="h-10 bg-[#378add] px-5 text-sm font-semibold text-white disabled:opacity-70">
              {pending ? "保存中..." : mode === "create" ? "创建资产" : "保存资产"}
            </button>
          </div>
        </form>
      </div>
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

function createBlankAsset(): AssetTableItem {
  return {
    id: "new-asset",
    name: "",
    type: "PROP",
    status: "WAITING_TO_START",
    description: "",
    thumbnailUrl: null,
    linkedShots: [],
    pipeline: Object.fromEntries(PIPELINE_STEPS.map((step) => [step, null])) as AssetTableItem["pipeline"],
  };
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

function groupAssetsByType(assets: AssetTableItem[]) {
  return assets.reduce<Record<string, AssetTableItem[]>>((groups, asset) => {
    groups[asset.type] ??= [];
    groups[asset.type].push(asset);
    return groups;
  }, {});
}

function getAssetSummary(assets: AssetTableItem[]) {
  const riskAssets = assets.filter((asset) => isRiskAsset(asset));

  return {
    total: assets.length,
    done: assets.filter((asset) => asset.status === "FINAL" || asset.status === "APPROVED").length,
    review: assets.filter((asset) => asset.status === "PENDING_REVIEW" || Object.values(asset.pipeline).some((task) => task?.status === "PENDING_REVIEW")).length,
    blocked: assets.filter((asset) => asset.status === "ON_HOLD" || asset.status === "WAITING_TO_START" || Object.values(asset.pipeline).some((task) => task?.status === "ON_HOLD")).length,
    riskAssets,
  };
}

function filterAssets(
  assets: AssetTableItem[],
  filters: {
    query: string;
    typeFilter: "ALL" | AssetType;
    statusFilter: "ALL" | TaskStatus;
    riskFilter: "ALL" | "NEEDS_REVIEW" | "BLOCKED" | "NO_SHOTS";
  },
) {
  const search = filters.query.trim().toLowerCase();

  return assets.filter((asset) => {
    const searchText = [
      asset.name,
      asset.description ?? "",
      ASSET_TYPE_LABELS[asset.type],
      STATUS_COLORS[asset.status].label,
      ...asset.linkedShots.map((shot) => shot.code),
    ].join(" ").toLowerCase();
    const matchesSearch = !search || searchText.includes(search);
    const matchesType = filters.typeFilter === "ALL" || asset.type === filters.typeFilter;
    const matchesStatus = filters.statusFilter === "ALL" || asset.status === filters.statusFilter;
    const matchesRisk = filters.riskFilter === "ALL"
      || (filters.riskFilter === "NEEDS_REVIEW" && isReviewAsset(asset))
      || (filters.riskFilter === "BLOCKED" && isBlockedAsset(asset))
      || (filters.riskFilter === "NO_SHOTS" && asset.linkedShots.length === 0);

    return matchesSearch && matchesType && matchesStatus && matchesRisk;
  });
}

function isRiskAsset(asset: AssetTableItem) {
  return isReviewAsset(asset) || isBlockedAsset(asset) || asset.linkedShots.length === 0;
}

function isReviewAsset(asset: AssetTableItem) {
  return asset.status === "PENDING_REVIEW" || Object.values(asset.pipeline).some((task) => task?.status === "PENDING_REVIEW");
}

function isBlockedAsset(asset: AssetTableItem) {
  return asset.status === "ON_HOLD"
    || asset.status === "WAITING_TO_START"
    || Object.values(asset.pipeline).some((task) => task?.status === "ON_HOLD" || task?.status === "WAITING_TO_START");
}

function getRiskLabel(asset: AssetTableItem) {
  if (asset.linkedShots.length === 0) return "无镜头关联，无法进入镜头排期。";
  if (isReviewAsset(asset)) return "待审查版本，需要导演/监制确认。";
  if (isBlockedAsset(asset)) return "存在等待或停滞状态，需要制片跟进。";
  return "可正常推进。";
}

function buildAssetCsvRows(assets: AssetTableItem[]) {
  return [
    ["type", "asset", "status", "linked_shots", "description", ...PIPELINE_STEPS.map((step) => `${step}_status`)],
    ...assets.map((asset) => [
      ASSET_TYPE_LABELS[asset.type],
      asset.name,
      STATUS_COLORS[asset.status].label,
      asset.linkedShots.map((shot) => shot.code).join(" | "),
      asset.description ?? "",
      ...PIPELINE_STEPS.map((step) => STATUS_COLORS[asset.pipeline[step]?.status ?? "WAITING_TO_START"].label),
    ]),
  ];
}
