import type { ShotTableItem } from "@/lib/shot-data";
import { PIPELINE_COLORS, PIPELINE_STEPS, STATUS_COLORS } from "@/lib/status-colors";

export function ShotTable({ shots }: { shots: ShotTableItem[] }) {
  const groups = groupShotsBySequence(shots);

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
            <div
              key={shot.id}
              className="grid min-h-12 grid-cols-[92px_1.15fr_120px_84px_repeat(6,minmax(76px,1fr))] border-b border-[#2a2a28] text-sm hover:bg-[#252523]"
            >
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
              {PIPELINE_STEPS.map((step) => (
                <div key={step} className="flex items-center justify-center px-2">
                  <PipelineDot status={shot.pipeline[step]?.status ?? "WAITING_TO_START"} title={shot.pipeline[step]?.assignees.join(", ") || STATUS_COLORS.WAITING_TO_START.label} />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
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

function PipelineDot({ status, title }: { status: keyof typeof STATUS_COLORS; title: string }) {
  const color = STATUS_COLORS[status];
  const isWaiting = status === "WAITING_TO_START";
  const isReady = status === "READY_TO_START";
  const isProgress = status === "IN_PROGRESS";

  return (
    <span
      title={title}
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
