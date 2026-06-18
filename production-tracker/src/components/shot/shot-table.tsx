"use client";

import * as ContextMenu from "@radix-ui/react-context-menu";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { TaskStatus } from "@/generated/prisma/enums";

import { downloadCsv } from "@/lib/csv";
import type { ShotTableItem } from "@/lib/shot-data";
import { PIPELINE_COLORS, PIPELINE_STEPS, STATUS_COLORS } from "@/lib/status-colors";

const statusCycle: TaskStatus[] = ["WAITING_TO_START", "READY_TO_START", "IN_PROGRESS", "PENDING_REVIEW", "APPROVED", "FINAL"];
const shotMenuStatuses: TaskStatus[] = ["WAITING_TO_START", "READY_TO_START", "IN_PROGRESS", "PENDING_REVIEW", "FINAL", "ON_HOLD"];

export function ShotTable({ shots }: { shots: ShotTableItem[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const groups = groupShotsBySequence(shots);

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
      setMessage("更新任务状态失败。");
      return;
    }

    startTransition(() => router.refresh());
  }

  async function updateShotStatus(shotId: string, status: TaskStatus) {
    setPendingId(shotId);
    setMessage(null);

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

  async function deleteShot(shotId: string) {
    setPendingId(shotId);
    setMessage(null);

    const response = await fetch(`/api/shots/${shotId}`, {
      method: "DELETE",
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("删除镜头失败。");
      return;
    }

    startTransition(() => router.refresh());
  }

  async function copyShotUrl(shotId: string) {
    const url = `${window.location.origin}/app/shots/${shotId}`;
    await navigator.clipboard.writeText(url).catch(() => undefined);
    setMessage("Shot URL 已复制。");
  }

  if (shots.length === 0) {
    return (
      <div className="grid min-h-72 place-items-center border border-dashed border-[#3f3c33] bg-[#181713] p-10 text-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">No shots</p>
          <h2 className="mt-3 text-2xl font-semibold">还没有镜头</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#aaa599]">创建镜头后，会按 Sequence 分组展示 LAY/ANM/CFX/FX/LGT/CMP 状态。</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {message ? <div className="mb-3 border border-[#3f3c33] bg-[#181713] px-3 py-2 text-sm text-[#d8b46a]">{message}</div> : null}

      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => downloadCsv("shot-status-report.csv", buildShotCsvRows(shots))}
          className="h-9 border border-[#34322b] px-3 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-hidden border border-[#34322b] bg-[#181713]">
        <div className="grid grid-cols-[92px_1.15fr_120px_84px_repeat(6,minmax(76px,1fr))] border-b border-[#2a2a28] bg-[#1e1e1c] text-[11px] font-medium uppercase tracking-[0.12em] text-[#6e6e69]">
          <HeaderCell>Thumb</HeaderCell>
          <HeaderCell>Shot</HeaderCell>
          <HeaderCell>Status</HeaderCell>
          <HeaderCell>Frames</HeaderCell>
          {PIPELINE_STEPS.map((step) => (
            <HeaderCell key={step}>
              <span style={{ color: PIPELINE_COLORS[step] }}>{step}</span>
            </HeaderCell>
          ))}
        </div>

        {Object.entries(groups).map(([sequence, sequenceShots]) => (
          <div key={sequence}>
            <div className="border-b border-[#2a2a28] bg-[#1a1a18] px-3 py-2 text-sm font-medium text-[#9e9d97]">
              ▼ {sequence} ({sequenceShots.length})
            </div>
            {sequenceShots.map((shot) => (
              <ContextMenu.Root key={shot.id}>
                <ContextMenu.Trigger asChild>
                  <div className="grid min-h-12 grid-cols-[92px_1.15fr_120px_84px_repeat(6,minmax(76px,1fr))] border-b border-[#2a2a28] text-sm hover:bg-[#252523]">
                    <div className="flex items-center px-3">
                      <div className="grid h-9 w-16 place-items-center border border-[#34322b] bg-[#11110f] font-mono text-[10px] text-[#7f7a70]">
                        {shot.sequenceCode}
                      </div>
                    </div>
                    <div className="flex min-w-0 flex-col justify-center px-3">
                      <span className="font-medium text-[#4a9eff] hover:underline">{shot.code}</span>
                      <span className="truncate text-xs text-[#8f8a7e]">{shot.description || "No description"}</span>
                    </div>
                    <div className="flex items-center px-3">
                      <StatusPill status={shot.status} />
                    </div>
                    <div className="flex items-center px-3 font-mono text-xs text-[#aaa599]">{shot.cutDuration ?? "--"}</div>
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
                  onSetStatus={(status) => updateShotStatus(shot.id, status)}
                />
              </ContextMenu.Root>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ShotContextMenu({
  shot,
  onCopy,
  onDelete,
  onSetStatus,
}: {
  shot: ShotTableItem;
  onCopy: () => void;
  onDelete: () => void;
  onSetStatus: (status: TaskStatus) => void;
}) {
  return (
    <ContextMenu.Portal>
      <ContextMenu.Content className="z-50 min-w-64 border border-[#3b382f] bg-[#181713] p-1 text-sm text-[#d8d3c7] shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <ContextMenu.Label className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">选中 {shot.code}</ContextMenu.Label>
        <MenuItem>✎ Edit Shot</MenuItem>
        <MenuItem>⧉ Duplicate Shot</MenuItem>
        <MenuItem>▶ Open in Review</MenuItem>
        <MenuItem onSelect={onCopy}>⌘ Copy Shot URL</MenuItem>
        <Separator />
        <ContextMenu.Label className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">状态</ContextMenu.Label>
        {shotMenuStatuses.map((status) => (
          <MenuItem key={status} onSelect={() => onSetStatus(status)}>
            <span className="mr-2 inline-block size-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[status].dot }} />
            {STATUS_COLORS[status].label}
          </MenuItem>
        ))}
        <Separator />
        <MenuItem>👤 Assign To...</MenuItem>
        <MenuItem>🚩 Set Priority</MenuItem>
        <Separator />
        <MenuItem danger onSelect={onDelete}>
          Delete Shot
        </MenuItem>
      </ContextMenu.Content>
    </ContextMenu.Portal>
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

function groupShotsBySequence(shots: ShotTableItem[]) {
  return shots.reduce<Record<string, ShotTableItem[]>>((groups, shot) => {
    groups[shot.sequenceCode] ??= [];
    groups[shot.sequenceCode].push(shot);
    return groups;
  }, {});
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
