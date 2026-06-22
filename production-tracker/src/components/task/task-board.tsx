"use client";

import { useRouter } from "next/navigation";
import { type Dispatch, type SetStateAction, useMemo, useState, useTransition } from "react";
import type { TaskStatus } from "@/generated/prisma/enums";

import { STATUS_COLORS } from "@/lib/status-colors";
import type { TaskTableItem } from "@/lib/task-data";

const boardStatuses: TaskStatus[] = ["WAITING_TO_START", "READY_TO_START", "IN_PROGRESS", "PENDING_REVIEW", "APPROVED", "FINAL", "ON_HOLD"];
const completeStatuses: TaskStatus[] = ["APPROVED", "FINAL", "OMIT"];
const demoIdPrefix = "demo-";
const demoProjectId = "demo-mkali-mission";

export function TaskBoard({
  projectId,
  tasks,
  onTasksChange,
}: {
  projectId: string;
  tasks: TaskTableItem[];
  onTasksChange: Dispatch<SetStateAction<TaskTableItem[]>>;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const lanes = useMemo(() => boardStatuses.map((status) => buildLane(status, tasks)), [tasks]);
  const totals = useMemo(() => buildBoardTotals(tasks), [tasks]);

  async function updateStatus(task: TaskTableItem, status: TaskStatus) {
    if (task.status === status) return;
    setPendingId(task.id);
    setMessage(null);

    if (isDemoTask(projectId, task.id)) {
      onTasksChange((current) => current.map((item) => (item.id === task.id ? { ...item, status } : item)));
      setPendingId(null);
      setMessage(`${task.context.label} / ${task.name} 已移动到 ${STATUS_COLORS[status].label}。`);
      return;
    }

    const response = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("任务状态保存失败。");
      return;
    }

    onTasksChange((current) => current.map((item) => (item.id === task.id ? { ...item, status } : item)));
    startTransition(() => router.refresh());
  }

  return (
    <div>
      {message ? <div className="mb-3 border border-[#3f3c33] bg-[#181713] px-3 py-2 text-sm text-[#d8b46a]">{message}</div> : null}

      <section className="mb-3 grid gap-3 md:grid-cols-4">
        <BoardMetric label="Open tasks" value={totals.openTasks} />
        <BoardMetric label="In review" value={totals.reviewTasks} />
        <BoardMetric label="Budget at risk" value={`$${totals.budgetRisk.toLocaleString()}`} tone={totals.budgetRisk > 0 ? "danger" : "normal"} />
        <BoardMetric label="Unassigned" value={totals.unassignedTasks} tone={totals.unassignedTasks > 0 ? "warn" : "normal"} />
      </section>

      <div className="overflow-x-auto border border-[#34322b] bg-[#141411]">
        <div className="grid min-w-[1480px] grid-cols-7 gap-px bg-[#2a2a28]">
          {lanes.map((lane) => (
            <section key={lane.status} className="min-h-[620px] bg-[#181713]">
              <div className="sticky top-0 z-10 border-b border-[#2a2a28] bg-[#1e1e1c] px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: STATUS_COLORS[lane.status].dot }} />
                      <h2 className="truncate text-sm font-semibold text-[#f4f1e8]">{STATUS_COLORS[lane.status].label}</h2>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-[#7f7a70]">{lane.tasks.length} tasks</p>
                  </div>
                  <span className="font-mono text-xs text-[#e8c678]">${lane.budget.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2 p-2">
                {lane.tasks.length ? (
                  lane.tasks.map((task) => (
                    <TaskBoardCard key={task.id} task={task} pending={pendingId === task.id} onStatusChange={(status) => updateStatus(task, status)} />
                  ))
                ) : (
                  <div className="grid h-32 place-items-center border border-dashed border-[#34322b] bg-[#11110f] px-3 text-center text-xs leading-5 text-[#6f6a60]">
                    暂无任务
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskBoardCard({ task, pending, onStatusChange }: { task: TaskTableItem; pending: boolean; onStatusChange: (status: TaskStatus) => void }) {
  const nextStatus = getNextStatus(task.status);
  const dueState = getDueState(task);

  return (
    <article className={["border bg-[#11110f] p-3 shadow-[0_8px_22px_rgba(0,0,0,0.22)]", task.overBudget ? "border-[#6f2f2f]" : "border-[#302d26]"].join(" ")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-[11px] uppercase tracking-[0.08em] text-[#7f7a70]">{task.context.kind} / {task.context.label}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-[#f4f1e8]">{task.name}</h3>
        </div>
        <span className={["shrink-0 border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]", priorityClass(task.priority)].join(" ")}>
          P{task.priority}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {task.assignees.length ? (
          task.assignees.slice(0, 3).map((assignee) => (
            <span key={assignee.id} className="border border-[#34322b] bg-[#181713] px-2 py-1 text-[11px] text-[#c9c3b5]">
              {assignee.name}
            </span>
          ))
        ) : (
          <span className="border border-[#5a4030] bg-[#211b12] px-2 py-1 text-[11px] text-[#e8c678]">Unassigned</span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <CardDatum label="Due" value={task.dueDate?.slice(5, 10) ?? "--"} tone={dueState} />
        <CardDatum label="Budget" value={task.estimatedCost ? `$${task.estimatedCost.toLocaleString()}` : "--"} tone={task.overBudget ? "danger" : "normal"} />
        <CardDatum label="Logged" value={`${task.timeLogged.toFixed(1)}d`} />
        <CardDatum label="Deps" value={task.predecessors.length ? String(task.predecessors.length) : "--"} tone={task.predecessors.length ? "warn" : "normal"} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <select
          aria-label={`Move ${task.name} status`}
          value={task.status}
          disabled={pending}
          onChange={(event) => onStatusChange(event.target.value as TaskStatus)}
          className="h-8 min-w-0 flex-1 border border-[#34322b] bg-[#181713] px-2 text-xs text-[#f4f1e8] outline-none focus:border-[#d8b46a]"
        >
          {boardStatuses.map((status) => (
            <option key={status} value={status}>{STATUS_COLORS[status].label}</option>
          ))}
        </select>
        {nextStatus ? (
          <button type="button" disabled={pending} onClick={() => onStatusChange(nextStatus)} className="h-8 border border-[#3f3c33] px-2 text-xs text-[#c9c3b5] hover:border-[#d8b46a] hover:text-[#e8c678] disabled:opacity-45">
            推进
          </button>
        ) : null}
      </div>
    </article>
  );
}

function buildLane(status: TaskStatus, tasks: TaskTableItem[]) {
  const laneTasks = tasks
    .filter((task) => task.status === status)
    .sort((a, b) => b.priority - a.priority || dateSortValue(a.dueDate) - dateSortValue(b.dueDate) || a.name.localeCompare(b.name));

  return {
    status,
    tasks: laneTasks,
    budget: laneTasks.reduce((sum, task) => sum + (task.estimatedCost ?? 0), 0),
  };
}

function buildBoardTotals(tasks: TaskTableItem[]) {
  return {
    openTasks: tasks.filter((task) => !completeStatuses.includes(task.status)).length,
    reviewTasks: tasks.filter((task) => task.status === "PENDING_REVIEW").length,
    unassignedTasks: tasks.filter((task) => task.assignees.length === 0 && !completeStatuses.includes(task.status)).length,
    budgetRisk: tasks.reduce((sum, task) => sum + (task.overBudget ? task.calculatedCost - (task.estimatedCost ?? 0) : 0), 0),
  };
}

function getNextStatus(status: TaskStatus): TaskStatus | null {
  const index = boardStatuses.indexOf(status);
  if (index < 0 || index >= boardStatuses.length - 3) return null;
  return boardStatuses[index + 1] ?? null;
}

function getDueState(task: TaskTableItem): "normal" | "warn" | "danger" {
  if (!task.dueDate || completeStatuses.includes(task.status)) return "normal";
  const today = new Date();
  const due = new Date(task.dueDate);
  const diffDays = Math.floor((startOfDay(due).getTime() - startOfDay(today).getTime()) / 86_400_000);
  if (diffDays < 0) return "danger";
  if (diffDays <= 3) return "warn";
  return "normal";
}

function dateSortValue(value: string | null) {
  return value ? new Date(value).getTime() : Number.MAX_SAFE_INTEGER;
}

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function isDemoTask(projectId: string, taskId: string) {
  return projectId === demoProjectId || taskId.startsWith(demoIdPrefix);
}

function priorityClass(priority: number) {
  if (priority >= 2) return "border-[#6f2f2f] bg-[#2b1717] text-[#ff9a8f]";
  if (priority === 1) return "border-[#6f5631] bg-[#211b12] text-[#e8c678]";
  return "border-[#34322b] bg-[#181713] text-[#8f8a7e]";
}

function BoardMetric({ label, value, tone = "normal" }: { label: string; value: number | string; tone?: "normal" | "warn" | "danger" }) {
  const toneClass = tone === "danger" ? "text-[#ff9a8f]" : tone === "warn" ? "text-[#e8c678]" : "text-[#f4f1e8]";
  return (
    <div className="border border-[#34322b] bg-[#181713] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">{label}</p>
      <p className={["mt-2 font-mono text-xl", toneClass].join(" ")}>{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  );
}

function CardDatum({ label, value, tone = "normal" }: { label: string; value: string; tone?: "normal" | "warn" | "danger" }) {
  const toneClass = tone === "danger" ? "text-[#ff9a8f]" : tone === "warn" ? "text-[#e8c678]" : "text-[#c9c3b5]";
  return (
    <div className="border border-[#2f2d27] bg-[#181713] px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-[0.12em] text-[#69655c]">{label}</p>
      <p className={["mt-1 truncate font-mono", toneClass].join(" ")}>{value}</p>
    </div>
  );
}
