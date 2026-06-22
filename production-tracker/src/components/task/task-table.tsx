"use client";

import * as ContextMenu from "@radix-ui/react-context-menu";
import { useRouter } from "next/navigation";
import { type Dispatch, type SetStateAction, useMemo, useState, useTransition } from "react";
import { DependencyType } from "@/generated/prisma/enums";
import type { TaskStatus } from "@/generated/prisma/enums";

import { contextMenuLabels, getContextMenuLocale } from "@/lib/context-menu-i18n";
import { downloadCsv, downloadXlsx } from "@/lib/csv";
import { STATUS_COLORS } from "@/lib/status-colors";
import type { TaskFormOptions, TaskTableItem } from "@/lib/task-data";

const taskMenuStatuses: TaskStatus[] = ["WAITING_TO_START", "READY_TO_START", "IN_PROGRESS", "PENDING_REVIEW", "APPROVED", "FINAL", "ON_HOLD"];
const demoIdPrefix = "demo-";
const demoProjectId = "demo-mkali-mission";
const fallbackCostPerDay = 8_000;

export function TaskTable({
  projectId,
  tasks,
  options,
  onTasksChange,
}: {
  projectId: string;
  tasks: TaskTableItem[];
  options: TaskFormOptions;
  onTasksChange: Dispatch<SetStateAction<TaskTableItem[]>>;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [dependencyTask, setDependencyTask] = useState<TaskTableItem | null>(null);
  const [editTask, setEditTask] = useState<TaskTableItem | null>(null);
  const [noteTask, setNoteTask] = useState<TaskTableItem | null>(null);
  const [assignmentTask, setAssignmentTask] = useState<TaskTableItem | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TaskStatus>("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [, startTransition] = useTransition();

  const summary = useMemo(() => {
    const totalBudget = tasks.reduce((sum, task) => sum + (task.estimatedCost ?? 0), 0);
    const totalActual = tasks.reduce((sum, task) => sum + task.calculatedCost, 0);
    const blocked = tasks.filter((task) => task.status === "ON_HOLD" || task.overBudget).length;

    return { totalBudget, totalActual, blocked };
  }, [tasks]);
  const filteredTasks = useMemo(() => filterTasks(tasks, { query, statusFilter, assigneeFilter }), [assigneeFilter, query, statusFilter, tasks]);
  const activeFilterCount = [query.trim(), statusFilter !== "ALL", assigneeFilter !== "ALL"].filter(Boolean).length;
  const selectedTaskIdSet = useMemo(() => new Set(selectedTaskIds), [selectedTaskIds]);
  const selectedTasks = useMemo(() => tasks.filter((task) => selectedTaskIdSet.has(task.id)), [selectedTaskIdSet, tasks]);
  const filteredTaskIds = useMemo(() => filteredTasks.map((task) => task.id), [filteredTasks]);
  const allFilteredSelected = filteredTaskIds.length > 0 && filteredTaskIds.every((id) => selectedTaskIdSet.has(id));
  const selectedBudget = selectedTasks.reduce((sum, task) => sum + (task.estimatedCost ?? 0), 0);
  const selectedActual = selectedTasks.reduce((sum, task) => sum + task.calculatedCost, 0);

  function patchLocalTask(taskId: string, payload: Record<string, unknown>) {
    onTasksChange((current) => current.map((task) => (task.id === taskId ? applyTaskPatch(task, payload) : task)));
    setDependencyTask((current) => (current?.id === taskId ? applyTaskPatch(current, payload) : current));
    setEditTask((current) => (current?.id === taskId ? applyTaskPatch(current, payload) : current));
    setNoteTask((current) => (current?.id === taskId ? applyTaskPatch(current, payload) : current));
    setAssignmentTask((current) => (current?.id === taskId ? applyTaskPatch(current, payload) : current));
  }

  function keepTaskVisibleAfterEdit(task: TaskTableItem) {
    const queryMatches = filterTasks([task], { query, statusFilter: "ALL", assigneeFilter: "ALL" }).length > 0;

    if (query.trim() && !queryMatches) {
      setQuery(task.name);
    }

    if (statusFilter !== "ALL" && task.status !== statusFilter) {
      setStatusFilter(task.status);
    }

    if (assigneeFilter !== "ALL" && !task.assignees.some((assignee) => assignee.id === assigneeFilter)) {
      setAssigneeFilter("ALL");
    }
  }

  async function patchTask(taskId: string, payload: Record<string, unknown>, errorMessage = "更新任务失败。") {
    setPendingId(taskId);
    setMessage(null);

    if (isDemoTask(projectId, taskId)) {
      patchLocalTask(taskId, payload);
      setPendingId(null);
      setMessage("演示任务已更新。");
      return true;
    }

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage(errorMessage);
      return false;
    }

    startTransition(() => router.refresh());
    return true;
  }

  function toggleTaskSelection(taskId: string, selected: boolean) {
    setSelectedTaskIds((current) => {
      if (selected) return current.includes(taskId) ? current : [...current, taskId];
      return current.filter((id) => id !== taskId);
    });
  }

  function toggleFilteredSelection(selected: boolean) {
    setSelectedTaskIds((current) => {
      if (!selected) return current.filter((id) => !filteredTaskIds.includes(id));
      const next = new Set(current);
      for (const id of filteredTaskIds) next.add(id);
      return Array.from(next);
    });
  }

  async function bulkSetStatus(status: TaskStatus) {
    if (selectedTaskIds.length === 0) return;

    const taskIds = [...selectedTaskIds];
    setPendingId("bulk-status");
    setMessage(null);

    if (taskIds.every((taskId) => isDemoTask(projectId, taskId))) {
      onTasksChange((current) => current.map((task) => (taskIds.includes(task.id) ? applyTaskPatch(task, { status }) : task)));
      setPendingId(null);
      setSelectedTaskIds([]);
      setMessage(`已更新 ${taskIds.length} 个演示任务。`);
      return;
    }

    const responses = await Promise.all(
      taskIds.map((taskId) =>
        fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }),
      ),
    );

    setPendingId(null);

    if (responses.some((response) => !response.ok)) {
      setMessage("批量更新任务状态失败，请检查权限或任务状态。");
      return;
    }

    setSelectedTaskIds([]);
    setMessage(`已更新 ${taskIds.length} 个任务。`);
    startTransition(() => router.refresh());
  }

  async function deleteTask(taskId: string) {
    setPendingId(taskId);
    setMessage(null);

    if (isDemoTask(projectId, taskId)) {
      onTasksChange((current) =>
        current
          .filter((task) => task.id !== taskId)
          .map((task) => ({
            ...task,
            predecessors: task.predecessors.filter((dependency) => dependency.taskId !== taskId),
            successors: task.successors.filter((dependency) => dependency.taskId !== taskId),
          })),
      );
      setPendingId(null);
      setEditTask((current) => (current?.id === taskId ? null : current));
      setNoteTask((current) => (current?.id === taskId ? null : current));
      setAssignmentTask((current) => (current?.id === taskId ? null : current));
      setDependencyTask((current) => (current?.id === taskId ? null : current));
      setMessage("演示任务已删除。");
      return;
    }

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

    if (isDemoTask(projectId, taskId)) {
      onTasksChange((current) => addLocalDependency(current, taskId, predecessorId, type, lagDays));
      setPendingId(null);
      setDependencyTask(null);
      setMessage("演示依赖已添加。");
      return;
    }

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

    if (isDemoTask(projectId, taskId)) {
      onTasksChange((current) => removeLocalDependency(current, taskId, dependencyId));
      setPendingId(null);
      setMessage("演示依赖已移除。");
      return;
    }

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
    const url = `${window.location.origin}/app/projects/${projectId}/tasks?task=${encodeURIComponent(taskId)}`;
    await navigator.clipboard.writeText(url).catch(() => undefined);
    setMessage("Task URL 已复制。");
  }

  async function addNote(taskId: string, content: string) {
    setPendingId(`note:${taskId}`);
    setMessage(null);

    if (isDemoTask(projectId, taskId)) {
      patchLocalTask(taskId, { noteCountDelta: 1 });
      setPendingId(null);
      setNoteTask(null);
      setMessage("演示备注已添加。");
      return;
    }

    const response = await fetch(`/api/tasks/${taskId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("添加备注失败。");
      return;
    }

    setNoteTask(null);
    startTransition(() => router.refresh());
  }

  async function assignTask(taskId: string, assigneeId: string, reviewerId: string | null) {
    setPendingId(`assign:${taskId}`);
    setMessage(null);

    if (isDemoTask(projectId, taskId)) {
      const assignee = options.users.find((user) => user.id === assigneeId);
      patchLocalTask(taskId, {
        assignees: assignee ? [assignee] : [],
        reviewerIds: reviewerId ? [reviewerId] : [],
      });
      setPendingId(null);
      setAssignmentTask(null);
      setMessage("演示分配已更新。");
      return;
    }

    const task = tasks.find((item) => item.id === taskId);
    const removalResponses = await Promise.all(
      (task?.assignees ?? [])
        .filter((assignee) => assignee.id !== assigneeId)
        .map((assignee) =>
          fetch(`/api/tasks/${taskId}/assign/${assignee.id}`, {
            method: "DELETE",
          }),
        ),
    );
    const response = assigneeId
      ? await fetch(`/api/tasks/${taskId}/assign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: assigneeId, reviewerId }),
        })
      : null;

    setPendingId(null);

    if (removalResponses.some((item) => !item.ok) || (response && !response.ok)) {
      setMessage("更新任务分配失败。");
      return;
    }

    setAssignmentTask(null);
    startTransition(() => router.refresh());
  }

  function openVersions(task: TaskTableItem) {
    router.push(`/app/projects/${projectId}/media?task=${encodeURIComponent(task.id)}&context=${encodeURIComponent(task.context.label)}`);
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

      <div className="mb-3 grid gap-2 border border-[#34322b] bg-[#181713] p-3 lg:grid-cols-[minmax(240px,1fr)_170px_210px_auto_auto_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索任务、镜头、资产、负责人"
          className="h-9 border border-[#34322b] bg-[#11110f] px-3 text-sm text-[#f4f1e8] outline-none placeholder:text-[#6e6e69] focus:border-[#d8b46a]"
        />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "ALL" | TaskStatus)} className="h-9 border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#c9c3b5] outline-none focus:border-[#d8b46a]">
          <option value="ALL">全部状态</option>
          {taskMenuStatuses.map((status) => (
            <option key={status} value={status}>
              {STATUS_COLORS[status].label}
            </option>
          ))}
        </select>
        <select value={assigneeFilter} onChange={(event) => setAssigneeFilter(event.target.value)} className="h-9 border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#c9c3b5] outline-none focus:border-[#d8b46a]">
          <option value="ALL">全部负责人</option>
          {options.users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.department ?? "General"} / {user.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setStatusFilter("ALL");
            setAssigneeFilter("ALL");
          }}
          disabled={!activeFilterCount}
          className="h-9 border border-[#34322b] px-3 text-xs text-[#c9c3b5] transition hover:border-[#d8b46a] disabled:opacity-45"
        >
          重置
        </button>
        <button
          type="button"
          onClick={() => downloadCsv("task-status-report.csv", buildTaskCsvRows(filteredTasks))}
          className="h-9 border border-[#34322b] px-3 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
        >
          Export CSV
        </button>
        <button
          type="button"
          onClick={() => downloadXlsx("task-status-report.xlsx", buildTaskCsvRows(filteredTasks), "Tasks")}
          className="h-9 border border-[#34322b] px-3 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
        >
          Export XLSX
        </button>
      </div>

      {selectedTasks.length ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border border-[#4b432f] bg-[#1f1b12] px-3 py-2 text-sm">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#c9c3b5]">
            <span className="font-semibold uppercase tracking-[0.16em] text-[#e8c678]">{selectedTasks.length} selected</span>
            <span className="font-mono">Budget ${selectedBudget.toLocaleString()}</span>
            <span className={["font-mono", selectedActual > selectedBudget && selectedBudget > 0 ? "text-[#ff9a8f]" : "text-[#aaa599]"].join(" ")}>
              Logged ${selectedActual.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value=""
              disabled={pendingId === "bulk-status"}
              onChange={(event) => {
                if (event.target.value) void bulkSetStatus(event.target.value as TaskStatus);
                event.currentTarget.value = "";
              }}
              className="h-8 border border-[#4b432f] bg-[#11110f] px-2 text-xs text-[#f4f1e8] outline-none focus:border-[#d8b46a]"
            >
              <option value="">批量改状态</option>
              {taskMenuStatuses.map((status) => (
                <option key={status} value={status}>
                  {STATUS_COLORS[status].label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => downloadCsv("selected-task-status-report.csv", buildTaskCsvRows(selectedTasks))}
              className="h-8 border border-[#4b432f] px-3 text-xs font-semibold text-[#c9c3b5] hover:border-[#d8b46a] hover:text-[#e8c678]"
            >
              Export selected
            </button>
            <button
              type="button"
              onClick={() => downloadXlsx("selected-task-status-report.xlsx", buildTaskCsvRows(selectedTasks), "Selected Tasks")}
              className="h-8 border border-[#4b432f] px-3 text-xs font-semibold text-[#c9c3b5] hover:border-[#d8b46a] hover:text-[#e8c678]"
            >
              Excel selected
            </button>
            <button
              type="button"
              onClick={() => setSelectedTaskIds([])}
              className="h-8 border border-[#4b432f] px-3 text-xs text-[#aaa599] hover:border-[#d8b46a] hover:text-[#f4f1e8]"
            >
              清空选择
            </button>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden border border-[#34322b] bg-[#181713]">
        <div className="grid grid-cols-[44px_110px_1.2fr_120px_160px_120px_120px_120px_120px_1fr_170px] border-b border-[#2a2a28] bg-[#1e1e1c] text-[11px] font-medium uppercase tracking-[0.12em] text-[#6e6e69]">
          <div className="flex h-9 items-center justify-center px-2">
            <input
              type="checkbox"
              aria-label="选择当前筛选的任务"
              checked={allFilteredSelected}
              onChange={(event) => toggleFilteredSelection(event.target.checked)}
              className="size-4 accent-[#d8b46a]"
            />
          </div>
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

        {filteredTasks.length ? filteredTasks.map((task) => (
          <ContextMenu.Root key={task.id}>
            <ContextMenu.Trigger asChild>
              <div
                className={[
                  "grid min-h-14 grid-cols-[44px_110px_1.2fr_120px_160px_120px_120px_120px_120px_1fr_170px] border-b border-[#2a2a28] text-sm hover:bg-[#252523]",
                  task.overBudget ? "bg-[#211717]" : "",
                  selectedTaskIdSet.has(task.id) ? "outline outline-1 -outline-offset-1 outline-[#d8b46a]/45" : "",
                ].join(" ")}
              >
                <div className="flex items-center justify-center px-2">
                  <input
                    type="checkbox"
                    aria-label={`选择任务 ${task.name}`}
                    checked={selectedTaskIdSet.has(task.id)}
                    onChange={(event) => toggleTaskSelection(task.id, event.target.checked)}
                    onClick={(event) => event.stopPropagation()}
                    className="size-4 accent-[#d8b46a]"
                  />
                </div>
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
              onEdit={() => setEditTask(task)}
              onOpenVersions={() => openVersions(task)}
              onAddNote={() => setNoteTask(task)}
              onAssign={() => setAssignmentTask(task)}
              onEditDates={() => setEditTask(task)}
              onSetStatus={(status) => patchTask(task.id, { status })}
              onAddDependency={() => setDependencyTask(task)}
            />
          </ContextMenu.Root>
        )) : (
          <div className="grid min-h-44 place-items-center border-t border-[#2a2a28] text-center">
            <div>
              <p className="text-sm font-semibold text-[#f4f1e8]">没有匹配的任务</p>
              <p className="mt-2 text-xs text-[#8f8a7e]">调整搜索、状态或负责人筛选后再看。</p>
            </div>
          </div>
        )}
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
      {editTask ? (
        <TaskEditDialog
          task={editTask}
          pending={pendingId === editTask.id}
          onClose={() => setEditTask(null)}
          onSave={async (payload) => {
            const updatedTask = applyTaskPatch(editTask, payload);
            const saved = await patchTask(editTask.id, payload);
            if (saved) {
              keepTaskVisibleAfterEdit(updatedTask);
              setEditTask(null);
            }
          }}
        />
      ) : null}
      {noteTask ? (
        <TaskNoteDialog
          task={noteTask}
          pending={pendingId === `note:${noteTask.id}`}
          onClose={() => setNoteTask(null)}
          onCreate={(content) => addNote(noteTask.id, content)}
        />
      ) : null}
      {assignmentTask ? (
        <AssignmentDialog
          task={assignmentTask}
          users={options.users}
          pending={pendingId === `assign:${assignmentTask.id}`}
          onClose={() => setAssignmentTask(null)}
          onSave={(assigneeId, reviewerId) => assignTask(assignmentTask.id, assigneeId, reviewerId)}
        />
      ) : null}
    </div>
  );
}

function TaskContextMenu({
  task,
  onCopy,
  onDelete,
  onEdit,
  onOpenVersions,
  onAddNote,
  onAssign,
  onEditDates,
  onSetStatus,
  onAddDependency,
}: {
  task: TaskTableItem;
  onCopy: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onOpenVersions: () => void;
  onAddNote: () => void;
  onAssign: () => void;
  onEditDates: () => void;
  onSetStatus: (status: TaskStatus) => void;
  onAddDependency: () => void;
}) {
  const menu = contextMenuLabels[getContextMenuLocale()];

  return (
    <ContextMenu.Portal>
      <ContextMenu.Content className="z-50 min-w-64 border border-[#3b382f] bg-[#181713] p-1 text-sm text-[#d8d3c7] shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <ContextMenu.Label className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">
          {task.name} — {task.context.label}
        </ContextMenu.Label>
        <MenuItem onSelect={onEdit}>✎ {menu.task.edit}</MenuItem>
        <MenuItem onSelect={onOpenVersions}>▶ {menu.task.openVersions}</MenuItem>
        <MenuItem onSelect={onAddNote}>⌕ {menu.task.addNote}</MenuItem>
        <MenuItem onSelect={onCopy}>⌘ {menu.task.copyUrl}</MenuItem>
        <Separator />
        <ContextMenu.Label className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">{menu.groups.status}</ContextMenu.Label>
        {taskMenuStatuses.map((status) => (
          <MenuItem key={status} onSelect={() => onSetStatus(status)}>
            <span className="mr-2 inline-block size-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[status].dot }} />
            {STATUS_COLORS[status].label}
          </MenuItem>
        ))}
        <Separator />
        <MenuItem onSelect={onAssign}>👤 {menu.task.assign}</MenuItem>
        <MenuItem onSelect={onEditDates}>📅 {menu.task.editDates}</MenuItem>
        <Separator />
        <MenuItem onSelect={onAddDependency}>↔ {menu.task.addDependency}</MenuItem>
        <Separator />
        <MenuItem danger onSelect={onDelete}>
          {menu.task.delete}
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

function TaskEditDialog({
  task,
  pending,
  onClose,
  onSave,
}: {
  task: TaskTableItem;
  pending: boolean;
  onClose: () => void;
  onSave: (payload: Record<string, unknown>) => void;
}) {
  const [draft, setDraft] = useState({
    name: task.name,
    status: task.status,
    priority: String(task.priority),
    startDate: toDateInputValue(task.startDate),
    dueDate: toDateInputValue(task.dueDate),
    duration: task.duration?.toString() ?? "",
    timeLogged: task.timeLogged.toString(),
    estimatedCost: task.estimatedCost?.toString() ?? "",
  });
  const isInvalid = draft.name.trim().length < 2 || Boolean(draft.startDate && draft.dueDate && new Date(draft.dueDate) < new Date(draft.startDate));

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/62 px-6">
      <div className="w-full max-w-3xl border border-[#3d392f] bg-[#181713] shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-[#34322b] px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Task</p>
            <h2 className="mt-1 text-xl font-semibold text-[#f4f1e8]">编辑 {task.context.label} / {task.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-[#aaa599] hover:text-[#f4f1e8]">
            关闭
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 p-5">
          <label className="col-span-2 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Task Name</span>
            <input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Status</span>
            <select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as TaskStatus }))} className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]">
              {taskMenuStatuses.map((status) => (
                <option key={status} value={status}>{STATUS_COLORS[status].label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Start</span>
            <input type="date" value={draft.startDate} onChange={(event) => setDraft((current) => ({ ...current, startDate: event.target.value }))} className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Due</span>
            <input type="date" value={draft.dueDate} onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))} className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Duration</span>
            <input type="number" min={0} value={draft.duration} onChange={(event) => setDraft((current) => ({ ...current, duration: event.target.value }))} className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Priority</span>
            <select value={draft.priority} onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value }))} className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]">
              <option value="0">Normal</option>
              <option value="1">High</option>
              <option value="2">Critical</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Logged Days</span>
            <input type="number" min={0} step="0.5" value={draft.timeLogged} onChange={(event) => setDraft((current) => ({ ...current, timeLogged: event.target.value }))} className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Budget</span>
            <input type="number" min={0} value={draft.estimatedCost} onChange={(event) => setDraft((current) => ({ ...current, estimatedCost: event.target.value }))} className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]" />
          </label>
          {isInvalid ? <p className="col-span-3 text-xs text-[#e28b81]">请填写任务名称，并确认结束日期不早于开始日期。</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#34322b] px-5 py-4">
          <button type="button" onClick={onClose} className="h-10 border border-[#3f3c33] px-4 text-sm text-[#c9c3b5]">
            取消
          </button>
          <button
            type="button"
            disabled={pending || isInvalid}
            onClick={() =>
              onSave({
                name: draft.name.trim(),
                status: draft.status,
                priority: Number(draft.priority),
                startDate: draft.startDate || null,
                dueDate: draft.dueDate || null,
                duration: draft.duration ? Number(draft.duration) : null,
                timeLogged: draft.timeLogged ? Number(draft.timeLogged) : 0,
                estimatedCost: draft.estimatedCost ? Number(draft.estimatedCost) : null,
              })
            }
            className="h-10 bg-[#378add] px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? "保存中..." : "保存任务"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskNoteDialog({ task, pending, onClose, onCreate }: { task: TaskTableItem; pending: boolean; onClose: () => void; onCreate: (content: string) => void }) {
  const [content, setContent] = useState("");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/62 px-6">
      <div className="w-full max-w-xl border border-[#3d392f] bg-[#181713] shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-[#34322b] px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Note</p>
            <h2 className="mt-1 text-xl font-semibold text-[#f4f1e8]">给 {task.name} 添加备注</h2>
          </div>
          <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-[#aaa599] hover:text-[#f4f1e8]">
            关闭
          </button>
        </div>
        <div className="p-5">
          <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={6} placeholder="记录审片意见、供应商付款条件、下一步责任人..." className="w-full resize-none border border-[#34322b] bg-[#11110f] px-3 py-3 text-sm leading-6 text-[#f4f1e8] outline-none focus:border-[#d8b46a]" />
        </div>
        <div className="flex justify-end gap-2 border-t border-[#34322b] px-5 py-4">
          <button type="button" onClick={onClose} className="h-10 border border-[#3f3c33] px-4 text-sm text-[#c9c3b5]">取消</button>
          <button type="button" disabled={pending || !content.trim()} onClick={() => onCreate(content.trim())} className="h-10 bg-[#378add] px-5 text-sm font-semibold text-white disabled:opacity-50">
            {pending ? "保存中..." : "添加备注"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AssignmentDialog({
  task,
  users,
  pending,
  onClose,
  onSave,
}: {
  task: TaskTableItem;
  users: TaskFormOptions["users"];
  pending: boolean;
  onClose: () => void;
  onSave: (assigneeId: string, reviewerId: string | null) => void;
}) {
  const [assigneeId, setAssigneeId] = useState(task.assignees[0]?.id ?? "");
  const [reviewerId, setReviewerId] = useState(task.reviewerIds[0] ?? "");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/62 px-6">
      <div className="w-full max-w-2xl border border-[#3d392f] bg-[#181713] shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-[#34322b] px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Assignment</p>
            <h2 className="mt-1 text-xl font-semibold text-[#f4f1e8]">分配 {task.context.label} / {task.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-[#aaa599] hover:text-[#f4f1e8]">关闭</button>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Assignee</span>
            <select value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)} className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]">
              <option value="">未分配</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.department ?? "General"} / {user.name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Reviewer</span>
            <select value={reviewerId} onChange={(event) => setReviewerId(event.target.value)} className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]">
              <option value="">无</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.department ?? "General"} / {user.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-[#34322b] px-5 py-4">
          <button type="button" onClick={onClose} className="h-10 border border-[#3f3c33] px-4 text-sm text-[#c9c3b5]">取消</button>
          <button type="button" disabled={pending} onClick={() => onSave(assigneeId, reviewerId || null)} className="h-10 bg-[#378add] px-5 text-sm font-semibold text-white disabled:opacity-50">
            {pending ? "保存中..." : "保存分配"}
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

function isDemoTask(projectId: string, taskId: string) {
  return projectId === demoProjectId || taskId.startsWith(demoIdPrefix);
}

function applyTaskPatch(task: TaskTableItem, payload: Record<string, unknown>): TaskTableItem {
  const timeLogged = typeof payload.timeLogged === "number" ? payload.timeLogged : task.timeLogged;
  const estimatedCost = payload.estimatedCost === null || typeof payload.estimatedCost === "number" ? payload.estimatedCost : task.estimatedCost;
  const calculatedCost = Math.round(timeLogged * fallbackCostPerDay);

  return {
    ...task,
    name: typeof payload.name === "string" ? payload.name : task.name,
    status: typeof payload.status === "string" ? (payload.status as TaskStatus) : task.status,
    priority: typeof payload.priority === "number" ? payload.priority : task.priority,
    startDate: payload.startDate === null ? null : typeof payload.startDate === "string" ? `${payload.startDate.slice(0, 10)}T00:00:00.000Z` : task.startDate,
    dueDate: payload.dueDate === null ? null : typeof payload.dueDate === "string" ? `${payload.dueDate.slice(0, 10)}T00:00:00.000Z` : task.dueDate,
    duration: payload.duration === null || typeof payload.duration === "number" ? payload.duration : task.duration,
    timeLogged,
    estimatedCost,
    calculatedCost,
    overBudget: typeof estimatedCost === "number" && calculatedCost > estimatedCost,
    assignees: Array.isArray(payload.assignees) ? (payload.assignees as TaskTableItem["assignees"]) : task.assignees,
    reviewerIds: Array.isArray(payload.reviewerIds) ? (payload.reviewerIds as string[]) : task.reviewerIds,
    noteCount: typeof payload.noteCountDelta === "number" ? task.noteCount + payload.noteCountDelta : task.noteCount,
  };
}

function addLocalDependency(tasks: TaskTableItem[], taskId: string, predecessorId: string, type: DependencyType, lagDays: number): TaskTableItem[] {
  const predecessor = tasks.find((task) => task.id === predecessorId);
  if (!predecessor) return tasks;

  const dependency = {
    id: `demo-dependency-${predecessorId}-${taskId}-${Date.now()}`,
    type,
    lagDays,
    taskId: predecessor.id,
    taskName: predecessor.name,
    contextLabel: predecessor.context.label,
  };

  return tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, predecessors: [...task.predecessors, dependency] };
    }

    if (task.id === predecessorId) {
      return {
        ...task,
        successors: [
          ...task.successors,
          {
            id: dependency.id,
            type,
            lagDays,
            taskId,
            taskName: tasks.find((item) => item.id === taskId)?.name ?? taskId,
            contextLabel: tasks.find((item) => item.id === taskId)?.context.label ?? "Task",
          },
        ],
      };
    }

    return task;
  });
}

function removeLocalDependency(tasks: TaskTableItem[], taskId: string, dependencyId: string): TaskTableItem[] {
  return tasks.map((task) => ({
    ...task,
    predecessors: task.id === taskId ? task.predecessors.filter((dependency) => dependency.id !== dependencyId) : task.predecessors,
    successors: task.successors.filter((dependency) => dependency.id !== dependencyId),
  }));
}

function filterTasks(tasks: TaskTableItem[], filters: { query: string; statusFilter: "ALL" | TaskStatus; assigneeFilter: string }) {
  const lowered = filters.query.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesQuery =
      !lowered ||
      task.name.toLowerCase().includes(lowered) ||
      task.context.label.toLowerCase().includes(lowered) ||
      task.context.secondary.toString().toLowerCase().includes(lowered) ||
      task.assignees.some((assignee) => assignee.name.toLowerCase().includes(lowered) || (assignee.department ?? "").toLowerCase().includes(lowered));
    const matchesStatus = filters.statusFilter === "ALL" || task.status === filters.statusFilter;
    const matchesAssignee = filters.assigneeFilter === "ALL" || task.assignees.some((assignee) => assignee.id === filters.assigneeFilter);

    return matchesQuery && matchesStatus && matchesAssignee;
  });
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
