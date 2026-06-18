"use client";

import * as ContextMenu from "@radix-ui/react-context-menu";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { DependencyType } from "@/generated/prisma/enums";
import type { TaskStatus } from "@/generated/prisma/enums";

import { downloadCsv } from "@/lib/csv";
import { STATUS_COLORS } from "@/lib/status-colors";
import type { TaskTableItem } from "@/lib/task-data";

const taskMenuStatuses: TaskStatus[] = ["WAITING_TO_START", "READY_TO_START", "IN_PROGRESS", "PENDING_REVIEW", "APPROVED", "FINAL", "ON_HOLD"];

export function TaskTable({ tasks }: { tasks: TaskTableItem[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [dependencyTask, setDependencyTask] = useState<TaskTableItem | null>(null);
  const [, startTransition] = useTransition();

  const summary = useMemo(() => {
    const totalBudget = tasks.reduce((sum, task) => sum + (task.estimatedCost ?? 0), 0);
    const totalActual = tasks.reduce((sum, task) => sum + task.calculatedCost, 0);
    const blocked = tasks.filter((task) => task.status === "ON_HOLD" || task.overBudget).length;

    return { totalBudget, totalActual, blocked };
  }, [tasks]);

  async function patchTask(taskId: string, payload: Record<string, unknown>, errorMessage = "更新任务失败。") {
    setPendingId(taskId);
    setMessage(null);

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage(errorMessage);
      return;
    }

    startTransition(() => router.refresh());
  }

  async function deleteTask(taskId: string) {
    setPendingId(taskId);
    setMessage(null);

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("删除任务失败。");
      return;
    }

    startTransition(() => router.refresh());
  }

  async function addDependency(taskId: string, predecessorId: string, type: DependencyType, lagDays: number) {
    setPendingId(`${taskId}:${predecessorId}`);
    setMessage(null);

    const response = await fetch(`/api/tasks/${taskId}/dependencies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ predecessorId, type, lagDays }),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("添加依赖失败。");
      return;
    }

    setDependencyTask(null);
    startTransition(() => router.refresh());
  }

  async function removeDependency(taskId: string, dependencyId: string) {
    setPendingId(`${taskId}:${dependencyId}`);
    setMessage(null);

    const response = await fetch(`/api/tasks/${taskId}/dependencies/${dependencyId}`, {
      method: "DELETE",
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("移除依赖失败。");
      return;
    }

    startTransition(() => router.refresh());
  }

  async function copyTaskUrl(taskId: string) {
    const url = `${window.location.origin}/app/tasks/${taskId}`;
    await navigator.clipboard.writeText(url).catch(() => undefined);
    setMessage("Task URL 已复制。");
  }

  if (tasks.length === 0) {
    return (
      <div className="grid min-h-72 place-items-center border border-dashed border-[#3f3c33] bg-[#181713] p-10 text-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">No tasks</p>
          <h2 className="mt-3 text-2xl font-semibold">还没有任务</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#aaa599]">创建任务后，会显示排期、负责人、依赖关系和预算风险。</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {message ? <div className="mb-3 border border-[#3f3c33] bg-[#181713] px-3 py-2 text-sm text-[#d8b46a]">{message}</div> : null}

      <div className="mb-3 grid grid-cols-3 border border-[#34322b] bg-[#181713] text-sm">
        <SummaryCell label="Task Budget" value={`$${summary.totalBudget.toLocaleString()}`} />
        <SummaryCell label="Logged Cost" value={`$${summary.totalActual.toLocaleString()}`} tone={summary.totalActual > summary.totalBudget ? "danger" : "normal"} />
        <SummaryCell label="Risk Items" value={summary.blocked.toString()} tone={summary.blocked > 0 ? "danger" : "normal"} />
      </div>

      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => downloadCsv("task-status-report.csv", buildTaskCsvRows(tasks))}
          className="h-9 border border-[#34322b] px-3 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-hidden border border-[#34322b] bg-[#181713]">
        <div className="grid grid-cols-[110px_1.2fr_120px_160px_120px_120px_120px_120px_1fr_170px] border-b border-[#2a2a28] bg-[#1e1e1c] text-[11px] font-medium uppercase tracking-[0.12em] text-[#6e6e69]">
          <HeaderCell>Source</HeaderCell>
          <HeaderCell>Task</HeaderCell>
          <HeaderCell>Status</HeaderCell>
          <HeaderCell>Assignee</HeaderCell>
          <HeaderCell>Start</HeaderCell>
          <HeaderCell>Due</HeaderCell>
          <HeaderCell>Logged</HeaderCell>
          <HeaderCell>Budget</HeaderCell>
          <HeaderCell>Predecessors</HeaderCell>
          <HeaderCell>Versions / Notes</HeaderCell>
        </div>

        {tasks.map((task) => (
          <ContextMenu.Root key={task.id}>
            <ContextMenu.Trigger asChild>
              <div
                className={[
                  "grid min-h-14 grid-cols-[110px_1.2fr_120px_160px_120px_120px_120px_120px_1fr_170px] border-b border-[#2a2a28] text-sm hover:bg-[#252523]",
                  task.overBudget ? "bg-[#211717]" : "",
                ].join(" ")}
              >
                <div className="flex flex-col justify-center px-3">
                  <span className="font-mono text-[11px] uppercase text-[#8f8a7e]">{task.context.kind}</span>
                  <span className="truncate text-xs text-[#c9c3b5]">{task.context.label}</span>
                </div>
                <div className="flex min-w-0 flex-col justify-center px-3">
                  <span className="truncate font-medium text-[#4a9eff]">{task.name}</span>
                  <span className="text-xs text-[#8f8a7e]">{priorityLabel(task.priority)}</span>
                </div>
                <div className="flex items-center px-3">
                  <select
                    value={task.status}
                    disabled={pendingId === task.id}
                    onChange={(event) => patchTask(task.id, { status: event.target.value })}
                    className="h-8 w-full border border-[#34322b] bg-[#11110f] px-2 text-xs outline-none focus:border-[#d8b46a]"
                  >
                    {taskMenuStatuses.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_COLORS[status].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-1 px-3">
                  {task.assignees.length ? (
                    task.assignees.map((assignee) => (
                      <span key={assignee.id} className="border border-[#34322b] bg-[#11110f] px-2 py-1 text-[11px] text-[#c9c3b5]">
                        {assignee.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#7f7a70]">Unassigned</span>
                  )}
                </div>
                <div className="flex items-center px-3">
                  <DateInput value={task.startDate} disabled={pendingId === task.id} onCommit={(value) => patchTask(task.id, { startDate: value || null })} />
                </div>
                <div className="flex items-center px-3">
                  <DateInput value={task.dueDate} disabled={pendingId === task.id} onCommit={(value) => patchTask(task.id, { dueDate: value || null })} />
                </div>
                <div className="flex items-center px-3 font-mono text-xs text-[#aaa599]">
                  {task.timeLogged.toFixed(1)}d · ${task.calculatedCost.toLocaleString()}
                </div>
                <div className={["flex items-center px-3 font-mono text-xs", task.overBudget ? "text-[#e24b4a]" : "text-[#aaa599]"].join(" ")}>
                  {task.estimatedCost ? `$${task.estimatedCost.toLocaleString()}` : "--"}
                </div>
                <div className="flex flex-wrap items-center gap-1 px-3">
                  {task.predecessors.length ? (
                    task.predecessors.map((dependency) => (
                      <button
                        key={dependency.id}
                        type="button"
                        onClick={() => removeDependency(task.id, dependency.id)}
                        className="border border-[#34322b] bg-[#11110f] px-2 py-1 text-[11px] text-[#c9c3b5] hover:border-[#e24b4a] hover:text-[#e24b4a]"
                        title="点击移除依赖"
                      >
                        {dependency.contextLabel} / {dependency.taskName}
                      </button>
                    ))
                  ) : (
                    <span className="text-xs text-[#7f7a70]">No dependency</span>
                  )}
                </div>
                <div className="flex items-center gap-2 px-3 font-mono text-xs text-[#aaa599]">
                  <span>v{task.versionCount}</span>
                  <span>n{task.noteCount}</span>
                </div>
              </div>
            </ContextMenu.Trigger>
            <TaskContextMenu
              task={task}
              onCopy={() => copyTaskUrl(task.id)}
              onDelete={() => deleteTask(task.id)}
              onSetStatus={(status) => patchTask(task.id, { status })}
              onAddDependency={() => setDependencyTask(task)}
            />
          </ContextMenu.Root>
        ))}
      </div>

      {dependencyTask ? (
        <DependencyDialog
          task={dependencyTask}
          tasks={tasks}
          pendingId={pendingId}
          onClose={() => setDependencyTask(null)}
          onCreate={(predecessorId, type, lagDays) => addDependency(dependencyTask.id, predecessorId, type, lagDays)}
        />
      ) : null}
    </div>
  );
}

function TaskContextMenu({
  task,
  onCopy,
  onDelete,
  onSetStatus,
  onAddDependency,
}: {
  task: TaskTableItem;
  onCopy: () => void;
  onDelete: () => void;
  onSetStatus: (status: TaskStatus) => void;
  onAddDependency: () => void;
}) {
  return (
    <ContextMenu.Portal>
      <ContextMenu.Content className="z-50 min-w-64 border border-[#3b382f] bg-[#181713] p-1 text-sm text-[#d8d3c7] shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <ContextMenu.Label className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">
          {task.name} — {task.context.label}
        </ContextMenu.Label>
        <MenuItem>✎ Edit Task</MenuItem>
        <MenuItem>▶ Open Versions</MenuItem>
        <MenuItem>⌕ Add Note</MenuItem>
        <MenuItem onSelect={onCopy}>⌘ Copy Task URL</MenuItem>
        <Separator />
        <ContextMenu.Label className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">状态</ContextMenu.Label>
        {taskMenuStatuses.map((status) => (
          <MenuItem key={status} onSelect={() => onSetStatus(status)}>
            <span className="mr-2 inline-block size-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[status].dot }} />
            {STATUS_COLORS[status].label}
          </MenuItem>
        ))}
        <Separator />
        <MenuItem>👤 Assign To...</MenuItem>
        <MenuItem>👁 Set Reviewer...</MenuItem>
        <MenuItem>📅 Edit Dates</MenuItem>
        <Separator />
        <MenuItem onSelect={onAddDependency}>↔ Add Predecessor...</MenuItem>
        <Separator />
        <MenuItem danger onSelect={onDelete}>
          Delete Task
        </MenuItem>
      </ContextMenu.Content>
    </ContextMenu.Portal>
  );
}

function DependencyDialog({
  task,
  tasks,
  pendingId,
  onClose,
  onCreate,
}: {
  task: TaskTableItem;
  tasks: TaskTableItem[];
  pendingId: string | null;
  onClose: () => void;
  onCreate: (predecessorId: string, type: DependencyType, lagDays: number) => void;
}) {
  const [predecessorId, setPredecessorId] = useState("");
  const [type, setType] = useState<DependencyType>(DependencyType.FS);
  const [lagDays, setLagDays] = useState(0);
  const existingIds = new Set(task.predecessors.map((dependency) => dependency.taskId));
  const candidates = tasks.filter((candidate) => candidate.id !== task.id && !existingIds.has(candidate.id));

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/62 px-6">
      <div className="w-full max-w-2xl border border-[#3d392f] bg-[#181713] shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-[#34322b] px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Dependency</p>
            <h2 className="mt-1 text-xl font-semibold text-[#f4f1e8]">给 {task.name} 添加前置任务</h2>
          </div>
          <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-[#aaa599] hover:text-[#f4f1e8]">
            关闭
          </button>
        </div>

        <div className="grid grid-cols-[1fr_120px_100px] gap-3 p-5">
          <select
            value={predecessorId}
            onChange={(event) => setPredecessorId(event.target.value)}
            className="h-11 border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]"
          >
            <option value="">选择前置任务</option>
            {candidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.context.label} / {candidate.name}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as DependencyType)}
            className="h-11 border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]"
          >
            {Object.values(DependencyType).map((dependencyType) => (
              <option key={dependencyType} value={dependencyType}>
                {dependencyType}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={lagDays}
            onChange={(event) => setLagDays(Number(event.target.value))}
            className="h-11 border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]"
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-[#34322b] px-5 py-4">
          <button type="button" onClick={onClose} className="h-10 border border-[#3f3c33] px-4 text-sm text-[#c9c3b5]">
            取消
          </button>
          <button
            type="button"
            disabled={!predecessorId || pendingId === `${task.id}:${predecessorId}`}
            onClick={() => onCreate(predecessorId, type, lagDays)}
            className="h-10 bg-[#378add] px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            添加依赖
          </button>
        </div>
      </div>
    </div>
  );
}

function DateInput({ value, disabled, onCommit }: { value: string | null; disabled: boolean; onCommit: (value: string) => void }) {
  const [draft, setDraft] = useState(toDateInputValue(value));

  return (
    <input
      type="date"
      value={draft}
      disabled={disabled}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => onCommit(draft)}
      className="h-8 w-full border border-[#34322b] bg-[#11110f] px-2 text-xs outline-none focus:border-[#d8b46a]"
    />
  );
}

function SummaryCell({ label, value, tone = "normal" }: { label: string; value: string; tone?: "normal" | "danger" }) {
  return (
    <div className="border-r border-[#34322b] px-4 py-3 last:border-r-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">{label}</p>
      <p className={["mt-1 font-mono text-lg", tone === "danger" ? "text-[#e24b4a]" : "text-[#f4f1e8]"].join(" ")}>{value}</p>
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

function priorityLabel(priority: number) {
  if (priority >= 2) {
    return "Critical priority";
  }

  if (priority === 1) {
    return "High priority";
  }

  return "Normal priority";
}

function toDateInputValue(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

function buildTaskCsvRows(tasks: TaskTableItem[]) {
  return [
    [
      "source_type",
      "source",
      "task",
      "status",
      "assignees",
      "start_date",
      "due_date",
      "duration_days",
      "time_logged_days",
      "estimated_cost",
      "calculated_cost",
      "over_budget",
      "predecessors",
      "versions",
      "notes",
    ],
    ...tasks.map((task) => [
      task.context.kind,
      task.context.label,
      task.name,
      STATUS_COLORS[task.status].label,
      task.assignees.map((assignee) => assignee.name).join(" | "),
      task.startDate?.slice(0, 10) ?? "",
      task.dueDate?.slice(0, 10) ?? "",
      task.duration ?? "",
      task.timeLogged,
      task.estimatedCost ?? "",
      task.calculatedCost,
      task.overBudget ? "yes" : "no",
      task.predecessors.map((dependency) => `${dependency.contextLabel} / ${dependency.taskName}`).join(" | "),
      task.versionCount,
      task.noteCount,
    ]),
  ];
}
