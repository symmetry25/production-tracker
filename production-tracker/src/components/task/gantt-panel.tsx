"use client";

import { gantt } from "dhtmlx-gantt";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { Task } from "dhtmlx-gantt";

import { STATUS_COLORS } from "@/lib/status-colors";
import type { TaskTableItem } from "@/lib/task-data";

const dependencyTypeToGantt: Record<string, string> = {
  FS: "0",
  SS: "1",
  FF: "2",
  SF: "3",
};

const ganttTypeToDependency: Record<string, string> = {
  "0": "FS",
  "1": "SS",
  "2": "FF",
  "3": "SF",
};

export function GanttPanel({ tasks }: { tasks: TaskTableItem[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const ganttData = useMemo(() => buildGanttData(tasks), [tasks]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    gantt.config.date_format = "%Y-%m-%d";
    gantt.config.drag_progress = false;
    gantt.config.row_height = 36;
    gantt.config.bar_height = 20;
    gantt.config.grid_width = 390;
    gantt.config.columns = [
      { name: "text", label: "Task", tree: true, width: 220 },
      { name: "owner", label: "Owner", width: 92, align: "left" },
      { name: "duration", label: "Dur", width: 54, align: "center" },
    ];
    gantt.config.scales = [
      { unit: "month", step: 1, format: "%M %Y" },
      { unit: "day", step: 1, format: "%d" },
    ];
    gantt.config.readonly = false;
    gantt.config.details_on_dblclick = false;
    gantt.templates.task_class = (_, __, task) => `status_${String(task.status ?? "WAITING_TO_START").toLowerCase()}`;
    gantt.templates.tooltip_text = (_, __, task) => {
      const status = String(task.status ?? "WAITING_TO_START");
      return [
        `<b>${task.text}</b>`,
        `<br/>Status: ${STATUS_COLORS[status as keyof typeof STATUS_COLORS]?.label ?? status}`,
        `<br/>Owner: ${task.owner ?? "Unassigned"}`,
        `<br/>Budget: ${task.budget ?? "--"}`,
      ].join("");
    };

    gantt.init(containerRef.current);
    gantt.clearAll();
    gantt.parse(ganttData);

    const dragHandlerId = gantt.attachEvent("onAfterTaskDrag", (id) => {
      const item = gantt.getTask(id) as Task & { isProjectRow?: boolean };

      if (item.isProjectRow) {
        return;
      }

      const startDate = toIsoDate(item.start_date);
      const dueDate = toIsoDate(item.end_date);

      void patchTaskDates(String(id), startDate, dueDate, item.duration ?? null).then((ok) => {
        if (!ok) {
          setMessage("甘特图日期保存失败。");
          return;
        }

        startTransition(() => window.location.reload());
      });
    });

    const linkAddHandlerId = gantt.attachEvent("onAfterLinkAdd", (id, link) => {
      void fetch(`/api/tasks/${link.target}/dependencies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          predecessorId: String(link.source),
          type: ganttTypeToDependency[link.type] ?? "FS",
          lagDays: link.lag ?? 0,
        }),
      }).then((response) => {
        if (!response.ok) {
          setMessage("甘特图依赖保存失败。");
          gantt.deleteLink(id);
          return;
        }

        startTransition(() => window.location.reload());
      });
    });

    return () => {
      gantt.detachEvent(dragHandlerId);
      gantt.detachEvent(linkAddHandlerId);
      gantt.clearAll();
    };
  }, [ganttData, startTransition]);

  if (tasks.length === 0) {
    return (
      <div className="grid min-h-72 place-items-center border border-dashed border-[#3f3c33] bg-[#181713] p-10 text-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">No timeline</p>
          <h2 className="mt-3 text-2xl font-semibold">暂无可排期任务</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#aaa599]">给任务添加开始和截止日期后，甘特图会显示可拖动的制作时间线。</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {message ? <div className="mb-3 border border-[#3f3c33] bg-[#181713] px-3 py-2 text-sm text-[#d8b46a]">{message}</div> : null}
      <div className="h-[680px] overflow-hidden border border-[#34322b] bg-[#181713]">
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}

function buildGanttData(tasks: TaskTableItem[]) {
  const groups = new Map<string, { id: string; text: string }>();
  const data = [];
  const links = [];

  for (const task of tasks) {
    const groupId = `${task.context.kind}:${task.context.id ?? "none"}`;

    if (!groups.has(groupId)) {
      groups.set(groupId, { id: groupId, text: `${task.context.label} · ${task.context.secondary}` });
    }
  }

  for (const group of groups.values()) {
    data.push({
      id: group.id,
      text: group.text,
      type: "project",
      open: true,
      readonly: true,
      isProjectRow: true,
    });
  }

  for (const task of tasks) {
    const groupId = `${task.context.kind}:${task.context.id ?? "none"}`;
    const startDate = task.startDate ? task.startDate.slice(0, 10) : task.dueDate ? task.dueDate.slice(0, 10) : undefined;
    const duration = task.duration ?? inferDuration(task.startDate, task.dueDate) ?? 1;

    data.push({
      id: task.id,
      text: task.name,
      start_date: startDate,
      duration,
      parent: groupId,
      progress: progressForStatus(task.status),
      status: task.status,
      owner: task.assignees.map((assignee) => assignee.name).join(", ") || "Unassigned",
      budget: task.estimatedCost ? `$${task.estimatedCost.toLocaleString()}` : "--",
      color: STATUS_COLORS[task.status].dot,
    });

    for (const dependency of task.predecessors) {
      links.push({
        id: dependency.id,
        source: dependency.taskId,
        target: task.id,
        type: dependencyTypeToGantt[dependency.type] ?? "0",
        lag: dependency.lagDays,
      });
    }
  }

  return { data, links };
}

function inferDuration(startDate: string | null, dueDate: string | null): number | null {
  if (!startDate || !dueDate) {
    return null;
  }

  const start = new Date(startDate).getTime();
  const due = new Date(dueDate).getTime();
  const days = Math.ceil((due - start) / 86_400_000);

  return Math.max(1, days);
}

function progressForStatus(status: TaskTableItem["status"]) {
  switch (status) {
    case "WAITING_TO_START":
      return 0;
    case "READY_TO_START":
      return 0.1;
    case "IN_PROGRESS":
      return 0.45;
    case "PENDING_REVIEW":
      return 0.78;
    case "APPROVED":
      return 0.92;
    case "FINAL":
      return 1;
    case "ON_HOLD":
    case "OMIT":
      return 0.2;
  }
}

function toIsoDate(date: Date | undefined): string | null {
  return date ? date.toISOString().slice(0, 10) : null;
}

async function patchTaskDates(taskId: string, startDate: string | null, dueDate: string | null, duration: number | null) {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ startDate, dueDate, duration }),
  });

  return response.ok;
}
