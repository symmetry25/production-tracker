"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { TaskStatus } from "@/generated/prisma/enums";

import type { AssetTableItem } from "@/lib/asset-data";
import { ASSET_TYPE_LABELS, PIPELINE_COLORS, PIPELINE_STEPS, STATUS_COLORS } from "@/lib/status-colors";

const statusCycle: TaskStatus[] = ["WAITING_TO_START", "READY_TO_START", "IN_PROGRESS", "PENDING_REVIEW", "APPROVED", "FINAL"];

export function AssetTable({ assets }: { assets: AssetTableItem[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
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
              <div
                key={asset.id}
                className="grid min-h-20 grid-cols-[110px_1.15fr_120px_180px_repeat(6,minmax(76px,1fr))] border-b border-[#2a2a28] text-sm hover:bg-[#252523]"
              >
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
                      <span key={shot.id} className="border border-[#34322b] bg-[#11110f] px-2 py-1 font-mono text-[11px] text-[#c9c3b5]">
                        {shot.code}
                      </span>
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
            ))}
          </div>
        ))}
      </div>
    </div>
  );
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
