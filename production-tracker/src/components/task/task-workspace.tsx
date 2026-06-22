"use client";

import { useMemo, useState } from "react";

import { CreateTaskForm, type TaskFormPrefill } from "@/components/task/create-task-form";
import { GanttPanel } from "@/components/task/gantt-panel";
import { TaskBoard } from "@/components/task/task-board";
import { TaskTable } from "@/components/task/task-table";
import { buildScheduleSuggestions, type ScheduleSuggestion, type ScheduleSuggestionSummary } from "@/lib/schedule-suggestions";
import { STATUS_COLORS } from "@/lib/status-colors";
import type { TaskFormOptions, TaskTableItem } from "@/lib/task-data";
import { buildWorkHourHeatmap, type WorkHourHeatmapRow } from "@/lib/work-hour-heatmap";

type TaskBriefTone = "ok" | "watch" | "danger";
type TaskDecisionAction = { id: string; title: string; detail: string; tone: TaskBriefTone };
type TaskFocusItem = {
  id: string;
  taskName: string;
  contextLabel: string;
  ownerLabel: string;
  statusLabel: string;
  dueLabel: string;
  reason: string;
  budgetDelta: number;
  tone: TaskBriefTone;
};
type TaskExecutionBriefData = {
  healthScore: number;
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  overdueTasks: TaskTableItem[];
  dueSoonTasks: TaskTableItem[];
  unassignedTasks: TaskTableItem[];
  reviewTasks: TaskTableItem[];
  overBudgetTasks: TaskTableItem[];
  onHoldTasks: TaskTableItem[];
  missingDateTasks: TaskTableItem[];
  budgetRisk: number;
  actions: TaskDecisionAction[];
  focusItems: TaskFocusItem[];
  briefText: string;
};

const completeTaskStatuses: TaskTableItem["status"][] = ["APPROVED", "FINAL", "OMIT"];

export function TaskWorkspace({
  projectId,
  tasks,
  options,
  scheduleSuggestions,
  analysisDate,
  prefill,
}: {
  projectId: string;
  tasks: TaskTableItem[];
  options: TaskFormOptions;
  scheduleSuggestions: ScheduleSuggestionSummary | null;
  analysisDate: string;
  prefill?: TaskFormPrefill;
}) {
  const [taskItems, setTaskItems] = useState(tasks);
  const [view, setView] = useState<"table" | "board" | "gantt">("table");
  const [showSuggestions, setShowSuggestions] = useState(Boolean(scheduleSuggestions?.criticalCount || scheduleSuggestions?.warningCount));
  const analysisNow = useMemo(() => new Date(analysisDate), [analysisDate]);
  const currentScheduleSuggestions = useMemo(
    () => buildScheduleSuggestions({ projectId, tasks: taskItems, now: analysisNow, provider: scheduleSuggestions?.provider ?? "rules" }),
    [analysisNow, projectId, scheduleSuggestions?.provider, taskItems],
  );
  const executionBrief = useMemo(() => buildTaskExecutionBrief(taskItems, currentScheduleSuggestions, analysisNow), [analysisNow, currentScheduleSuggestions, taskItems]);
  const workHourHeatmap = buildWorkHourHeatmap(taskItems);

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
          <CreateTaskForm projectId={projectId} options={options} prefill={prefill} onTaskCreated={(task) => setTaskItems((current) => [task, ...current])} />
          <button
            type="button"
            onClick={() => setShowSuggestions((current) => !current)}
            className={["h-8 border px-3 text-xs font-semibold transition", showSuggestions ? "border-[#d8b46a] bg-[#2b2924] text-[#f4f1e8]" : "border-[#3f3c33] text-[#aaa599] hover:border-[#d8b46a] hover:text-[#e8c678]"].join(" ")}
          >
            Schedule intelligence
          </button>
          <div className="grid grid-cols-3 overflow-hidden border border-[#3f3c33] bg-[#11110f] text-xs">
            <button
              type="button"
              onClick={() => setView("table")}
              className={["h-8 px-4 font-semibold", view === "table" ? "bg-[#2b2924] text-[#f4f1e8]" : "text-[#8f8a7e] hover:text-[#f4f1e8]"].join(" ")}
            >
              Table
            </button>
            <button
              type="button"
              onClick={() => setView("board")}
              className={["h-8 px-4 font-semibold", view === "board" ? "bg-[#2b2924] text-[#f4f1e8]" : "text-[#8f8a7e] hover:text-[#f4f1e8]"].join(" ")}
            >
              Board
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

      <TaskExecutionBrief brief={executionBrief} />

      {showSuggestions ? <ScheduleSuggestionPanel summary={currentScheduleSuggestions} /> : null}

      <WorkHourHeatmapPanel rows={workHourHeatmap} />

      {view === "table" ? (
        <TaskTable projectId={projectId} tasks={taskItems} options={options} onTasksChange={setTaskItems} />
      ) : view === "board" ? (
        <TaskBoard projectId={projectId} tasks={taskItems} onTasksChange={setTaskItems} />
      ) : (
        <GanttPanel projectId={projectId} tasks={taskItems} onTasksChange={setTaskItems} />
      )}
    </div>
  );
}

