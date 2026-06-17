"use client";

import { useState } from "react";

import { GanttPanel } from "@/components/task/gantt-panel";
import { TaskTable } from "@/components/task/task-table";
import type { TaskTableItem } from "@/lib/task-data";

export function TaskWorkspace({ tasks }: { tasks: TaskTableItem[] }) {
  const [view, setView] = useState<"table" | "gantt">("table");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between border border-[#34322b] bg-[#181713] px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-[#8f8a7e]">
          <span className="font-semibold uppercase tracking-[0.18em] text-[#d8b46a]">View</span>
          <span>{tasks.length} tasks</span>
        </div>
        <div className="grid grid-cols-2 overflow-hidden border border-[#3f3c33] bg-[#11110f] text-xs">
          <button
            type="button"
            onClick={() => setView("table")}
            className={["h-8 px-4 font-semibold", view === "table" ? "bg-[#2b2924] text-[#f4f1e8]" : "text-[#8f8a7e] hover:text-[#f4f1e8]"].join(" ")}
          >
            Table
          </button>
          <button
            type="button"
            onClick={() => setView("gantt")}
            className={["h-8 px-4 font-semibold", view === "gantt" ? "bg-[#2b2924] text-[#f4f1e8]" : "text-[#8f8a7e] hover:text-[#f4f1e8]"].join(" ")}
          >
            Gantt
          </button>
        </div>
      </div>

      {view === "table" ? <TaskTable tasks={tasks} /> : <GanttPanel tasks={tasks} />}
    </div>
  );
}
