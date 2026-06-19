"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { TaskStatus } from "@/generated/prisma/enums";

import { downloadCsv } from "@/lib/csv";
import { STATUS_COLORS } from "@/lib/status-colors";
import type { TaskTableItem } from "@/lib/task-data";

type RiskFilter = "ALL" | "OVERDUE" | "DUE_SOON" | "OVER_BUDGET" | "UNASSIGNED";

const demoProjectId = "demo-mkali-mission";
const taskStatuses: TaskStatus[] = ["WAITING_TO_START", "READY_TO_START", "IN_PROGRESS", "PENDING_REVIEW", "APPROVED", "FINAL", "ON_HOLD"];
const completeStatuses: TaskStatus[] = ["APPROVED", "FINAL", "OMIT"];

export function MyTasksWorkspace({
  projectId,
  tasks,
  todayDate,
  userName,
}: {
  projectId: string;
  tasks: TaskTableItem[];
  todayDate: string;
  userName: string;
}) {
  const router = useRouter();
  const today = useMemo(() => startOfDay(new Date(todayDate)), [todayDate]);
  const [taskItems, setTaskItems] = useState(tasks);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TaskStatus>("ALL");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("ALL");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const enrichedTasks = useMemo(() => taskItems.map((task) => enrichTask(task, today)), [taskItems, today]);
  const summary = useMemo(() => buildSummary(enrichedTasks), [enrichedTasks]);
  const focusQueue = useMemo(() => buildFocusQueue(enrichedTasks).slice(0, 5), [enrichedTasks]);
  const filteredTasks = useMemo(() => filterTasks(enrichedTasks, { query, statusFilter, riskFilter }), [enrichedTasks, query, riskFilter, statusFilter]);
  const activeFilters = [query.trim(), statusFilter !== "ALL", riskFilter !== "ALL"].filter(Boolean).length;

  async function updateTaskStatus(taskId: string, status: TaskStatus) {
    setPendingId(taskId);
    setMessage(null);

    if (projectId === demoProjectId || taskId.startsWith("demo-")) {
      setTaskItems((current) => current.map((task) => (task.id === taskId ? { ...task, status } : task)));
      setPendingId(null);
      setMessage("演示任务状态已更新。");
      return;
    }

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("更新任务状态失败。");
      return;
    }

    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      {message ? <div className="border border-[#3f3c33] bg-[#181713] px-3 py-2 text-sm text-[#d8b46a]">{message}</div> : null}

      <section className="border border-[#34322b] bg-[#181713]">
        <div className="grid border-b border-[#2a2a28] md:grid-cols-5">
          <Metric label="Assigned" value={summary.total} />
          <Metric label="Open" value={summary.open} />
          <Metric label="Overdue" value={summary.overdue} tone={summary.overdue > 0 ? "danger" : "normal"} />
          <Metric label="Due 7d" value={summary.dueSoon} tone={summary.dueSoon > 0 ? "warn" : "normal"} />
          <Metric label="Budget Risk" value={`$${summary.budgetRisk.toLocaleString()}`} tone={summary.budgetRisk > 0 ? "danger" : "normal"} />
        </div>

        <div className="grid gap-4 p-4 xl:grid-cols-[280px_minmax(0,1fr)]">
          <div className="border border-[#2f2d27] bg-[#11110f] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">Daily desk</p>
            <h2 className="mt-3 text-xl font-semibold text-[#f4f1e8]">{userName}</h2>
            <p className="mt-2 text-sm leading-6 text-[#aaa599]">
              先处理逾期、超预算和无人负责的任务，再推进本周到期项。这个页面用于每天开机后快速扫一遍自己和团队的责任队列。
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <MiniStat label="Cost logged" value={`$${summary.loggedCost.toLocaleString()}`} />
              <MiniStat label="Bid" value={`$${summary.estimatedCost.toLocaleString()}`} />
            </div>
          </div>

          <div className="min-w-0 border border-[#2f2d27] bg-[#11110f]">
            <div className="flex items-center justify-between border-b border-[#2f2d27] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">Focus queue</p>
              <span className="text-xs text-[#8f8a7e]">{focusQueue.length} priority items</span>
            </div>
            <div className="divide-y divide-[#24231f]">
              {focusQueue.length ? (
                focusQueue.map((item) => (
                  <Link key={item.task.id} href={taskHref(projectId, item.task.id)} className="grid gap-3 px-4 py-3 text-sm hover:bg-[#181713] xl:grid-cols-[120px_minmax(0,1fr)_160px_120px]">
                    <span className={["w-fit border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]", riskClass(item.tone)].join(" ")}>{item.label}</span>
                    <span className="min-w-0 truncate font-medium text-[#f4f1e8]">{item.task.context.label} / {item.task.name}</span>
                    <span className="font-mono text-xs text-[#aaa599]">{dateRange(item.task)}</span>
                    <span className="text-right font-mono text-xs text-[#e8c678]">${item.task.calculatedCost.toLocaleString()}</span>
                  </Link>
                ))
              ) : (
                <p className="px-4 py-8 text-center text-sm text-[#8f8a7e]">No urgent work in this queue.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border border-[#34322b] bg-[#181713]">
        <div className="grid gap-2 border-b border-[#2a2a28] p-3 lg:grid-cols-[minmax(260px,1fr)_170px_170px_auto_auto]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索任务、镜头、资产、负责人"
            aria-label="Search my tasks"
            className="h-9 border border-[#34322b] bg-[#11110f] px-3 text-sm text-[#f4f1e8] outline-none placeholder:text-[#6e6e69] focus:border-[#d8b46a]"
          />
          <select aria-label="Filter my tasks by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "ALL" | TaskStatus)} className="h-9 border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#c9c3b5] outline-none focus:border-[#d8b46a]">
            <option value="ALL">全部状态</option>
            {taskStatuses.map((status) => (
              <option key={status} value={status}>
                {STATUS_COLORS[status].label}
              </option>
            ))}
          </select>
          <select aria-label="Filter my tasks by risk" value={riskFilter} onChange={(event) => setRiskFilter(event.target.value as RiskFilter)} className="h-9 border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#c9c3b5] outline-none focus:border-[#d8b46a]">
            <option value="ALL">全部风险</option>
            <option value="OVERDUE">逾期</option>
            <option value="DUE_SOON">7 天内到期</option>
            <option value="OVER_BUDGET">超预算</option>
            <option value="UNASSIGNED">未分配</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatusFilter("ALL");
              setRiskFilter("ALL");
            }}
            disabled={!activeFilters}
            className="h-9 border border-[#34322b] px-3 text-xs text-[#c9c3b5] transition hover:border-[#d8b46a] disabled:opacity-45"
          >
            重置
          </button>
          <button
            type="button"
            onClick={() => downloadCsv("my-tasks.csv", buildTaskCsvRows(filteredTasks))}
            className="h-9 border border-[#34322b] px-3 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
          >
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1180px]">
            <div className="grid grid-cols-[120px_1.3fr_150px_150px_130px_150px_130px_96px] border-b border-[#2a2a28] bg-[#1e1e1c] text-[11px] font-medium uppercase tracking-[0.12em] text-[#6e6e69]">
              <HeaderCell>Source</HeaderCell>
              <HeaderCell>Task</HeaderCell>
              <HeaderCell>Status</HeaderCell>
              <HeaderCell>Owner</HeaderCell>
              <HeaderCell>Due</HeaderCell>
              <HeaderCell>Spend</HeaderCell>
              <HeaderCell>Flags</HeaderCell>
              <HeaderCell>Open</HeaderCell>
            </div>
            {filteredTasks.length ? (
              filteredTasks.map((task) => (
                <div key={task.id} className={["grid min-h-14 grid-cols-[120px_1.3fr_150px_150px_130px_150px_130px_96px] border-b border-[#2a2a28] text-sm hover:bg-[#252523]", task.overdue || task.overBudget ? "bg-[#201817]" : ""].join(" ")}>
                  <div className="flex min-w-0 flex-col justify-center px-3">
                    <span className="font-mono text-[11px] uppercase text-[#8f8a7e]">{task.context.kind}</span>
                    <span className="truncate text-xs text-[#c9c3b5]">{task.context.label}</span>
                  </div>
                  <div className="flex min-w-0 flex-col justify-center px-3">
                    <span className="truncate font-medium text-[#4a9eff]">{task.name}</span>
                    <span className="mt-1 text-xs text-[#8f8a7e]">{task.context.secondary}</span>
                  </div>
                  <div className="flex items-center px-3">
                    <select aria-label={`Update ${task.context.label} ${task.name} status`} value={task.status} disabled={pendingId === task.id} onChange={(event) => updateTaskStatus(task.id, event.target.value as TaskStatus)} className="h-8 w-full border border-[#34322b] bg-[#11110f] px-2 text-xs outline-none focus:border-[#d8b46a]">
                      {taskStatuses.map((status) => (
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
                  <div className="flex flex-col justify-center px-3 font-mono text-xs">
                    <span className={task.overdue ? "text-[#ff9a8f]" : task.dueSoon ? "text-[#e8c678]" : "text-[#aaa599]"}>{task.dueDate?.slice(0, 10) ?? "--"}</span>
                    <span className="mt-1 text-[#6e6e69]">{dueCopy(task)}</span>
                  </div>
                  <div className="flex flex-col justify-center px-3 font-mono text-xs">
                    <span className={task.overBudget ? "text-[#ff9a8f]" : "text-[#aaa599]"}>${task.calculatedCost.toLocaleString()}</span>
                    <span className="mt-1 text-[#6e6e69]">bid ${task.estimatedCost?.toLocaleString() ?? "--"}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 px-3">
                    {task.flags.length ? (
                      task.flags.map((flag) => (
                        <span key={flag.label} className={["border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]", riskClass(flag.tone)].join(" ")}>
                          {flag.label}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#7f7a70]">Clean</span>
                    )}
                  </div>
                  <div className="flex items-center px-3">
                    <Link href={taskHref(projectId, task.id)} className="h-8 border border-[#34322b] px-3 py-2 text-xs font-semibold text-[#c9c3b5] hover:border-[#d8b46a] hover:text-[#e8c678]">
                      打开
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="grid min-h-48 place-items-center border-b border-[#2a2a28] text-center">
                <div>
                  <p className="text-sm font-semibold text-[#f4f1e8]">没有匹配任务</p>
                  <p className="mt-2 text-xs text-[#8f8a7e]">调整搜索、状态或风险筛选后再看。</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

type EnrichedTask = TaskTableItem & {
  overdue: boolean;
  dueSoon: boolean;
  daysUntilDue: number | null;
  budgetRisk: number;
  flags: { label: string; tone: "danger" | "warn" | "normal" }[];
};

type FocusQueueItem = {
  task: EnrichedTask;
  label: string;
  tone: "danger" | "warn" | "normal";
  rank: number;
  amount: number;
};

function enrichTask(task: TaskTableItem, today: Date): EnrichedTask {
  const isComplete = completeStatuses.includes(task.status);
  const daysUntilDue = task.dueDate ? daysBetween(today, new Date(task.dueDate)) : null;
  const overdue = !isComplete && daysUntilDue !== null && daysUntilDue < 0;
  const dueSoon = !isComplete && daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7;
  const budgetRisk = task.overBudget ? task.calculatedCost - (task.estimatedCost ?? 0) : 0;
  const flags = [
    overdue ? { label: "overdue", tone: "danger" as const } : null,
    dueSoon ? { label: "due soon", tone: "warn" as const } : null,
    task.overBudget ? { label: "budget", tone: "danger" as const } : null,
    task.assignees.length === 0 && !isComplete ? { label: "owner", tone: "warn" as const } : null,
  ].filter(Boolean) as EnrichedTask["flags"];

  return { ...task, overdue, dueSoon, daysUntilDue, budgetRisk, flags };
}

function buildSummary(tasks: EnrichedTask[]) {
  return {
    total: tasks.length,
    open: tasks.filter((task) => !completeStatuses.includes(task.status)).length,
    overdue: tasks.filter((task) => task.overdue).length,
    dueSoon: tasks.filter((task) => task.dueSoon).length,
    budgetRisk: tasks.reduce((sum, task) => sum + Math.max(0, task.budgetRisk), 0),
    loggedCost: tasks.reduce((sum, task) => sum + task.calculatedCost, 0),
    estimatedCost: tasks.reduce((sum, task) => sum + (task.estimatedCost ?? 0), 0),
  };
}

function buildFocusQueue(tasks: EnrichedTask[]): FocusQueueItem[] {
  return tasks
    .flatMap<FocusQueueItem>((task) => {
      if (task.overdue) return [{ task, label: `${Math.abs(task.daysUntilDue ?? 0)}d late`, tone: "danger" as const, rank: 4, amount: Math.abs(task.daysUntilDue ?? 0) }];
      if (task.overBudget) return [{ task, label: `$${task.budgetRisk.toLocaleString()} over`, tone: "danger" as const, rank: 3, amount: task.budgetRisk }];
      if (task.assignees.length === 0 && !completeStatuses.includes(task.status)) return [{ task, label: "no owner", tone: "warn" as const, rank: 2, amount: task.priority }];
      if (task.dueSoon) return [{ task, label: `due ${task.daysUntilDue}d`, tone: "warn" as const, rank: 1, amount: 7 - (task.daysUntilDue ?? 0) }];
      return [];
    })
    .sort((a, b) => b.rank - a.rank || b.amount - a.amount || b.task.priority - a.task.priority);
}

function filterTasks(tasks: EnrichedTask[], filters: { query: string; statusFilter: "ALL" | TaskStatus; riskFilter: RiskFilter }) {
  const query = filters.query.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesQuery =
      !query ||
      task.name.toLowerCase().includes(query) ||
      task.context.label.toLowerCase().includes(query) ||
      task.context.secondary.toString().toLowerCase().includes(query) ||
      task.assignees.some((assignee) => assignee.name.toLowerCase().includes(query) || (assignee.department ?? "").toLowerCase().includes(query));
    const matchesStatus = filters.statusFilter === "ALL" || task.status === filters.statusFilter;
    const matchesRisk =
      filters.riskFilter === "ALL" ||
      (filters.riskFilter === "OVERDUE" && task.overdue) ||
      (filters.riskFilter === "DUE_SOON" && task.dueSoon) ||
      (filters.riskFilter === "OVER_BUDGET" && task.overBudget) ||
      (filters.riskFilter === "UNASSIGNED" && task.assignees.length === 0);

    return matchesQuery && matchesStatus && matchesRisk;
  });
}

function Metric({ label, value, tone = "normal" }: { label: string; value: string | number; tone?: "normal" | "warn" | "danger" }) {
  const toneClass = tone === "danger" ? "text-[#ff9a8f]" : tone === "warn" ? "text-[#e8c678]" : "text-[#f4f1e8]";
  return (
    <div className="border-b border-r border-[#34322b] px-4 py-3 last:border-r-0 md:border-b-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">{label}</p>
      <p className={["mt-1 font-mono text-lg", toneClass].join(" ")}>{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#2f2d27] bg-[#181713] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#69655c]">{label}</p>
      <p className="mt-1 font-mono text-sm text-[#c9c3b5]">{value}</p>
    </div>
  );
}

function HeaderCell({ children }: { children: React.ReactNode }) {
  return <div className="flex h-9 items-center px-3">{children}</div>;
}

function riskClass(tone: "danger" | "warn" | "normal") {
  if (tone === "danger") return "border-[#6f2f2f] bg-[#2b1717] text-[#ff9a8f]";
  if (tone === "warn") return "border-[#6f5631] bg-[#211b12] text-[#e8c678]";
  return "border-[#294838] bg-[#13221b] text-[#9cccae]";
}

function dueCopy(task: EnrichedTask) {
  if (task.daysUntilDue === null) return "no due";
  if (completeStatuses.includes(task.status)) return "complete";
  if (task.overdue) return `${Math.abs(task.daysUntilDue)}d late`;
  if (task.daysUntilDue === 0) return "today";
  return `${task.daysUntilDue}d left`;
}

function dateRange(task: TaskTableItem) {
  return `${task.startDate?.slice(0, 10) ?? "--"} -> ${task.dueDate?.slice(0, 10) ?? "--"}`;
}

function taskHref(projectId: string, taskId: string) {
  return `/app/projects/${projectId}/tasks?task=${encodeURIComponent(taskId)}`;
}

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function daysBetween(start: Date, end: Date) {
  return Math.floor((startOfDay(end).getTime() - startOfDay(start).getTime()) / 86_400_000);
}

function buildTaskCsvRows(tasks: EnrichedTask[]) {
  return [
    ["source_type", "source", "task", "status", "assignees", "due_date", "days_until_due", "estimated_cost", "calculated_cost", "budget_risk", "flags"],
    ...tasks.map((task) => [
      task.context.kind,
      task.context.label,
      task.name,
      STATUS_COLORS[task.status].label,
      task.assignees.map((assignee) => assignee.name).join(" | "),
      task.dueDate?.slice(0, 10) ?? "",
      task.daysUntilDue ?? "",
      task.estimatedCost ?? "",
      task.calculatedCost,
      task.budgetRisk,
      task.flags.map((flag) => flag.label).join(" | "),
    ]),
  ];
}
