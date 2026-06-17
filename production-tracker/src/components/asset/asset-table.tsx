"use client";

import * as ContextMenu from "@radix-ui/react-context-menu";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { TaskStatus } from "@/generated/prisma/enums";

import type { AssetTableItem } from "@/lib/asset-data";
import type { ShotTableItem } from "@/lib/shot-data";
import { ASSET_TYPE_LABELS, PIPELINE_COLORS, PIPELINE_STEPS, STATUS_COLORS } from "@/lib/status-colors";

const statusCycle: TaskStatus[] = ["WAITING_TO_START", "READY_TO_START", "IN_PROGRESS", "PENDING_REVIEW", "APPROVED", "FINAL"];
const assetMenuStatuses: TaskStatus[] = ["WAITING_TO_START", "READY_TO_START", "IN_PROGRESS", "PENDING_REVIEW", "FINAL", "ON_HOLD"];

export function AssetTable({ assets, shots }: { assets: AssetTableItem[]; shots: Pick<ShotTableItem, "id" | "code" | "sequenceCode">[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [linkAsset, setLinkAsset] = useState<AssetTableItem | null>(null);
  const [, startTransition] = useTransition();
  const groups = groupAssetsByType(assets);

  async function updateTaskStatus(taskId: string, currentStatus: TaskStatus) {
    const nextStatus = statusCycle[(statusCycle.indexOf(currentStatus) + 1) % statusCycle.length];
    setPendingId(taskId);
    setMessage(null);

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

  async function deleteAsset(assetId: string) {
    setPendingId(assetId);
    setMessage(null);

    const response = await fetch(`/api/assets/${assetId}`, {
      method: "DELETE",
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("删除资产失败。");
      return;
    }

    startTransition(() => router.refresh());
  }

  async function linkShot(assetId: string, shotId: string) {
    setPendingId(`${assetId}:${shotId}`);
    setMessage(null);

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

  if (assets.length === 0) {
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
      <div className="overflow-hidden border border-[#34322b] bg-[#181713]">
        <div className="grid grid-cols-[110px_1.15fr_120px_180px_repeat(6,minmax(76px,1fr))] border-b border-[#2a2a28] bg-[#1e1e1c] text-[11px] font-medium uppercase tracking-[0.12em] text-[#6e6e69]">
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

        {Object.entries(groups).map(([type, typeAssets]) => (
          <div key={type}>
            <div className="border-b border-[#2a2a28] bg-[#1a1a18] px-3 py-2 text-sm font-medium text-[#9e9d97]">
              ▼ {ASSET_TYPE_LABELS[type as keyof typeof ASSET_TYPE_LABELS]} ({typeAssets.length})
            </div>
            {typeAssets.map((asset) => (
              <ContextMenu.Root key={asset.id}>
                <ContextMenu.Trigger asChild>
                  <div className="grid min-h-20 grid-cols-[110px_1.15fr_120px_180px_repeat(6,minmax(76px,1fr))] border-b border-[#2a2a28] text-sm hover:bg-[#252523]">
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
                    <div className="flex min-w-0 flex-col justify-center px-3">
                      <span className="font-medium text-[#4a9eff] hover:underline">{asset.name}</span>
                      <span className="truncate text-xs text-[#8f8a7e]">{asset.description || "No description"}</span>
                    </div>
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
                  onLink={() => setLinkAsset(asset)}
                  onSetStatus={(status) => updateAssetStatus(asset.id, status)}
                />
              </ContextMenu.Root>
            ))}
          </div>
        ))}
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
    </div>
  );
}

function AssetContextMenu({
  asset,
  onCopy,
  onDelete,
  onLink,
  onSetStatus,
}: {
  asset: AssetTableItem;
  onCopy: () => void;
  onDelete: () => void;
  onLink: () => void;
  onSetStatus: (status: TaskStatus) => void;
}) {
  return (
    <ContextMenu.Portal>
      <ContextMenu.Content className="z-50 min-w-64 border border-[#3b382f] bg-[#181713] p-1 text-sm text-[#d8d3c7] shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <ContextMenu.Label className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">{asset.name}</ContextMenu.Label>
        <MenuItem>✎ Edit Asset</MenuItem>
        <MenuItem>⧉ Duplicate Asset</MenuItem>
        <MenuItem>▶ Preview Latest Version</MenuItem>
        <MenuItem onSelect={onCopy}>⌘ Copy Asset URL</MenuItem>
        <Separator />
        <ContextMenu.Label className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">状态</ContextMenu.Label>
        {assetMenuStatuses.map((status) => (
          <MenuItem key={status} onSelect={() => onSetStatus(status)}>
            <span className="mr-2 inline-block size-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[status].dot }} />
            {STATUS_COLORS[status].label}
          </MenuItem>
        ))}
        <Separator />
        <MenuItem onSelect={onLink}>↔ Link to Shot...</MenuItem>
        <Separator />
        <MenuItem danger onSelect={onDelete}>
          Delete Asset
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

function groupAssetsByType(assets: AssetTableItem[]) {
  return assets.reduce<Record<string, AssetTableItem[]>>((groups, asset) => {
    groups[asset.type] ??= [];
    groups[asset.type].push(asset);
    return groups;
  }, {});
}
