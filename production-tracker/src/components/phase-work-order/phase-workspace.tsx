"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { downloadCsv } from "@/lib/csv";
import type { PhaseItem } from "@/lib/phase-work-order-data";

type PhaseDraft = {
  name: string;
  startDate: string;
  endDate: string;
};

type StageFilter = "ALL" | "LIVE" | "UPCOMING" | "COMPLETED" | "EMPTY";

const demoProjectId = "demo-mkali-mission";
const demoIdPrefix = "demo-";

export function PhaseWorkspace({ projectId, phases, todayDate }: { projectId: string; phases: PhaseItem[]; todayDate: string }) {
  const router = useRouter();
  const today = useMemo(() => parseDate(todayDate), [todayDate]);
  const [phaseItems, setPhaseItems] = useState(phases);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<StageFilter>("ALL");
  const [editingPhase, setEditingPhase] = useState<PhaseItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const summary = useMemo(() => buildPhaseSummary(phaseItems, today), [phaseItems, today]);
  const timelineBounds = useMemo(() => getTimelineBounds(phaseItems, today), [phaseItems, today]);
  const filteredPhases = useMemo(() => {
    const lowered = query.trim().toLowerCase();

    return phaseItems.filter((phase) => {
      const metrics = getPhaseMetrics(phase, today);
      const matchesQuery = !lowered || phase.name.toLowerCase().includes(lowered) || phase.startDate.includes(lowered) || phase.endDate.includes(lowered);
      const matchesStage =
        stageFilter === "ALL" ||
        (stageFilter === "EMPTY" ? phase.taskCount === 0 : metrics.stage === stageFilter);

      return matchesQuery && matchesStage;
    });
  }, [phaseItems, query, stageFilter, today]);

  async function createPhase(input: PhaseDraft) {
    const draft = normalizeDraft(input);
    setPendingId("new-phase");
    setMessage(null);

    if (projectId === demoProjectId) {
      setPhaseItems((current) => [createDemoPhase(draft, current), ...current].sort(sortPhases));
      setCreateOpen(false);
      setPendingId(null);
      setMessage("演示阶段已创建。");
      return;
    }

    const response = await fetch(`/api/projects/${projectId}/phases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("创建阶段失败。");
      return;
    }

    setCreateOpen(false);
    setMessage("阶段已创建。");
    startTransition(() => router.refresh());
  }

  async function updatePhase(phaseId: string, input: PhaseDraft) {
    const draft = normalizeDraft(input);
    setPendingId(phaseId);
    setMessage(null);

    if (phaseId.startsWith(demoIdPrefix)) {
      setPhaseItems((current) => current.map((phase) => (phase.id === phaseId ? { ...phase, ...draft } : phase)).sort(sortPhases));
      setEditingPhase(null);
      setPendingId(null);
      setMessage("演示阶段已更新。");
      return;
    }

    const response = await fetch(`/api/phases/${phaseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("更新阶段失败。");
      return;
    }

    setEditingPhase(null);
    setMessage("阶段已更新。");
    startTransition(() => router.refresh());
  }

  async function deletePhase(phaseId: string) {
    setPendingId(phaseId);
    setMessage(null);

    if (phaseId.startsWith(demoIdPrefix)) {
      setPhaseItems((current) => current.filter((phase) => phase.id !== phaseId));
      setEditingPhase((current) => (current?.id === phaseId ? null : current));
      setPendingId(null);
      setMessage("演示阶段已删除。");
      return;
    }

    const response = await fetch(`/api/phases/${phaseId}`, { method: "DELETE" });

    setPendingId(null);

    if (!response.ok) {
      setMessage("删除阶段失败。");
      return;
    }

    setMessage("阶段已删除。");
    startTransition(() => router.refresh());
  }

  return (
    <div>
      {message ? <div className="mb-3 border border-[#3f3c33] bg-[#181713] px-3 py-2 text-sm text-[#d8b46a]">{message}</div> : null}

      <section className="mb-4 border border-[#34322b] bg-[#181713]">
        <div className="grid border-b border-[#2a2a28] md:grid-cols-5">
          <Metric label="Phases" value={summary.total} />
          <Metric label="Live" value={summary.live} tone={summary.live ? "good" : "normal"} />
          <Metric label="Upcoming" value={summary.upcoming} />
          <Metric label="Completed" value={summary.completed} />
          <Metric label="Linked tasks" value={summary.taskCount} tone={summary.empty ? "warn" : "normal"} />
        </div>
        <div className="grid gap-2 p-3 xl:grid-cols-[minmax(260px,1fr)_170px_auto_auto]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索阶段、日期"
            className="h-9 border border-[#34322b] bg-[#11110f] px-3 text-sm text-[#f4f1e8] outline-none placeholder:text-[#6e6e69] focus:border-[#d8b46a]"
          />
          <select value={stageFilter} onChange={(event) => setStageFilter(event.target.value as StageFilter)} className="h-9 border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#c9c3b5] outline-none focus:border-[#d8b46a]">
            <option value="ALL">全部阶段</option>
            <option value="LIVE">进行中</option>
            <option value="UPCOMING">未开始</option>
            <option value="COMPLETED">已完成</option>
            <option value="EMPTY">未挂任务</option>
          </select>
          <button
            type="button"
            onClick={() => downloadCsv("project-phases.csv", buildPhaseCsvRows(phaseItems))}
            className="h-9 border border-[#34322b] px-3 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
          >
            Export CSV
          </button>
          <button type="button" onClick={() => setCreateOpen(true)} className="h-9 bg-[#378add] px-4 text-xs font-semibold text-white transition hover:bg-[#4a9eff]">
            Add Phase
          </button>
        </div>
      </section>

      <section className="overflow-hidden border border-[#34322b] bg-[#181713]">
        <div className="grid min-w-[980px] grid-cols-[minmax(220px,1fr)_115px_115px_95px_100px_minmax(240px,1.2fr)_150px] border-b border-[#2a2a28] bg-[#1e1e1c] text-[11px] font-medium uppercase tracking-[0.12em] text-[#6e6e69]">
          <HeaderCell>Phase</HeaderCell>
          <HeaderCell>Start</HeaderCell>
          <HeaderCell>End</HeaderCell>
          <HeaderCell>Days</HeaderCell>
          <HeaderCell>Tasks</HeaderCell>
          <HeaderCell>Schedule window</HeaderCell>
          <HeaderCell>Actions</HeaderCell>
        </div>
        <div className="overflow-x-auto">
          {filteredPhases.length ? (
            filteredPhases.map((phase) => {
              const metrics = getPhaseMetrics(phase, today);

              return (
                <div key={phase.id} className="grid min-h-16 min-w-[980px] grid-cols-[minmax(220px,1fr)_115px_115px_95px_100px_minmax(240px,1.2fr)_150px] items-center border-b border-[#2a2a28] text-sm hover:bg-[#252523]">
                  <div className="min-w-0 px-3">
                    <div className="flex items-center gap-2">
                      <span className={["inline-block size-2 rounded-full", stageToneClass(metrics.stage)].join(" ")} />
                      <span className="truncate font-medium text-[#f4f1e8]">{phase.name}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#7f7a70]">{metrics.stageLabel} · {metrics.elapsedPct}% elapsed</p>
                  </div>
                  <div className="px-3 font-mono text-xs text-[#aaa599]">{phase.startDate}</div>
                  <div className="px-3 font-mono text-xs text-[#aaa599]">{phase.endDate}</div>
                  <div className="px-3 font-mono text-xs text-[#c9c3b5]">{metrics.durationDays}</div>
                  <div className="px-3">
                    <span className={["border px-2 py-1 font-mono text-xs", phase.taskCount ? "border-[#31483d] bg-[#13211b] text-[#9cccae]" : "border-[#5a4422] bg-[#211b12] text-[#e8c678]"].join(" ")}>
                      {phase.taskCount}
                    </span>
                  </div>
                  <div className="px-3">
                    <TimelineBar phase={phase} bounds={timelineBounds} progress={metrics.elapsedPct} today={today} />
                  </div>
                  <div className="flex items-center justify-end gap-2 px-3">
                    <button type="button" onClick={() => setEditingPhase(phase)} className="h-8 border border-[#34322b] px-3 text-xs text-[#c9c3b5] hover:border-[#d8b46a] hover:text-[#e8c678]">
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={pendingId === phase.id}
                      onClick={() => deletePhase(phase.id)}
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
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">No matching phase</p>
                <p className="mt-3 text-sm text-[#aaa599]">调整搜索或筛选条件，或者新建一个制作阶段。</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {createOpen ? <PhaseDialog mode="create" pending={pendingId === "new-phase"} onClose={() => setCreateOpen(false)} onSave={createPhase} /> : null}
      {editingPhase ? <PhaseDialog mode="edit" phase={editingPhase} pending={pendingId === editingPhase.id} onClose={() => setEditingPhase(null)} onSave={(input) => updatePhase(editingPhase.id, input)} /> : null}
    </div>
  );
}

function PhaseDialog({ mode, phase, pending, onClose, onSave }: { mode: "create" | "edit"; phase?: PhaseItem; pending: boolean; onClose: () => void; onSave: (input: PhaseDraft) => void }) {
  const [draft, setDraft] = useState<PhaseDraft>(() => ({
    name: phase?.name ?? "",
    startDate: phase?.startDate ?? new Date().toISOString().slice(0, 10),
    endDate: phase?.endDate ?? new Date().toISOString().slice(0, 10),
  }));
  const isInvalid = !draft.name.trim() || !draft.startDate || !draft.endDate || new Date(draft.endDate) < new Date(draft.startDate);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/62 px-6">
      <div className="w-full max-w-xl border border-[#3d392f] bg-[#181713] shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-[#34322b] px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Phase</p>
            <h2 className="mt-1 text-xl font-semibold text-[#f4f1e8]">{mode === "create" ? "新建制作阶段" : "编辑制作阶段"}</h2>
          </div>
          <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-[#aaa599] hover:text-[#f4f1e8]">
            关闭
          </button>
        </div>

        <div className="space-y-4 p-5">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">Name</span>
            <input
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              className="mt-2 h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm text-[#f4f1e8] outline-none focus:border-[#d8b46a]"
              placeholder="例如 Prep / Shoot / Post / VFX Review"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">Start date</span>
              <input
                type="date"
                value={draft.startDate}
                onChange={(event) => setDraft((current) => ({ ...current, startDate: event.target.value }))}
                className="mt-2 h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm text-[#f4f1e8] outline-none focus:border-[#d8b46a]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">End date</span>
              <input
                type="date"
                value={draft.endDate}
                onChange={(event) => setDraft((current) => ({ ...current, endDate: event.target.value }))}
                className="mt-2 h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm text-[#f4f1e8] outline-none focus:border-[#d8b46a]"
              />
            </label>
          </div>
          {new Date(draft.endDate) < new Date(draft.startDate) ? <p className="text-xs text-[#e28b81]">结束日期不能早于开始日期。</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#34322b] px-5 py-4">
          <button type="button" onClick={onClose} className="h-10 border border-[#3f3c33] px-4 text-sm text-[#c9c3b5]">
            取消
          </button>
          <button type="button" disabled={isInvalid || pending} onClick={() => onSave(draft)} className="h-10 bg-[#378add] px-5 text-sm font-semibold text-white disabled:opacity-50">
            {pending ? "保存中..." : "保存阶段"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TimelineBar({ phase, bounds, progress, today }: { phase: PhaseItem; bounds: TimelineBounds; progress: number; today: Date }) {
  const start = parseDate(phase.startDate).getTime();
  const end = parseDate(phase.endDate).getTime();
  const total = Math.max(1, bounds.end - bounds.start);
  const left = ((start - bounds.start) / total) * 100;
  const width = Math.max(3, ((end - start) / total) * 100);
  const todayLeft = ((today.getTime() - bounds.start) / total) * 100;

  return (
    <div className="relative h-8">
      <div className="absolute left-0 right-0 top-3 h-2 bg-[#26231d]" />
      <div className="absolute top-2 h-4 bg-[#2d3d35]" style={{ left: `${left}%`, width: `${Math.min(100 - left, width)}%` }}>
        <div className="h-full bg-[#d8b46a]" style={{ width: `${progress}%` }} />
      </div>
      {todayLeft >= 0 && todayLeft <= 100 ? <div className="absolute top-0 h-8 w-px bg-[#4a9eff]" style={{ left: `${todayLeft}%` }} /> : null}
    </div>
  );
}

function Metric({ label, value, tone = "normal" }: { label: string; value: number; tone?: "normal" | "good" | "warn" }) {
  const toneClass = tone === "good" ? "text-[#9cccae]" : tone === "warn" ? "text-[#e8c678]" : "text-[#f4f1e8]";
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

function normalizeDraft(input: PhaseDraft): PhaseDraft {
  return {
    name: input.name.trim(),
    startDate: input.startDate,
    endDate: input.endDate,
  };
}

function createDemoPhase(input: PhaseDraft, current: PhaseItem[]): PhaseItem {
  const baseId = `demo-phase-${slugify(input.name) || "new"}`;
  let id = baseId;
  let index = 1;

  while (current.some((phase) => phase.id === id)) {
    index += 1;
    id = `${baseId}-${index}`;
  }

  return { id, ...input, taskCount: 0 };
}

function buildPhaseSummary(phases: PhaseItem[], today: Date) {
  const metrics = phases.map((phase) => getPhaseMetrics(phase, today));

  return {
    total: phases.length,
    live: metrics.filter((item) => item.stage === "LIVE").length,
    upcoming: metrics.filter((item) => item.stage === "UPCOMING").length,
    completed: metrics.filter((item) => item.stage === "COMPLETED").length,
    empty: phases.filter((phase) => phase.taskCount === 0).length,
    taskCount: phases.reduce((sum, phase) => sum + phase.taskCount, 0),
  };
}

function getPhaseMetrics(phase: PhaseItem, today: Date) {
  const start = parseDate(phase.startDate);
  const end = parseDate(phase.endDate);
  const durationDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);

  if (today < start) {
    return { durationDays, elapsedPct: 0, stage: "UPCOMING" as const, stageLabel: "Upcoming" };
  }

  if (today > end) {
    return { durationDays, elapsedPct: 100, stage: "COMPLETED" as const, stageLabel: "Completed" };
  }

  const elapsedPct = Math.round(((today.getTime() - start.getTime()) / Math.max(1, end.getTime() - start.getTime())) * 100);
  return { durationDays, elapsedPct: Math.min(100, Math.max(0, elapsedPct)), stage: "LIVE" as const, stageLabel: "Live" };
}

type TimelineBounds = {
  start: number;
  end: number;
};

function getTimelineBounds(phases: PhaseItem[], today: Date): TimelineBounds {
  if (!phases.length) {
    const now = today.getTime();
    return { start: now - 1, end: now + 1 };
  }

  const starts = phases.map((phase) => parseDate(phase.startDate).getTime());
  const ends = phases.map((phase) => parseDate(phase.endDate).getTime());

  return {
    start: Math.min(...starts, today.getTime()),
    end: Math.max(...ends, today.getTime()),
  };
}

function stageToneClass(stage: "LIVE" | "UPCOMING" | "COMPLETED") {
  if (stage === "LIVE") return "bg-[#1d9e75]";
  if (stage === "UPCOMING") return "bg-[#4a9eff]";
  return "bg-[#8f8a7e]";
}

function sortPhases(a: PhaseItem, b: PhaseItem) {
  return a.startDate.localeCompare(b.startDate);
}

function parseDate(value: string) {
  return new Date(`${value.slice(0, 10)}T00:00:00`);
}

function slugify(value: string) {
  return value.toLowerCase().trim().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-|-$/g, "");
}

function buildPhaseCsvRows(phases: PhaseItem[]) {
  const today = parseDate(new Date().toISOString().slice(0, 10));

  return [
    ["phase", "start_date", "end_date", "duration_days", "stage", "elapsed_pct", "linked_tasks"],
    ...phases.map((phase) => {
      const metrics = getPhaseMetrics(phase, today);
      return [phase.name, phase.startDate, phase.endDate, metrics.durationDays, metrics.stageLabel, metrics.elapsedPct, phase.taskCount];
    }),
  ];
}