function TaskExecutionBrief({ brief }: { brief: TaskExecutionBriefData }) {
  const [copied, setCopied] = useState(false);

  async function copyBrief() {
    await copyText(brief.briefText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section className="mb-4 border border-[#34322b] bg-[#171611]">
      <div className="grid gap-4 p-4 xl:grid-cols-[minmax(280px,0.7fr)_minmax(0,1.05fr)_minmax(320px,0.85fr)]">
        <div className="border border-[#2f2d27] bg-[#11110f] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">execution brief</p>
              <h2 className="mt-2 text-xl font-semibold text-[#f4f1e8]">任务执行决策摘要</h2>
            </div>
            <button type="button" onClick={copyBrief} className="h-8 shrink-0 border border-[#3f3c33] px-3 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]">
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="mt-5 flex items-end gap-3">
            <span className={["font-mono text-6xl leading-none", brief.healthScore < 70 ? "text-[#ff9a8f]" : brief.healthScore < 86 ? "text-[#e8c678]" : "text-[#9cccae]"].join(" ")}>{brief.healthScore}</span>
            <span className="pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">health</span>
          </div>
          <div className="mt-5 grid grid-cols-3 border border-[#2a2a28] bg-[#181713]">
            <BriefMiniStat label="Total" value={brief.totalTasks} />
            <BriefMiniStat label="Active" value={brief.activeTasks} tone={brief.activeTasks ? "watch" : "ok"} />
            <BriefMiniStat label="Done" value={brief.completedTasks} tone="ok" />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <BriefMetric label="Delivery risk" value={`${brief.overdueTasks.length}`} meta={`${brief.dueSoonTasks.length} due soon`} tone={brief.overdueTasks.length ? "danger" : brief.dueSoonTasks.length ? "watch" : "ok"} />
          <BriefMetric label="Unassigned" value={`${brief.unassignedTasks.length}`} meta={brief.unassignedTasks[0]?.name ?? "No owner gap"} tone={brief.unassignedTasks.length ? "danger" : "ok"} />
          <BriefMetric label="Review queue" value={`${brief.reviewTasks.length}`} meta={brief.reviewTasks[0]?.context.label ?? "No review block"} tone={brief.reviewTasks.length ? "watch" : "ok"} />
          <BriefMetric label="Budget risk" value={formatMoney(brief.budgetRisk)} meta={`${brief.overBudgetTasks.length} over budget`} tone={brief.budgetRisk > 0 ? "danger" : "ok"} />
          <BriefMetric label="On hold" value={`${brief.onHoldTasks.length}`} meta={brief.onHoldTasks[0]?.name ?? "No hold"} tone={brief.onHoldTasks.length ? "watch" : "ok"} />
          <BriefMetric label="Missing dates" value={`${brief.missingDateTasks.length}`} meta="schedule hygiene" tone={brief.missingDateTasks.length ? "watch" : "ok"} />
        </div>

        <div className="border border-[#2f2d27] bg-[#11110f]">
          <div className="border-b border-[#2a2a28] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">today calls</p>
            <h3 className="mt-1 text-lg font-semibold text-[#f4f1e8]">制片会优先确认</h3>
          </div>
          <div className="divide-y divide-[#24231f]">
            {brief.actions.map((action) => (
              <div key={action.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-[#f4f1e8]">{action.title}</p>
                  <span className={["shrink-0 border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]", briefToneClass(action.tone)].join(" ")}>
                    {action.tone}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-[#aaa599]">{action.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[#2a2a28] bg-[#14130f] px-4 py-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">focus queue</p>
            <h3 className="mt-1 text-lg font-semibold text-[#f4f1e8]">重点盯办任务</h3>
          </div>
          <span className="border border-[#34322b] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#8f8a7e]">{brief.focusItems.length} items</span>
        </div>
        <FocusQueue items={brief.focusItems} />
      </div>
    </section>
  );
}

function WorkHourHeatmapPanel({ rows }: { rows: WorkHourHeatmapRow[] }) {
  const dates = rows[0]?.cells.map((cell) => cell.date) ?? [];

  return (
    <section className="mb-4 border border-[#34322b] bg-[#181713]">
      <div className="flex items-center justify-between gap-4 border-b border-[#2a2a28] px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">work hour heatmap</p>
          <h2 className="mt-1 text-lg font-semibold text-[#f4f1e8]">人员工时热力图</h2>
        </div>
        <p className="text-xs text-[#8f8a7e]">按任务到期日与已记录人天聚合</p>
      </div>
      {rows.length ? (
        <div className="overflow-x-auto">
          <div className="min-w-[780px]">
            <div className="grid grid-cols-[220px_repeat(7,minmax(76px,1fr))_96px] border-b border-[#2a2a28] bg-[#1e1e1c] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6e6e69]">
              <div className="px-3 py-2">Person</div>
              {dates.map((date) => <div key={date} className="border-l border-[#2a2a28] px-3 py-2 text-right">{date.slice(5)}</div>)}
              <div className="border-l border-[#2a2a28] px-3 py-2 text-right">Total</div>
            </div>
            {rows.map((row) => (
              <div key={row.assigneeId} className="grid grid-cols-[220px_repeat(7,minmax(76px,1fr))_96px] border-b border-[#2a2a28] text-xs">
                <div className="min-w-0 px-3 py-2">
                  <p className="truncate font-semibold text-[#f4f1e8]">{row.assigneeName}</p>
                  <p className="mt-1 truncate text-[#7f7a70]">{row.department}</p>
                </div>
                {row.cells.map((cell) => (
                  <div key={`${row.assigneeId}-${cell.date}`} className="border-l border-[#2a2a28] px-2 py-2 text-right">
                    <span className={["inline-flex min-w-12 justify-center px-2 py-1 font-mono", heatmapCellClass(cell.days)].join(" ")} title={`${cell.taskCount} tasks`}>
                      {cell.days ? `${cell.days}d` : "--"}
                    </span>
                  </div>
                ))}
                <div className="border-l border-[#2a2a28] px-3 py-2 text-right font-mono text-[#e8c678]">{row.totalDays}d</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="p-5 text-sm text-[#8f8a7e]">暂无可聚合的工时数据。录入任务到期日和已记录人天后，这里会显示人员压力。</p>
      )}
    </section>
  );
}

function heatmapCellClass(days: number) {
  if (days <= 0) return "bg-[#11110f] text-[#6e6e69]";
  if (days < 2) return "bg-[#14231d] text-[#9cccae]";
  if (days <= 5) return "bg-[#211b12] text-[#e8c678]";
  return "bg-[#2b1717] text-[#ff9a8f]";
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

function BriefMetric({ label, value, meta, tone }: { label: string; value: string; meta: string; tone: TaskBriefTone }) {
  return (
    <div className="min-h-24 border border-[#2f2d27] bg-[#11110f] px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7f7a70]">{label}</p>
      <p className={["mt-2 truncate font-mono text-2xl font-semibold", briefTextClass(tone)].join(" ")}>{value}</p>
      <p className="mt-2 truncate text-xs text-[#8f8a7e]">{meta}</p>
    </div>
  );
}

function BriefMiniStat({ label, value, tone = "watch" }: { label: string; value: number; tone?: TaskBriefTone }) {
  return (
    <div className="border-r border-[#2a2a28] px-3 py-2 last:border-r-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7f7a70]">{label}</p>
      <p className={["mt-1 font-mono text-sm font-semibold", briefTextClass(tone)].join(" ")}>{value.toLocaleString()}</p>
    </div>
  );
}

function FocusQueue({ items }: { items: TaskFocusItem[] }) {
  if (items.length === 0) {
    return (
      <div className="border border-dashed border-[#34322b] bg-[#11110f] px-4 py-8 text-center text-sm text-[#8f8a7e]">
        当前没有需要单独盯办的任务。
      </div>
    );
  }

  return (
    <div className="grid gap-2 xl:grid-cols-3">
      {items.map((item) => (
        <article key={item.id} className={["border bg-[#11110f] px-3 py-3", focusItemClass(item.tone)].join(" ")}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-mono text-[11px] uppercase tracking-[0.08em] text-[#8f8a7e]">{item.contextLabel}</p>
              <h4 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-[#f4f1e8]">{item.taskName}</h4>
            </div>
            <span className={["shrink-0 border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]", briefToneClass(item.tone)].join(" ")}>
              {item.tone}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <FocusDatum label="Owner" value={item.ownerLabel} />
            <FocusDatum label="Due" value={item.dueLabel} tone={item.tone} />
            <FocusDatum label="Status" value={item.statusLabel} />
            <FocusDatum label="Budget Δ" value={item.budgetDelta ? formatMoney(item.budgetDelta) : "--"} tone={item.budgetDelta > 0 ? "danger" : "ok"} />
          </div>
          <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#aaa599]">{item.reason}</p>
        </article>
      ))}
    </div>
  );
}

function FocusDatum({ label, value, tone = "watch" }: { label: string; value: string; tone?: TaskBriefTone }) {
  return (
    <div className="min-w-0 border border-[#2a2a28] bg-[#181713] px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-[0.12em] text-[#69655c]">{label}</p>
      <p className={["mt-1 truncate font-mono text-[11px]", briefTextClass(tone)].join(" ")}>{value}</p>
    </div>
  );
}

function buildTaskExecutionBrief(tasks: TaskTableItem[], summary: ScheduleSuggestionSummary, now: Date): TaskExecutionBriefData {
  const activeTasks = tasks.filter((task) => !completeTaskStatuses.includes(task.status));
  const completedTasks = tasks.length - activeTasks.length;
  const overdueTasks = activeTasks.filter((task) => isOverdue(task, now)).sort(sortByDueThenPriority);
  const dueSoonTasks = activeTasks.filter((task) => !isOverdue(task, now) && isDueSoon(task, now)).sort(sortByDueThenPriority);
  const unassignedTasks = activeTasks.filter((task) => task.assignees.length === 0).sort(sortByPriorityThenDue);
  const reviewTasks = tasks.filter((task) => task.status === "PENDING_REVIEW").sort(sortByPriorityThenDue);
  const overBudgetTasks = tasks.filter((task) => task.overBudget).sort((a, b) => budgetOverrun(b) - budgetOverrun(a));
  const onHoldTasks = tasks.filter((task) => task.status === "ON_HOLD").sort(sortByPriorityThenDue);
  const missingDateTasks = activeTasks.filter((task) => !task.startDate || !task.dueDate).sort(sortByPriorityThenDue);
  const budgetRisk = overBudgetTasks.reduce((sum, task) => sum + budgetOverrun(task), 0);
  const actions: TaskDecisionAction[] = [];
  const focusItems = buildFocusItems({
    overdueTasks,
    dueSoonTasks,
    unassignedTasks,
    reviewTasks,
    overBudgetTasks,
    onHoldTasks,
    missingDateTasks,
    now,
  });

  if (overdueTasks.length > 0) {
    actions.push({
      id: "overdue",
      title: "先处理逾期交付",
      detail: `${overdueTasks.slice(0, 3).map((task) => `${task.context.label}/${task.name}`).join("、")} 已过截止日。建议今天确认补人、缩 scope 或整体顺延。`,
      tone: "danger",
    });
  }

  if (unassignedTasks.length > 0) {
    actions.push({
      id: "unassigned",
      title: "给无负责人任务指定 owner",
      detail: `${unassignedTasks.length} 个进行中任务没有负责人，高优先级任务不要进入 ready 队列，先分配执行人和 reviewer。`,
      tone: "danger",
    });
  }

  if (budgetRisk > 0) {
    actions.push({
      id: "budget-risk",
      title: "冻结超预算任务的新增工时",
      detail: `${overBudgetTasks.length} 个任务超预算，风险金额 ${formatMoney(budgetRisk)}。建议让负责人提交剩余工时和重估报价。`,
      tone: "danger",
    });
  }

  if (reviewTasks.length > 0) {
    actions.push({
      id: "review-queue",
      title: "清掉待审队列",
      detail: `${reviewTasks.length} 个任务等待审阅，优先安排导演/监制集中看版本，明确通过或返修责任人。`,
      tone: "watch",
    });
  }

  if (dueSoonTasks.length > 0) {
    actions.push({
      id: "due-soon",
      title: "锁定三天内交付清单",
      detail: `${dueSoonTasks.length} 个任务将在 3 天内到期，建议只保留必要变更，避免临近交付继续扩大范围。`,
      tone: "watch",
    });
  }

  if (missingDateTasks.length > 0) {
    actions.push({
      id: "missing-dates",
      title: "补齐日期，避免资源排期失真",
      detail: `${missingDateTasks.length} 个活动任务缺少开始或截止日期，会影响甘特图、资源规划和工时热力图。`,
      tone: "watch",
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: "healthy",
      title: "当前任务盘面可以进入例行跟踪",
      detail: "没有明显逾期、预算或负责人缺口。保持每日审阅节奏，并用 ready 任务填补资源空档。",
      tone: "ok",
    });
  }

  const briefText = [
    "任务执行决策摘要",
    `健康度: ${summary.healthScore}/100`,
    `任务: ${tasks.length} 总数 / ${activeTasks.length} 活动 / ${completedTasks} 已完成`,
    `逾期: ${overdueTasks.length} / 三天内到期: ${dueSoonTasks.length} / 无负责人: ${unassignedTasks.length}`,
    `待审: ${reviewTasks.length} / 超预算: ${overBudgetTasks.length} / 风险金额: ${formatMoney(budgetRisk)}`,
    `重点盯办: ${focusItems.length ? focusItems.map((item) => `${item.contextLabel}/${item.taskName}`).join("、") : "暂无"}`,
    "建议动作:",
    ...actions.map((action, index) => `${index + 1}. ${action.title} - ${action.detail}`),
  ].join("\n");

  return {
    healthScore: summary.healthScore,
    totalTasks: tasks.length,
    activeTasks: activeTasks.length,
    completedTasks,
    overdueTasks,
    dueSoonTasks,
    unassignedTasks,
    reviewTasks,
    overBudgetTasks,
    onHoldTasks,
    missingDateTasks,
    budgetRisk,
    actions,
    focusItems,
    briefText,
  };
}

function buildFocusItems(input: {
  overdueTasks: TaskTableItem[];
  dueSoonTasks: TaskTableItem[];
  unassignedTasks: TaskTableItem[];
  reviewTasks: TaskTableItem[];
  overBudgetTasks: TaskTableItem[];
  onHoldTasks: TaskTableItem[];
  missingDateTasks: TaskTableItem[];
  now: Date;
}) {
  const candidates = [
    ...input.overdueTasks.map((task) => taskFocusItem(task, "逾期交付", "danger" as const, input.now)),
    ...input.overBudgetTasks.map((task) => taskFocusItem(task, "预算超支", "danger" as const, input.now)),
    ...input.unassignedTasks.map((task) => taskFocusItem(task, "未分配负责人", "danger" as const, input.now)),
    ...input.reviewTasks.map((task) => taskFocusItem(task, "等待审阅闭环", "watch" as const, input.now)),
    ...input.dueSoonTasks.map((task) => taskFocusItem(task, "三天内到期", "watch" as const, input.now)),
    ...input.onHoldTasks.map((task) => taskFocusItem(task, "已暂停", "watch" as const, input.now)),
    ...input.missingDateTasks.map((task) => taskFocusItem(task, "日期缺失", "watch" as const, input.now)),
  ];
  const merged = new Map<string, TaskFocusItem>();

  for (const item of candidates) {
    const current = merged.get(item.id);
    if (!current) {
      merged.set(item.id, item);
      continue;
    }

    merged.set(item.id, {
      ...current,
      reason: current.reason.includes(item.reason) ? current.reason : `${current.reason} / ${item.reason}`,
      tone: current.tone === "danger" || item.tone === "danger" ? "danger" : item.tone,
      budgetDelta: Math.max(current.budgetDelta, item.budgetDelta),
    });
  }

  return Array.from(merged.values())
    .sort((a, b) => focusRank(b) - focusRank(a) || b.budgetDelta - a.budgetDelta || a.dueLabel.localeCompare(b.dueLabel) || a.taskName.localeCompare(b.taskName))
    .slice(0, 6);
}

function taskFocusItem(task: TaskTableItem, reason: string, tone: TaskBriefTone, now: Date): TaskFocusItem {
  return {
    id: task.id,
    taskName: task.name,
    contextLabel: task.context.label,
    ownerLabel: task.assignees.map((assignee) => assignee.name).join(", ") || "Unassigned",
    statusLabel: STATUS_COLORS[task.status].label,
    dueLabel: formatDueLabel(task, now),
    reason,
    budgetDelta: budgetOverrun(task),
    tone,
  };
}

function isOverdue(task: TaskTableItem, now: Date) {
  if (!task.dueDate || completeTaskStatuses.includes(task.status)) return false;
  return startOfDay(new Date(task.dueDate)).getTime() < startOfDay(now).getTime();
}

function isDueSoon(task: TaskTableItem, now: Date) {
  if (!task.dueDate || completeTaskStatuses.includes(task.status)) return false;
  const delta = Math.round((startOfDay(new Date(task.dueDate)).getTime() - startOfDay(now).getTime()) / 86_400_000);
  return delta >= 0 && delta <= 3;
}

function sortByDueThenPriority(a: TaskTableItem, b: TaskTableItem) {
  return dateValue(a.dueDate) - dateValue(b.dueDate) || b.priority - a.priority || a.name.localeCompare(b.name);
}

function sortByPriorityThenDue(a: TaskTableItem, b: TaskTableItem) {
  return b.priority - a.priority || dateValue(a.dueDate) - dateValue(b.dueDate) || a.name.localeCompare(b.name);
}

function formatDueLabel(task: TaskTableItem, now: Date) {
  if (!task.dueDate) return "No due";
  const due = startOfDay(new Date(task.dueDate));
  const today = startOfDay(now);
  const delta = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (delta < 0) return `${Math.abs(delta)}d late`;
  if (delta === 0) return "today";
  return `${delta}d left`;
}

function focusRank(item: TaskFocusItem) {
  const toneScore = item.tone === "danger" ? 100 : item.tone === "watch" ? 50 : 0;
  const reasonScore = item.reason.includes("逾期") ? 30 : item.reason.includes("预算") ? 24 : item.reason.includes("未分配") ? 18 : item.reason.includes("审阅") ? 12 : 0;
  return toneScore + reasonScore;
}

function dateValue(value: string | null) {
  return value ? new Date(value).getTime() : Number.MAX_SAFE_INTEGER;
}

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function budgetOverrun(task: TaskTableItem) {
  return Math.max(0, task.calculatedCost - (task.estimatedCost ?? 0));
}

function formatMoney(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

function briefTextClass(tone: TaskBriefTone) {
  if (tone === "danger") return "text-[#ff9a8f]";
  if (tone === "watch") return "text-[#e8c678]";
  return "text-[#9cccae]";
}

function briefToneClass(tone: TaskBriefTone) {
  if (tone === "danger") return "border-[#6f2f2f] bg-[#2b1717] text-[#ff9a8f]";
  if (tone === "watch") return "border-[#6f5631] bg-[#211b12] text-[#e8c678]";
  return "border-[#294838] bg-[#13221b] text-[#9cccae]";
}

function focusItemClass(tone: TaskBriefTone) {
  if (tone === "danger") return "border-[#5a2b2b]";
  if (tone === "watch") return "border-[#5a4324]";
  return "border-[#294838]";
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    // Clipboard access can be blocked in file or restricted browser contexts.
  }
}
