"use client";

import { useState } from "react";

import { CreateTaskForm } from "@/components/task/create-task-form";
import { GanttPanel } from "@/components/task/gantt-panel";
import { TaskTable } from "@/components/task/task-table";
import { buildScheduleSuggestions, type ScheduleSuggestion, type ScheduleSuggestionSummary } from "@/lib/schedule-suggestions";
import type { TaskFormOptions, TaskTableItem } from "@/lib/task-data";

export function TaskWorkspace({
  projectId,
  tasks,
  options,
  scheduleSuggestions,
  analysisDate,
}: {
  projectId: string;
  tasks: TaskTableItem[];
  options: TaskFormOptions;
  scheduleSuggestions: ScheduleSuggestionSummary | null;
  analysisDate: string;
}) {
  const [taskItems, setTaskItems] = useState(tasks);
  const [view, setView] = useState<"table" | "gantt">("table");
  const [showSuggestions, setShowSuggestions] = useState(Boolean(scheduleSuggestions?.criticalCount || scheduleSuggestions?.warningCount));
  const currentScheduleSuggestions = buildScheduleSuggestions({ projectId, tasks: taskItems, now: new Date(analysisDate), provider: scheduleSuggestions?.provider ?? "rules" });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between border border-[#34322b] bg-[#181713] px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-[#8f8a7e]">
          <span className="font-semibold uppercase tracking-[0.18em] text-[#d8b46a]">View</span>
          <span>{taskItems.length} tasks</span>
          <span className={["border px-2 py-1 font-mono", currentScheduleSuggestions.criticalCount > 0 ? "border-[#5a2b2b] bg-[#211717] text-[#ff9a8f]" : "border-[#2f4b3d] bg-[#14231d] text-[#9cccae]"].join(" ")}>
            health {currentScheduleSuggestions.healthScore}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CreateTaskForm projectId={projectId} options={options} onTaskCreated={(task) => setTaskItems((current) => [task, ...current])} />
          <button
            type="button"
            onClick={() => setShowSuggestions((current) => !current)}
            className={["h-8 border px-3 text-xs font-semibold transition", showSuggestions ? "border-[#d8b46a] bg-[#2b2924] text-[#f4f1e8]" : "border-[#3f3c33] text-[#aaa599] hover:border-[#d8b46a] hover:text-[#e8c678]"].join(" ")}
          >
            Schedule intelligence
          </button>
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
      </div>

      {showSuggestions ? <ScheduleSuggestionPanel summary={currentScheduleSuggestions} /> : null}

      {view === "table" ? <TaskTable projectId={projectId} tasks={taskItems} options={options} onTasksChange={setTaskItems} /> : <GanttPanel tasks={taskItems} />}
    </div>
  );
}

function ScheduleSuggestionPanel({ summary }: { summary: ScheduleSuggestionSummary }) {
  const topSuggestions = summary.suggestions.slice(0, 5);

  return (
    <section className="mb-4 border border-[#34322b] bg-[#161612]">
      <div className="grid gap-4 p-4 xl:grid-cols-[240px_minmax(0,1fr)_260px]">
        <div className="border border-[#2f2d27] bg-[#11110f] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">Schedule intelligence</p>
          <div className="mt-4 flex items-end gap-2">
            <span className={["font-mono text-5xl leading-none", summary.healthScore < 70 ? "text-[#ff9a8f]" : "text-[#9cccae]"].join(" ")}>{summary.healthScore}</span>
            <span className="pb-1 text-xs uppercase tracking-[0.18em] text-[#7f7a70]">health</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <MetricBox label="Critical" value={summary.criticalCount} tone={summary.criticalCount > 0 ? "danger" : "normal"} />
            <MetricBox label="Watch" value={summary.warningCount} tone={summary.warningCount > 0 ? "warn" : "normal"} />
            <MetricBox label="Budget risk" value={`$${summary.totalBudgetRisk.toLocaleString()}`} tone={summary.totalBudgetRisk > 0 ? "danger" : "normal"} wide />
          </div>
        </div>

        <div className="min-w-0 border border-[#2f2d27] bg-[#11110f] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">Producer brief</p>
            <span className="border border-[#34322b] px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[#8f8a7e]">{summary.provider}</span>
          </div>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-[#d8d3c7]">{summary.narrative}</p>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            <MiniRule label="先处理" value="逾期 / 超预算 / 无 owner" />
            <MiniRule label="再调整" value="前置依赖和审阅瓶颈" />
            <MiniRule label="可提前" value="无依赖且已分配任务" />
          </div>
        </div>

        <div className="border border-[#2f2d27] bg-[#11110f] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">Next moves</p>
          <div className="mt-3 space-y-2">
            {topSuggestions.length ? (
              topSuggestions.slice(0, 3).map((item) => (
                <div key={item.id} className="border border-[#2f2d27] bg-[#181713] px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-[#f4f1e8]">{item.contextLabel}</span>
                    <SeverityBadge severity={item.severity} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#aaa599]">{item.action}</p>
                </div>
              ))
            ) : (
              <p className="border border-dashed border-[#3f3c33] px-3 py-6 text-center text-xs text-[#8f8a7e]">No schedule risks detected.</p>
            )}
          </div>
        </div>
      </div>

      {topSuggestions.length ? (
        <div className="border-t border-[#2f2d27]">
          {topSuggestions.map((item) => (
            <SuggestionRow key={item.id} item={item} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function SuggestionRow({ item }: { item: ScheduleSuggestion }) {
  return (
    <div className="grid gap-3 border-b border-[#2a2a28] px-4 py-3 text-sm last:border-b-0 xl:grid-cols-[150px_minmax(0,1fr)_minmax(260px,0.85fr)_120px]">
      <div className="flex items-center gap-2">
        <SeverityBadge severity={item.severity} />
        <span className="font-mono text-xs text-[#8f8a7e]">{item.kind.replaceAll("_", " ")}</span>
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium text-[#f4f1e8]">{item.title}</p>
        <p className="mt-1 text-xs text-[#8f8a7e]">{item.rationale}</p>
      </div>
      <p className="text-xs leading-5 text-[#c9c3b5]">{item.action}</p>
      <div className="flex items-center justify-end gap-3 font-mono text-xs text-[#aaa599]">
        <span>{item.impactDays}d</span>
        <span>${item.budgetImpact.toLocaleString()}</span>
      </div>
    </div>
  );
}

function MetricBox({ label, value, tone, wide = false }: { label: string; value: number | string; tone: "normal" | "warn" | "danger"; wide?: boolean }) {
  const toneClass = tone === "danger" ? "text-[#ff9a8f]" : tone === "warn" ? "text-[#e8c678]" : "text-[#9cccae]";
  return (
    <div className={["border border-[#2f2d27] bg-[#181713] px-3 py-2", wide ? "col-span-2" : ""].join(" ")}>
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#69655c]">{label}</p>
      <p className={["mt-1 font-mono text-sm", toneClass].join(" ")}>{value}</p>
    </div>
  );
}

function MiniRule({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#2f2d27] bg-[#181713] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#69655c]">{label}</p>
      <p className="mt-1 truncate text-xs text-[#c9c3b5]">{value}</p>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: ScheduleSuggestion["severity"] }) {
  const className = severity === "critical" ? "border-[#6f2f2f] bg-[#2b1717] text-[#ff9a8f]" : severity === "warning" ? "border-[#6f5631] bg-[#211b12] text-[#e8c678]" : "border-[#294838] bg-[#13221b] text-[#9cccae]";
  return <span className={["shrink-0 border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]", className].join(" ")}>{severity}</span>;
}
