"use client";

import * as ContextMenu from "@radix-ui/react-context-menu";
import * as Popover from "@radix-ui/react-popover";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  type PlanningCalendarException,
  type CapacityWeek,
  type PlanningUserRow,
  type PlanningUserWeek,
  type ResourcePlanningData,
} from "@/lib/resource-planning";
import { rebuildResourcePlanningWithCalendarExceptions } from "@/lib/resource-planning-calendar";
import { reassignTaskInPlanningData } from "@/lib/resource-planning-actions";

const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const stablePlanningChartSize = { width: 640, height: 300 };

type ChartMode = "step" | "line";
type DetailMode = "heatmap" | "area";
type InspectGroup = "department" | "user";
type SelectedCell = { userId: string; weekKey: string };
type AssignmentDraft = { userId: string; weekKey: string; mode: "new" | "reassign" } | null;
type InspectRow = { name: string; subtitle: string; capacity: number; workload: number; delta: number };
type ExceptionType = PlanningCalendarException["type"];
type ResourceDecisionAction = { id: string; title: string; detail: string; tone: "ok" | "watch" | "over" };
type ResourceDecisionBriefData = {
  pressureWeek: CapacityWeek | null;
  reliefWeek: CapacityWeek | null;
  topOverbookedUsers: PlanningUserRow[];
  topAvailableUsers: PlanningUserRow[];
  unassignedWeeks: ResourcePlanningData["unassignedWeeks"];
  calendarLoss: number;
  actions: ResourceDecisionAction[];
  briefText: string;
};

export function ResourcePlanningWorkspace({ data, projectId = "demo-mkali-mission" }: { data: ResourcePlanningData; projectId?: string }) {
  const router = useRouter();
  const [chartMode, setChartMode] = useState<ChartMode>("step");
  const [detailMode, setDetailMode] = useState<DetailMode>("heatmap");
  const [inspectGroup, setInspectGroup] = useState<InspectGroup>("department");
  const [inspectWeekKey, setInspectWeekKey] = useState<string | "all">("all");
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [assignmentDraft, setAssignmentDraft] = useState<AssignmentDraft>(null);
  const [localData, setLocalData] = useState(data);
  const [isRefreshing, startRefreshTransition] = useTransition();
  const searchParams = useSearchParams();
  const searchParamString = searchParams.toString();
  const linkQuery = searchParamString ? `?${searchParamString}` : "";
  const baseData = projectId === "demo-mkali-mission" ? localData : data;

  const baselineData = useMemo(() => rebuildResourcePlanningWithCalendarExceptions(baseData, data.calendarExceptions), [baseData, data.calendarExceptions]);
  const activeData = useMemo(() => rebuildResourcePlanningWithCalendarExceptions(baseData, baseData.calendarExceptions), [baseData]);
  const scenarioDelta = useMemo(() => buildScenarioDelta(activeData, baselineData), [activeData, baselineData]);
  const defaultCell = useMemo(() => findDefaultCell(activeData), [activeData]);
  const activeCell = selectedCell ?? defaultCell;
  const selectedUser = activeData.users.find((user) => user.id === activeCell?.userId) ?? activeData.users[0];
  const selectedWeek = selectedUser?.weeks.find((week) => week.weekKey === activeCell?.weekKey) ?? selectedUser?.weeks[0];
  const selectedWeekMeta = activeData.weeks.find((week) => week.key === selectedWeek?.weekKey) ?? activeData.weeks[0];
  const inspectWeek = inspectWeekKey === "all" ? null : activeData.weeks.find((week) => week.key === inspectWeekKey) ?? null;
  const inspectRows = useMemo(() => buildInspectRows(activeData, inspectGroup, inspectWeekKey), [activeData, inspectGroup, inspectWeekKey]);
  const decisionBrief = useMemo(() => buildResourceDecisionBrief(activeData), [activeData]);
  const lineType = chartMode === "step" ? "stepAfter" : "monotone";
  const gridTemplateColumns = `232px repeat(${activeData.weeks.length}, minmax(116px, 1fr)) 124px`;

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="border border-[#34322b] bg-[#181713]">
          <PanelHeader
            eyebrow="capacity chart"
            title="Studio 容量与工作量"
            meta="Weekly · Person Days"
            actions={
              <SegmentedControl
                label="Chart mode"
                value={chartMode}
                options={[
                  { value: "step", label: "Step" },
                  { value: "line", label: "Line" },
                ]}
                onChange={setChartMode}
              />
            }
          />
          <div className="p-4">
            <ResponsiveContainer width="100%" height={300} minWidth={1} minHeight={1} initialDimension={stablePlanningChartSize}>
              <LineChart
                data={activeData.capacity}
                margin={{ top: 10, right: 18, left: -14, bottom: 0 }}
                onClick={(event) => {
                  const weekKey = activeData.capacity.find((week) => week.label === event?.activeLabel)?.key;
                  if (weekKey) setInspectWeekKey(weekKey);
                }}
              >
                <CartesianGrid stroke="#2a2a28" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={<CapacityTooltip onInspect={(weekKey) => setInspectWeekKey(weekKey)} />}
                  cursor={{ stroke: "#5a564e" }}
                />
                <Line type={lineType} dataKey="capacity" name="Capacity" stroke="#4a9eff" strokeWidth={2} dot={(props) => <CapacityDot {...props} inspectWeekKey={inspectWeekKey} dataKeyName="capacity" />} />
                <Line type={lineType} dataKey="workload" name="Workload" stroke="#d8b46a" strokeWidth={2} dot={(props) => <CapacityDot {...props} inspectWeekKey={inspectWeekKey} dataKeyName="workload" />} />
                <Line type={lineType} dataKey="daysOverUnder" name="Over / Under" stroke="#ff8b7c" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-[#34322b] bg-[#181713]">
          <PanelHeader
            eyebrow="summary"
            title="资源窗口"
            meta={`${activeData.weeks.length} weeks`}
            actions={<ExportPlanningButton data={activeData} filename={`resource-planning-${projectId}.csv`} />}
          />
          <div className="grid grid-cols-2 border-b border-[#2a2a28]">
            <Metric label="Capacity" value={days(activeData.totals.capacity)} />
            <Metric label="Workload" value={days(activeData.totals.workload)} />
            <Metric label="Over / Under" value={signedDays(activeData.totals.delta)} tone={activeData.totals.delta > 0 ? "over" : "ok"} />
            <Metric label="Overbooked" value={`${activeData.totals.overbookedUsers} users`} tone={activeData.totals.overbookedUsers ? "watch" : "ok"} />
          </div>
          <div className="grid grid-cols-[1fr_1fr] border-b border-[#2a2a28]">
            <div className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">unassigned</p>
              <p className="mt-2 font-mono text-2xl font-semibold text-[#e8c678]">{days(activeData.totals.unassignedWorkload)}</p>
            </div>
            <div className="border-l border-[#2a2a28] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">calendar loss</p>
              <p className="mt-2 font-mono text-2xl font-semibold text-[#7bb8ff]">{days(calendarLoss(activeData))}</p>
            </div>
          </div>
          <div className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">next exception</p>
            <CalendarExceptionList data={activeData} compact />
          </div>
        </div>
      </section>

      <ResourceDecisionBrief brief={decisionBrief} onInspectWeek={(weekKey) => setInspectWeekKey(weekKey)} />

      <section className="border border-[#34322b] bg-[#181713]">
        <PanelHeader eyebrow="calendar controls" title="日历例外与产能修正" meta={projectId === "demo-mkali-mission" ? "Demo scenario" : "Project database"} />
        <CalendarExceptionManager
          projectId={projectId}
          data={activeData}
          exceptions={activeData.calendarExceptions}
          baselineExceptions={data.calendarExceptions}
          scenarioDelta={scenarioDelta}
          onDemoDataChange={setLocalData}
          onSaved={() => startRefreshTransition(() => router.refresh())}
          refreshing={isRefreshing}
        />
      </section>

      <section className="grid gap-0 border border-[#34322b] bg-[#181713] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <PanelHeader eyebrow="person-day grid" title="人员周人天网格" meta="Click / right-click cells to inspect assignments" />
          <div className="overflow-auto">
            <div className="min-w-[1180px]">
              <div
                className="grid border-b border-[#2a2a28] bg-[#1e1e1c] text-[11px] font-medium uppercase tracking-[0.12em] text-[#6e6e69]"
                style={{ gridTemplateColumns }}
              >
                <div className="sticky left-0 z-20 bg-[#1e1e1c] px-4 py-2 shadow-[1px_0_0_#2a2a28]">User</div>
                {activeData.weeks.map((week) => (
                  <div key={week.key} className={["border-l border-[#2a2a28] px-3 py-2 text-right", week.unavailableDays > 0 ? "text-[#8cc6ff]" : ""].join(" ")}>
                    <p>{week.label}</p>
                    {week.unavailableDays > 0 ? <p className="mt-1 font-mono text-[10px] normal-case tracking-normal">-{days(week.unavailableDays)}</p> : null}
                  </div>
                ))}
                <div className="border-l border-[#2a2a28] px-3 py-2 text-right">Total</div>
              </div>

              <ResourceGridSummaryRow
                label="Days Over / Under"
                subtitle="工作量 - 容量"
                weeks={activeData.capacity.map((week) => ({
                  weekKey: week.key,
                  value: week.daysOverUnder,
                  title: `${week.label}: ${signedDays(week.daysOverUnder)} over / under`,
                }))}
                totalValue={activeData.totals.delta}
                totalLabel={signedDays(activeData.totals.delta)}
                gridTemplateColumns={gridTemplateColumns}
                mode="delta"
              />

              <ResourceGridSummaryRow
                label="Unassigned Workload"
                subtitle="未分配任务"
                weeks={activeData.unassignedWeeks.map((week) => ({
                  weekKey: week.weekKey,
                  value: week.workload,
                  detail: week.tasks.length ? `${week.tasks.length} tasks` : "clear",
                  title: week.tasks.length ? week.tasks.map((task) => `${task.contextLabel} / ${task.name}: ${days(task.days)}`).join("\n") : "No unassigned workload",
                }))}
                totalValue={activeData.totals.unassignedWorkload}
                totalLabel={days(activeData.totals.unassignedWorkload)}
                gridTemplateColumns={gridTemplateColumns}
                mode="unassigned"
              />

              {activeData.users.map((user) => (
                <div
                  key={user.id}
                  className="grid min-h-16 border-b border-[#2a2a28] text-xs"
                  style={{ gridTemplateColumns }}
                >
                  <div className="sticky left-0 z-10 flex min-w-0 items-center gap-3 bg-[#181713] px-4 shadow-[1px_0_0_#2a2a28]">
                    <div className="grid size-9 shrink-0 place-items-center border border-[#34322b] bg-[#11110f] font-semibold text-[#e8c678]">{initials(user.name)}</div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#f4f1e8]">{user.name}</p>
                      <p className="truncate text-[11px] text-[#8f8a7e]">{user.department}</p>
                    </div>
                  </div>
                  {user.weeks.map((week) => {
                    const isSelected = activeCell?.userId === user.id && activeCell.weekKey === week.weekKey;

                    return (
                      <ContextMenu.Root key={week.weekKey}>
                        <ContextMenu.Trigger asChild>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedCell({ userId: user.id, weekKey: week.weekKey })}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setSelectedCell({ userId: user.id, weekKey: week.weekKey });
                              }
                            }}
                            className={[
                              "group min-h-16 border-l border-[#2a2a28] px-3 py-2 text-right font-mono transition hover:brightness-125 focus:outline-none focus:ring-2 focus:ring-[#d8b46a]",
                              cellTone(week.delta),
                              isSelected ? "relative z-10 ring-2 ring-[#d8b46a]" : "",
                            ].join(" ")}
                            style={week.unavailableDays > 0 ? exceptionCellStyle : undefined}
                            title={`${week.workload} of ${week.capacity} Days Assigned · Show Tasks`}
                          >
                            <p className="text-sm">{numberFormatter.format(week.workload)} / {numberFormatter.format(week.capacity)}</p>
                            <p className="mt-1 text-[10px] opacity-75">{signedDays(week.delta)}</p>
                            <Popover.Root>
                              <Popover.Trigger asChild>
                                <button
                                  type="button"
                                  onClick={(event) => event.stopPropagation()}
                                  className="mt-1 inline-flex h-5 items-center justify-end border border-transparent px-1 text-[10px] uppercase tracking-[0.08em] opacity-65 transition hover:border-current hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#d8b46a]"
                                >
                                  {week.tasks.length ? `Show Tasks (${week.tasks.length})` : "clear"}
                                </button>
                              </Popover.Trigger>
                              <ResourceTaskPopover user={user} week={week} weekLabel={activeData.weeks.find((item) => item.key === week.weekKey)?.label ?? week.weekKey} />
                            </Popover.Root>
                          </div>
                        </ContextMenu.Trigger>
                        <ResourceCellContextMenu
                          user={user}
                          week={week}
                          weekLabel={activeData.weeks.find((item) => item.key === week.weekKey)?.label ?? week.weekKey}
                          projectId={projectId}
                          linkQuery={linkQuery}
                          onInspect={() => setSelectedCell({ userId: user.id, weekKey: week.weekKey })}
                          onOpenAssignment={(mode) => {
                            setSelectedCell({ userId: user.id, weekKey: week.weekKey });
                            setAssignmentDraft({ userId: user.id, weekKey: week.weekKey, mode });
                          }}
                        />
                      </ContextMenu.Root>
                    );
                  })}
                  <div className={["border-l border-[#2a2a28] px-3 py-2 text-right font-mono", cellTone(user.delta)].join(" ")}>
                    <p>{days(user.totalWorkload)}</p>
                    <p className="mt-1 text-[10px] opacity-70">{signedDays(user.delta)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <CellInspector user={selectedUser} week={selectedWeek} weekLabel={selectedWeekMeta?.label ?? "Week"} />
      </section>

      <AssignmentActionPanel
        projectId={projectId}
        data={activeData}
        draft={assignmentDraft}
        onClose={() => setAssignmentDraft(null)}
        onDemoDataChange={setLocalData}
        onSaved={() => startRefreshTransition(() => router.refresh())}
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
        <div className="border border-[#34322b] bg-[#181713]">
          <PanelHeader
            eyebrow="workload detail"
            title={detailMode === "heatmap" ? "部门热力图" : "过载面积图"}
            meta={detailMode === "heatmap" ? "Blue under · red over" : "Area · over/under"}
            actions={
              <SegmentedControl
                label="Detail mode"
                value={detailMode}
                options={[
                  { value: "heatmap", label: "Heatmap" },
                  { value: "area", label: "Area" },
                ]}
                onChange={setDetailMode}
              />
            }
          />
          {detailMode === "heatmap" ? <DepartmentHeatmap data={activeData} linkQuery={linkQuery} /> : <OverUnderArea data={activeData} />}
        </div>

        <div className="border border-[#34322b] bg-[#181713]">
          <PanelHeader
            eyebrow="inspect chart data"
            title={inspectGroup === "department" ? "部门容量明细" : "人员容量明细"}
            meta={inspectWeek ? inspectWeek.label : "full window"}
            actions={
              <div className="flex items-center gap-2">
                <select
                  value={inspectWeekKey}
                  onChange={(event) => setInspectWeekKey(event.target.value)}
                  className="h-8 border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#c9c3b5] outline-none focus:border-[#d8b46a]"
                  aria-label="Inspect week"
                >
                  <option value="all">All weeks</option>
                  {activeData.weeks.map((week) => (
                    <option key={week.key} value={week.key}>
                      {week.label}
                    </option>
                  ))}
                </select>
                <SegmentedControl
                  label="Inspect group"
                  value={inspectGroup}
                  options={[
                    { value: "department", label: "Dept" },
                    { value: "user", label: "User" },
                  ]}
                  onChange={setInspectGroup}
                />
                <button
                  type="button"
                  onClick={() => downloadCsv(`resource-inspect-${inspectGroup}-${inspectWeekKey}.csv`, buildInspectCsv(inspectRows, inspectGroup, inspectWeek?.label ?? "All weeks"))}
                  className="h-8 border border-[#34322b] px-3 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
                >
                  Export
                </button>
              </div>
            }
          />
          <div className="p-4">
            <div>
              <ResponsiveContainer width="100%" height={176} minWidth={1} minHeight={1} initialDimension={{ width: 360, height: 176 }}>
                <BarChart data={inspectRows} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#2a2a28" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#8f8a7e", fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis tick={{ fill: "#8f8a7e", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#24221d" }} />
                  <Bar dataKey="capacity" name="Capacity" fill="#4a9eff" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="workload" name="Workload" fill="#d8b46a" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {inspectRows.map((row) => (
                <InspectDataRow key={`${inspectGroup}-${row.name}`} row={row} />
              ))}
              <InspectDataRow row={buildInspectTotalRow(inspectRows)} total />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CellInspector({ user, week, weekLabel }: { user?: PlanningUserRow; week?: PlanningUserWeek; weekLabel: string }) {
  if (!user || !week) {
    return (
      <aside className="border-t border-[#34322b] p-4 xl:border-l xl:border-t-0">
        <p className="text-sm text-[#aaa599]">选择一个人员周格子查看任务。</p>
      </aside>
    );
  }

  return (
    <aside className="border-t border-[#34322b] bg-[#151410] p-4 xl:border-l xl:border-t-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d8b46a]">cell inspector</p>
      <h3 className="mt-2 text-lg font-semibold text-[#f4f1e8]">{user.name}</h3>
      <p className="mt-1 text-xs text-[#8f8a7e]">{user.department} · {weekLabel}</p>

      <div className="mt-4 grid grid-cols-3 border border-[#2a2a28]">
        <MiniMetric label="Assigned" value={days(week.workload)} />
        <MiniMetric label="Capacity" value={days(week.capacity)} />
        <MiniMetric label="Delta" value={signedDays(week.delta)} tone={week.delta > 0 ? "over" : "ok"} />
      </div>

      {week.exceptions.length > 0 ? (
        <div className="mt-4 border border-[#2a2a28] bg-[#101b28] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8cc6ff]">calendar exception</p>
          <div className="mt-2 space-y-2">
            {week.exceptions.map((exception) => (
              <div key={`${exception.date}-${exception.type}`} className="text-xs leading-5 text-[#c9d9e8]">
                <span className="font-mono text-[#8cc6ff]">{exception.date}</span>
                <span className="mx-2 text-[#55718c]">/</span>
                <span>{exception.description ?? exception.type}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">tasks</p>
          <p className="font-mono text-xs text-[#8f8a7e]">{week.tasks.length} items</p>
        </div>
        <div className="mt-2 space-y-2">
          {week.tasks.length > 0 ? (
            week.tasks.map((task) => (
              <div key={task.id} className="border border-[#2a2a28] bg-[#181713] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#f4f1e8]">{task.contextLabel} · {task.name}</p>
                    <p className="mt-1 text-xs text-[#8f8a7e]">{statusLabel(task.status)}</p>
                  </div>
                  <span className="shrink-0 border border-[#3c3830] px-2 py-1 font-mono text-xs text-[#e8c678]">{days(task.days)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="border border-dashed border-[#34322b] px-3 py-8 text-center text-xs text-[#7f7a70]">这一周没有已分配任务。</div>
          )}
        </div>
      </div>
    </aside>
  );
}

function ResourceDecisionBrief({ brief, onInspectWeek }: { brief: ResourceDecisionBriefData; onInspectWeek: (weekKey: string) => void }) {
  const [copied, setCopied] = useState(false);

  async function copyBrief() {
    await copyText(brief.briefText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section className="grid gap-5 border border-[#34322b] bg-[#181713] xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
      <div className="border-b border-[#34322b] p-4 xl:border-b-0 xl:border-r">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">resource decision brief</p>
            <h2 className="mt-2 text-xl font-semibold text-[#f4f1e8]">制片资源决策摘要</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#aaa599]">把容量、人员过载、未分配任务和日历损失压缩成会议可用的下一步。</p>
          </div>
          <button type="button" onClick={copyBrief} className="h-9 shrink-0 border border-[#3f3c33] px-3 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]">
            {copied ? "Copied" : "Copy brief"}
          </button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <BriefMetric
            label="Pressure week"
            value={brief.pressureWeek ? brief.pressureWeek.label : "-"}
            meta={brief.pressureWeek ? signedDays(brief.pressureWeek.daysOverUnder) : "No week"}
            tone={brief.pressureWeek && brief.pressureWeek.daysOverUnder > 0 ? "over" : "ok"}
            onClick={brief.pressureWeek ? () => onInspectWeek(brief.pressureWeek!.key) : undefined}
          />
          <BriefMetric label="Overbooked" value={`${brief.topOverbookedUsers.length}`} meta={brief.topOverbookedUsers[0] ? brief.topOverbookedUsers[0].name : "No overload"} tone={brief.topOverbookedUsers.length ? "over" : "ok"} />
          <BriefMetric label="Unassigned" value={days(brief.unassignedWeeks.reduce((sum, week) => sum + week.workload, 0))} meta={`${brief.unassignedWeeks.reduce((sum, week) => sum + week.tasks.length, 0)} tasks`} tone={brief.unassignedWeeks.length ? "watch" : "ok"} />
          <BriefMetric label="Calendar loss" value={days(brief.calendarLoss)} meta="capacity removed" tone={brief.calendarLoss > 0 ? "watch" : "ok"} />
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <BriefRoster title="超载人员" rows={brief.topOverbookedUsers} empty="暂无超载人员" tone="over" />
          <BriefRoster title="可调配人员" rows={brief.topAvailableUsers} empty="暂无明显空余" tone="ok" />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">next decisions</p>
            <h3 className="mt-1 text-lg font-semibold text-[#f4f1e8]">建议制片会议确认</h3>
          </div>
          {brief.reliefWeek ? (
            <button type="button" onClick={() => onInspectWeek(brief.reliefWeek!.key)} className="border border-[#34322b] px-3 py-2 text-xs text-[#8cc6ff] transition hover:border-[#8cc6ff]">
              Inspect relief {brief.reliefWeek.label}
            </button>
          ) : null}
        </div>

        <div className="mt-4 space-y-2">
          {brief.actions.map((action) => (
            <div key={action.id} className={["border px-3 py-3", action.tone === "over" ? "border-[#6f2f2f] bg-[#241716]" : action.tone === "watch" ? "border-[#5a4324] bg-[#211b12]" : "border-[#294838] bg-[#13221b]"].join(" ")}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-[#f4f1e8]">{action.title}</p>
                <span className={["shrink-0 border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]", action.tone === "over" ? "border-[#6f2f2f] text-[#ff8b7c]" : action.tone === "watch" ? "border-[#5a4324] text-[#e8c678]" : "border-[#294838] text-[#75d9a7]"].join(" ")}>
                  {action.tone}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#aaa599]">{action.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResourceCellContextMenu({
  user,
  week,
  weekLabel,
  projectId,
  linkQuery,
  onInspect,
  onOpenAssignment,
}: {
  user: PlanningUserRow;
  week: PlanningUserWeek;
  weekLabel: string;
  projectId: string;
  linkQuery: string;
  onInspect: () => void;
  onOpenAssignment: (mode: "new" | "reassign") => void;
}) {
  const summary = buildCellSummary(user, week, weekLabel);
  const pressureTone = week.delta > 0 ? "Overbooked" : week.delta < -2 ? "Available" : "Balanced";
  const newTaskHref = buildResourceTaskHref(projectId, user, week, weekLabel);

  return (
    <ContextMenu.Portal>
      <ContextMenu.Content className="z-50 w-80 border border-[#3b382f] bg-[#181713] p-1 text-sm text-[#d8d3c7] shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <ContextMenu.Label className="px-3 py-2">
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">{user.name}</span>
          <span className="mt-1 block truncate text-sm font-semibold text-[#f4f1e8]">{user.department} · {weekLabel}</span>
        </ContextMenu.Label>
        <div className="mx-2 mb-1 grid grid-cols-3 border border-[#2f2c25] bg-[#11110f] text-xs">
          <ContextMetric label="Assigned" value={days(week.workload)} />
          <ContextMetric label="Capacity" value={days(week.capacity)} />
          <ContextMetric label={pressureTone} value={signedDays(week.delta)} tone={week.delta > 0 ? "over" : "ok"} />
        </div>
        <MenuItem onSelect={onInspect}>📋 Show Tasks ({week.tasks.length})</MenuItem>
        <MenuItem onSelect={onInspect}>📅 View Week Detail</MenuItem>
        <MenuItem onSelect={() => void copyText(summary)}>⌘ Copy Summary</MenuItem>
        <ContextMenu.Item asChild className="flex cursor-default items-center px-3 py-2 text-[#d8d3c7] outline-none hover:bg-[#252523]">
          <Link href={`/app/resource-planning/${encodeURIComponent(user.department)}${linkQuery}`}>↳ Open Department Drilldown</Link>
        </ContextMenu.Item>
        <Separator />
        <ContextMenu.Item asChild className="flex cursor-default items-center px-3 py-2 text-[#d8d3c7] outline-none hover:bg-[#252523]">
          <Link href={newTaskHref}>➕ Assign New Task...</Link>
        </ContextMenu.Item>
        <MenuItem onSelect={() => onOpenAssignment("reassign")}>↔ Reassign Tasks...</MenuItem>
        <MenuItem onSelect={() => downloadCsv(`resource-week-${user.id}-${week.weekKey}.csv`, buildWeekCsv(user, week, weekLabel))}>📤 Export Week Data</MenuItem>
        <Separator />
        <ContextMenu.Label className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">Tasks</ContextMenu.Label>
        {week.tasks.length > 0 ? (
          week.tasks.slice(0, 6).map((task) => (
            <ContextMenu.Item key={task.id} className="cursor-default px-3 py-2 outline-none hover:bg-[#252523]">
              <div className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-[#f4f1e8]">{task.contextLabel} · {task.name}</span>
                  <span className="mt-1 block text-[11px] text-[#8f8a7e]">{statusLabel(task.status)}</span>
                </span>
                <span className="shrink-0 font-mono text-xs text-[#e8c678]">{days(task.days)}</span>
              </div>
            </ContextMenu.Item>
          ))
        ) : (
          <ContextMenu.Item disabled className="cursor-default px-3 py-2 text-xs text-[#7f7a70] outline-none">
            No assigned tasks this week
          </ContextMenu.Item>
        )}
        {week.tasks.length > 6 ? <ContextMenu.Item disabled className="cursor-default px-3 py-2 text-xs text-[#7f7a70] outline-none">+{week.tasks.length - 6} more tasks</ContextMenu.Item> : null}
        {week.exceptions.length > 0 ? (
          <>
            <Separator />
            <ContextMenu.Label className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">Calendar exception</ContextMenu.Label>
            {week.exceptions.map((exception) => (
              <ContextMenu.Item key={`${exception.date}-${exception.type}`} className="cursor-default px-3 py-2 text-xs text-[#c9d9e8] outline-none hover:bg-[#102033]">
                {exception.date} · {exception.description ?? exception.type}
              </ContextMenu.Item>
            ))}
          </>
        ) : null}
      </ContextMenu.Content>
    </ContextMenu.Portal>
  );
}

function ResourceTaskPopover({ user, week, weekLabel }: { user: PlanningUserRow; week: PlanningUserWeek; weekLabel: string }) {
  return (
    <Popover.Portal>
      <Popover.Content
        align="end"
        sideOffset={8}
        className="z-50 w-[380px] border border-[#3b382f] bg-[#181713] p-0 text-left text-[#d8d3c7] shadow-[0_18px_60px_rgba(0,0,0,0.45)]"
      >
        <div className="border-b border-[#302d26] px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d8b46a]">assigned tasks</p>
              <h3 className="mt-1 truncate text-sm font-semibold text-[#f4f1e8]">{user.name} · {weekLabel}</h3>
              <p className="mt-1 text-xs text-[#8f8a7e]">{days(week.workload)} of {days(week.capacity)} assigned · {signedDays(week.delta)}</p>
            </div>
            <Popover.Close className="grid size-7 shrink-0 place-items-center border border-[#34322b] text-[#8f8a7e] transition hover:border-[#d8b46a] hover:text-[#f4f1e8]" aria-label="Close task popover">
              ×
            </Popover.Close>
          </div>
        </div>

        <div className="max-h-[360px] overflow-auto p-3">
          {week.tasks.length > 0 ? (
            <div className="space-y-2">
              {week.tasks.map((task) => (
                <div key={task.id} className="border border-[#2a2a28] bg-[#151410] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#f4f1e8]">{task.contextLabel} · {task.name}</p>
                      <p className="mt-1 text-xs text-[#8f8a7e]">{statusLabel(task.status)} · {task.startDate ?? "No start"} → {task.dueDate ?? "No due"}</p>
                    </div>
                    <span className="shrink-0 border border-[#3c3830] px-2 py-1 font-mono text-xs text-[#e8c678]">{days(task.days)}</span>
                  </div>
                  <MiniGanttBar taskStart={task.startDate} taskEnd={task.dueDate} weekStart={week.weekKey} />
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-[#34322b] px-4 py-10 text-center text-xs text-[#7f7a70]">
              这一周没有已分配任务。可以在任务页新建或分配任务后回到这里检查容量。
            </div>
          )}
        </div>
      </Popover.Content>
    </Popover.Portal>
  );
}

function AssignmentActionPanel({
  projectId,
  data,
  draft,
  onClose,
  onDemoDataChange,
  onSaved,
}: {
  projectId: string;
  data: ResourcePlanningData;
  draft: AssignmentDraft;
  onClose: () => void;
  onDemoDataChange: (data: ResourcePlanningData) => void;
  onSaved: () => void;
}) {
  const sourceUser = draft ? data.users.find((user) => user.id === draft.userId) : null;
  const sourceWeek = sourceUser?.weeks.find((week) => week.weekKey === draft?.weekKey) ?? null;
  const sourceWeekLabel = draft ? data.weeks.find((week) => week.key === draft.weekKey)?.label ?? draft.weekKey : "";
  const [taskId, setTaskId] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const availableUsers = data.users
    .filter((user) => user.id !== sourceUser?.id)
    .toSorted((a, b) => a.delta - b.delta || a.department.localeCompare(b.department) || a.name.localeCompare(b.name));
  const selectedTaskId = taskId || sourceWeek?.tasks[0]?.id || "";
  const selectedToUserId = toUserId || availableUsers[0]?.id || "";

  if (!draft || !sourceUser || !sourceWeek) {
    return null;
  }

  async function reassignTask() {
    if (!selectedTaskId || !selectedToUserId || !sourceUser) return;

    if (projectId === "demo-mkali-mission") {
      onDemoDataChange(reassignTaskInPlanningData(data, selectedTaskId, sourceUser.id, selectedToUserId));
      setMessage("演示任务已重新分配，容量表已即时更新。");
      return;
    }

    setPending(true);
    const response = await fetch(`/api/tasks/${selectedTaskId}/reassign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromUserId: sourceUser.id,
        toUserId: selectedToUserId,
      }),
    });
    setPending(false);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setMessage(body?.error ?? "任务重新分配失败。");
      return;
    }

    setMessage("任务已重新分配并保存。");
    onSaved();
  }

  return (
    <section className="border border-[#34322b] bg-[#181713]">
      <div className="grid gap-0 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="border-b border-[#34322b] p-4 xl:border-b-0 xl:border-r">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">assignment actions</p>
          <h2 className="mt-2 text-xl font-semibold text-[#f4f1e8]">资源分配操作</h2>
          <p className="mt-2 text-sm leading-6 text-[#aaa599]">
            {sourceUser.name} · {sourceUser.department} · {sourceWeekLabel}
          </p>
          <div className="mt-4 grid grid-cols-3 border border-[#2a2a28] bg-[#11110f] text-xs">
            <ContextMetric label="Assigned" value={days(sourceWeek.workload)} />
            <ContextMetric label="Capacity" value={days(sourceWeek.capacity)} />
            <ContextMetric label={sourceWeek.delta > 0 ? "Over" : "Delta"} value={signedDays(sourceWeek.delta)} tone={sourceWeek.delta > 0 ? "over" : "ok"} />
          </div>
          {message ? <p className="mt-3 border border-[#2f2c25] bg-[#11110f] px-3 py-2 text-xs text-[#c9c3b5]">{message}</p> : null}
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)_auto]">
          <Field label="选择任务">
            <select
              value={selectedTaskId}
              onChange={(event) => setTaskId(event.target.value)}
              className="h-10 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm text-[#f4f1e8] outline-none focus:border-[#d8b46a]"
            >
              {sourceWeek.tasks.length > 0 ? (
                sourceWeek.tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.contextLabel} / {task.name} · {days(task.days)}
                  </option>
                ))
              ) : (
                <option value="">这一周没有可重分配任务</option>
              )}
            </select>
          </Field>

          <Field label="转给人员">
            <select
              value={selectedToUserId}
              onChange={(event) => setToUserId(event.target.value)}
              className="h-10 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm text-[#f4f1e8] outline-none focus:border-[#d8b46a]"
            >
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.department} / {user.name} / {signedDays(user.delta)}
                </option>
              ))}
            </select>
          </Field>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={reassignTask}
              disabled={pending || !selectedTaskId || !selectedToUserId || sourceWeek.tasks.length === 0}
              className="h-10 bg-[#d8b46a] px-4 text-sm font-semibold text-[#171713] transition hover:bg-[#edc875] disabled:opacity-50"
            >
              {pending ? "保存中" : "重新分配"}
            </button>
            <button type="button" onClick={onClose} className="h-10 border border-[#34322b] px-4 text-sm text-[#aaa599] transition hover:text-[#f4f1e8]">
              关闭
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniGanttBar({ taskStart, taskEnd, weekStart }: { taskStart: string | null; taskEnd: string | null; weekStart: string }) {
  const weekStartDate = parseDate(weekStart);
  const taskStartDate = parseDate(taskStart);
  const taskEndDate = parseDate(taskEnd);
  const visibleStart = taskStartDate && weekStartDate ? Math.max(0, Math.min(6, diffDays(taskStartDate, weekStartDate))) : 0;
  const visibleEnd = taskEndDate && weekStartDate ? Math.max(0, Math.min(6, diffDays(taskEndDate, weekStartDate))) : visibleStart;
  const width = Math.max(12, ((visibleEnd - visibleStart + 1) / 7) * 100);
  const left = (visibleStart / 7) * 100;

  return (
    <div className="mt-3">
      <div className="mb-1 grid grid-cols-7 text-center font-mono text-[9px] text-[#5f5b52]">
        {["M", "T", "W", "T", "F", "S", "S"].map((label, index) => (
          <span key={`${label}-${index}`}>{label}</span>
        ))}
      </div>
      <div className="relative h-2 bg-[#24231f]">
        <div className="absolute top-0 h-full bg-[#d8b46a]" style={{ left: `${left}%`, width: `${Math.min(100 - left, width)}%` }} />
      </div>
    </div>
  );
}

function ResourceGridSummaryRow({
  label,
  subtitle,
  weeks,
  totalValue,
  totalLabel,
  gridTemplateColumns,
  mode,
}: {
  label: string;
  subtitle: string;
  weeks: { weekKey: string; value: number; detail?: string; title: string }[];
  totalValue: number;
  totalLabel: string;
  gridTemplateColumns: string;
  mode: "delta" | "unassigned";
}) {
  return (
    <div className="grid min-h-14 border-b border-[#34322b] text-xs" style={{ gridTemplateColumns }}>
      <div className="sticky left-0 z-10 flex min-w-0 items-center justify-between gap-3 bg-[#20201d] px-4 shadow-[1px_0_0_#34322b]">
        <div className="min-w-0">
          <p className="truncate font-semibold text-[#f4f1e8]">{label}</p>
          <p className="mt-1 truncate text-[11px] text-[#8f8a7e]">{subtitle}</p>
        </div>
        <span className="shrink-0 border border-[#3a372f] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[#8f8a7e]">sum</span>
      </div>
      {weeks.map((week) => (
        <div key={week.weekKey} className={["border-l border-[#34322b] px-3 py-2 text-right font-mono", summaryTone(week.value, mode)].join(" ")} title={week.title}>
          <p className="text-sm">{mode === "delta" ? signedDays(week.value) : days(week.value)}</p>
          <p className="mt-1 text-[10px] opacity-70">{week.detail ?? summaryDetail(week.value, mode)}</p>
        </div>
      ))}
      <div className={["border-l border-[#34322b] px-3 py-2 text-right font-mono", summaryTone(totalValue, mode)].join(" ")}>
        <p>{totalLabel}</p>
        <p className="mt-1 text-[10px] opacity-70">window</p>
      </div>
    </div>
  );
}

function DepartmentHeatmap({ data, linkQuery }: { data: ResourcePlanningData; linkQuery: string }) {
  return (
    <div className="overflow-auto p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">heatmap legend</p>
          <p className="mt-1 text-[#aaa599]">蓝色代表富余，红色代表超载，斜纹代表当周有停工或缩短工时。</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="bg-[#102944] px-2 py-1 text-[#8cc6ff]">&lt; -6d</span>
          <span className="bg-[#142233] px-2 py-1 text-[#7bb8ff]">under</span>
          <span className="bg-[#20201d] px-2 py-1 text-[#aaa599]">0d</span>
          <span className="bg-[#2d1a1a] px-2 py-1 text-[#ff8b7c]">over</span>
          <span className="bg-[#4a1f1f] px-2 py-1 text-[#ffb0a4]">&gt; +4d</span>
        </div>
      </div>
      <div className="min-w-[820px] space-y-2">
        {data.departments.map((department) => (
          <div key={department.department} className="grid items-center gap-2 text-xs" style={{ gridTemplateColumns: `160px repeat(${data.weeks.length}, minmax(64px, 1fr))` }}>
            <Link href={`/app/resource-planning/${encodeURIComponent(department.department)}${linkQuery}`} className="truncate text-[#c9c3b5] transition hover:text-[#e8c678]">
              {department.department}
            </Link>
            {department.weeks.map((week) => (
              <div
                key={week.weekKey}
                className={["px-2 py-2 text-right font-mono", heatTone(week.delta)].join(" ")}
                style={week.unavailableDays > 0 ? exceptionCellStyle : undefined}
                title={week.unavailableDays > 0 ? `Calendar exception: -${days(week.unavailableDays)}` : undefined}
              >
                {signedDays(week.delta)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MenuItem({ children, onSelect }: { children: ReactNode; onSelect?: () => void }) {
  return (
    <ContextMenu.Item onSelect={onSelect} className="flex cursor-default items-center px-3 py-2 text-[#d8d3c7] outline-none hover:bg-[#252523]">
      {children}
    </ContextMenu.Item>
  );
}

function Separator() {
  return <ContextMenu.Separator className="my-1 h-px bg-[#302d26]" />;
}

function ContextMetric({ label, value, tone = "normal" }: { label: string; value: string; tone?: "normal" | "ok" | "over" }) {
  return (
    <div className="border-r border-[#2f2c25] px-2 py-2 last:border-r-0">
      <p className="text-[10px] uppercase tracking-[0.12em] text-[#7f7a70]">{label}</p>
      <p className={["mt-1 font-mono text-xs font-semibold", tone === "over" ? "text-[#ff8b7c]" : tone === "ok" ? "text-[#75d9a7]" : "text-[#f4f1e8]"].join(" ")}>{value}</p>
    </div>
  );
}

function CapacityTooltip({ active, payload, label, onInspect }: { active?: boolean; payload?: { payload?: CapacityWeek }[]; label?: string; onInspect: (weekKey: string) => void }) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;

  return (
    <div className="w-64 border border-[#3b382f] bg-[#181713] p-3 text-xs text-[#d8d3c7] shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d8b46a]">week inspect</p>
          <p className="mt-1 font-semibold text-[#f4f1e8]">{label ?? point.label}</p>
        </div>
        <button type="button" onClick={() => onInspect(point.key)} className="border border-[#34322b] px-2 py-1 text-[11px] text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]">
          Inspect
        </button>
      </div>
      <div className="mt-3 grid grid-cols-3 border border-[#2a2a28] bg-[#11110f]">
        <ContextMetric label="Capacity" value={days(point.capacity)} />
        <ContextMetric label="Workload" value={days(point.workload)} />
        <ContextMetric label={point.daysOverUnder > 0 ? "Over" : "Under"} value={signedDays(point.daysOverUnder)} tone={point.daysOverUnder > 0 ? "over" : "ok"} />
      </div>
      {point.exceptions.length > 0 ? (
        <div className="mt-3 border border-[#22354a] bg-[#101b28] px-2 py-2 text-[#c9d9e8]">
          <p className="font-semibold uppercase tracking-[0.12em] text-[#8cc6ff]">calendar</p>
          <p className="mt-1 font-mono">-{days(point.unavailableDays)} capacity</p>
        </div>
      ) : null}
    </div>
  );
}

function CapacityDot(props: { cx?: number; cy?: number; payload?: CapacityWeek; stroke?: string; inspectWeekKey: string | "all"; dataKeyName: string }) {
  const { cx, cy, payload, stroke, inspectWeekKey, dataKeyName } = props;
  if (typeof cx !== "number" || typeof cy !== "number") return null;
  const active = inspectWeekKey !== "all" && payload?.key === inspectWeekKey;
  const isWorkload = dataKeyName === "workload";

  if (!active && !isWorkload) return null;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={active ? 5 : 3}
      fill={active ? "#181713" : stroke}
      stroke={active ? "#f4f1e8" : stroke}
      strokeWidth={active ? 2 : 1}
    />
  );
}

function OverUnderArea({ data }: { data: ResourcePlanningData }) {
  return (
    <div className="p-4">
      <ResponsiveContainer width="100%" height={286} minWidth={1} minHeight={1} initialDimension={{ width: 560, height: 286 }}>
        <AreaChart data={data.capacity} margin={{ top: 10, right: 18, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#2a2a28" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#8f8a7e", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#5a564e" }} />
          <Area type="monotone" dataKey="workload" name="Workload" stroke="#d8b46a" fill="#d8b46a" fillOpacity={0.22} />
          <Area type="monotone" dataKey="capacity" name="Capacity" stroke="#4a9eff" fill="#4a9eff" fillOpacity={0.16} />
          <Area type="monotone" dataKey="daysOverUnder" name="Days over/under" stroke="#ff8b7c" fill="#ff8b7c" fillOpacity={0.14} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function InspectDataRow({ row, total = false }: { row: InspectRow; total?: boolean }) {
  const maxValue = Math.max(row.capacity, row.workload, 1);
  const capacityWidth = `${Math.max(4, (row.capacity / maxValue) * 100)}%`;
  const workloadWidth = `${Math.max(4, (row.workload / maxValue) * 100)}%`;

  return (
    <div className={["border px-3 py-2 text-xs", total ? "border-[#5a4524] bg-[#201b12]" : "border-[#2a2a28]"].join(" ")}>
      <div className="grid grid-cols-[1fr_72px] gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-[#c9c3b5]">{row.name}</p>
          <p className="truncate text-[11px] text-[#7f7a70]">{row.subtitle}</p>
        </div>
        <span className={["text-right font-mono", row.delta > 0 ? "text-[#ff8b7c]" : "text-[#75d9a7]"].join(" ")}>{signedDays(row.delta)}</span>
      </div>
      <div className="mt-2 space-y-1">
        <div className="h-1.5 bg-[#24231f]">
          <div className="h-full bg-[#4a9eff]" style={{ width: capacityWidth }} />
        </div>
        <div className="h-1.5 bg-[#24231f]">
          <div className="h-full bg-[#d8b46a]" style={{ width: workloadWidth }} />
        </div>
      </div>
    </div>
  );
}

function buildInspectTotalRow(rows: InspectRow[]): InspectRow {
  const capacity = roundDays(rows.reduce((sum, row) => sum + row.capacity, 0));
  const workload = roundDays(rows.reduce((sum, row) => sum + row.workload, 0));

  return {
    name: "Total",
    subtitle: `${rows.length} rows`,
    capacity,
    workload,
    delta: roundDays(workload - capacity),
  };
}

function ExportPlanningButton({ data, filename }: { data: ResourcePlanningData; filename: string }) {
  return (
    <button
      type="button"
      onClick={() => downloadCsv(filename, buildPlanningCsv(data))}
      className="h-8 border border-[#34322b] px-3 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
    >
      Export CSV
    </button>
  );
}

function CalendarExceptionManager({
  projectId,
  data,
  exceptions,
  baselineExceptions,
  scenarioDelta,
  onDemoDataChange,
  onSaved,
  refreshing,
}: {
  projectId: string;
  data: ResourcePlanningData;
  exceptions: PlanningCalendarException[];
  baselineExceptions: PlanningCalendarException[];
  scenarioDelta: ReturnType<typeof buildScenarioDelta>;
  onDemoDataChange: (data: ResourcePlanningData) => void;
  onSaved: () => void;
  refreshing: boolean;
}) {
  const defaultDate = data.weeks[0]?.start ?? new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(defaultDate);
  const [type, setType] = useState<ExceptionType>("STUDIO_CLOSURE");
  const [hoursWorked, setHoursWorked] = useState(4);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const sortedExceptions = exceptions
    .map((exception, index) => ({ exception, index }))
    .sort((a, b) => a.exception.date.localeCompare(b.exception.date) || a.exception.type.localeCompare(b.exception.type));
  const canAdd = date.trim().length > 0;
  const isDemo = projectId === "demo-mkali-mission";
  const statusLabel = isDemo ? "Demo scenario" : refreshing ? "Refreshing" : "Saved in database";

  async function addException() {
    if (!canAdd) return;

    const nextException: PlanningCalendarException = {
      id: `demo-calendar-${slugify(`${date}-${type}-${description || "exception"}`)}-${Date.now().toString(36)}`,
      date,
      type,
      hoursWorked: type === "REDUCED_HOURS" ? clampHours(hoursWorked) : 0,
      description: description.trim() || exceptionTypeLabel(type),
      projectId,
      inheritedFrom: isDemo ? "demo-scenario" : "project",
    };

    if (isDemo) {
      onDemoDataChange(rebuildResourcePlanningWithCalendarExceptions(data, [...exceptions, nextException].sort(sortExceptions)));
      setMessage("演示日历例外已加入，当前页面立即重算容量。");
      setDescription("");
      return;
    }

    setPendingId("create");
    const response = await fetch("/api/calendar-exceptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: nextException.date,
        type: nextException.type,
        description: nextException.description,
        hoursWorked: nextException.hoursWorked,
        projectId,
        inheritedFrom: nextException.inheritedFrom,
      }),
    });
    setPendingId(null);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setMessage(body?.error ?? "日历例外保存失败。");
      return;
    }

    setMessage("日历例外已保存到项目数据库。");
    setDescription("");
    onSaved();
  }

  async function deleteException(index: number) {
    const target = exceptions[index];
    if (!target) return;

    if (isDemo || !target.id) {
      onDemoDataChange(rebuildResourcePlanningWithCalendarExceptions(data, exceptions.filter((_, itemIndex) => itemIndex !== index)));
      setMessage("演示日历例外已删除，容量已重新计算。");
      return;
    }

    setPendingId(target.id);
    const response = await fetch(`/api/calendar-exceptions/${target.id}`, { method: "DELETE" });
    setPendingId(null);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setMessage(body?.error ?? "日历例外删除失败。");
      return;
    }

    setMessage("日历例外已从项目数据库删除。");
    onSaved();
  }

  function restoreBaseline() {
    if (!isDemo) {
      setMessage("真实项目请逐条删除需要移除的日历例外，避免误删全局节假日。");
      return;
    }

    onDemoDataChange(rebuildResourcePlanningWithCalendarExceptions(data, baselineExceptions));
    setMessage("演示日历已恢复为项目基线。");
  }

  function clearScenario() {
    if (!isDemo) {
      setMessage("真实项目不支持一键清空，请在右侧逐项删除。");
      return;
    }

    onDemoDataChange(rebuildResourcePlanningWithCalendarExceptions(data, []));
    setMessage("演示日历例外已清空。");
  }

  return (
    <div className="grid gap-0 xl:grid-cols-[420px_minmax(0,1fr)]">
      <div className="border-b border-[#2a2a28] p-4 xl:border-b-0 xl:border-r">
        <div className="mb-4 border border-[#2f2c25] bg-[#11110f] px-3 py-2 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">draft status</span>
            <span className="font-mono text-[#e8c678]">{statusLabel}</span>
          </div>
          {message ? <p className="mt-2 text-[#c9c3b5]">{message}</p> : null}
        </div>

        <div className="mb-4 grid grid-cols-3 border border-[#2f2c25] bg-[#151410] text-xs">
          <ScenarioMetric label="Capacity Δ" value={signedDays(scenarioDelta.capacity)} tone={scenarioDelta.capacity < 0 ? "watch" : "ok"} />
          <ScenarioMetric label="Loss Δ" value={signedDays(scenarioDelta.calendarLoss)} tone={scenarioDelta.calendarLoss > 0 ? "watch" : "ok"} />
          <ScenarioMetric label="Overbooked Δ" value={`${scenarioDelta.overbookedUsers > 0 ? "+" : ""}${scenarioDelta.overbookedUsers}`} tone={scenarioDelta.overbookedUsers > 0 ? "over" : "ok"} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <Field label="日期">
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="h-10 w-full border border-[#34322b] bg-[#11110f] px-3 font-mono text-sm text-[#f4f1e8] outline-none focus:border-[#d8b46a]"
            />
          </Field>

          <Field label="例外类型">
            <select
              value={type}
              onChange={(event) => setType(event.target.value as ExceptionType)}
              className="h-10 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm text-[#f4f1e8] outline-none focus:border-[#d8b46a]"
            >
              <option value="STUDIO_CLOSURE">棚内停工</option>
              <option value="REDUCED_HOURS">半日/缩短工时</option>
              <option value="HOLIDAY">节假日</option>
            </select>
          </Field>

          <Field label="可工作小时">
            <input
              type="number"
              min="0"
              max="8"
              step="0.5"
              value={type === "REDUCED_HOURS" ? hoursWorked : 0}
              onChange={(event) => setHoursWorked(Number(event.target.value))}
              disabled={type !== "REDUCED_HOURS"}
              className="h-10 w-full border border-[#34322b] bg-[#11110f] px-3 font-mono text-sm text-[#f4f1e8] outline-none focus:border-[#d8b46a] disabled:text-[#5f5b52]"
            />
          </Field>

          <Field label="备注">
            <input
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="例如：棚内电力检修 / 供应商半日审查"
              className="h-10 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm text-[#f4f1e8] outline-none placeholder:text-[#5f5b52] focus:border-[#d8b46a]"
            />
          </Field>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={addException}
            disabled={!canAdd || pendingId === "create"}
            className="h-9 bg-[#d8b46a] px-4 text-sm font-semibold text-[#171713] transition hover:bg-[#edc875] disabled:opacity-50"
          >
            {pendingId === "create" ? "保存中" : "保存修正"}
          </button>
          <button
            type="button"
            onClick={restoreBaseline}
            className="h-9 border border-[#34322b] px-3 text-sm text-[#aaa599] transition hover:bg-[#22201c] hover:text-[#f4f1e8]"
          >
            重置
          </button>
          <button
            type="button"
            onClick={clearScenario}
            className="h-9 border border-[#34322b] px-3 text-sm text-[#7f7a70] transition hover:border-[#ff8b7c] hover:text-[#ff8b7c]"
          >
            {isDemo ? "清空演示" : "批量清空"}
          </button>
        </div>
      </div>

      <div className="min-w-0">
        <div className="grid grid-cols-[116px_140px_1fr_112px_78px] border-b border-[#2a2a28] bg-[#1e1e1c] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6e6e69]">
          <span>Date</span>
          <span>Type</span>
          <span>Note</span>
          <span className="text-right">Impact</span>
          <span className="text-right">Action</span>
        </div>

        <div className="max-h-[236px] overflow-auto">
          {sortedExceptions.length > 0 ? (
            sortedExceptions.map(({ exception, index }) => (
              <div key={`${exception.date}-${exception.type}-${index}`} className="grid grid-cols-[116px_140px_1fr_112px_78px] items-center border-b border-[#2a2a28] px-4 py-3 text-xs">
                <span className="font-mono text-[#8cc6ff]">{exception.date}</span>
                <span className="text-[#c9c3b5]">{exceptionTypeLabel(exception.type)}</span>
                <span className="min-w-0 truncate text-[#aaa599]">{exception.description ?? "No note"}</span>
                <span className="text-right font-mono text-[#e8c678]">-{days(exceptionLoss(exception) * data.users.length)}</span>
                <button type="button" onClick={() => deleteException(index)} disabled={pendingId === exception.id} className="text-right text-[#7f7a70] transition hover:text-[#ff8b7c] disabled:opacity-45">
                  {pendingId === exception.id ? "删除中" : "删除"}
                </button>
              </div>
            ))
          ) : (
            <div className="px-4 py-10 text-center text-sm text-[#8f8a7e]">没有例外日期，当前按完整工作周计算。</div>
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarExceptionList({ data, compact = false }: { data: ResourcePlanningData; compact?: boolean }) {
  const exceptions = data.calendarExceptions.slice(0, compact ? 2 : undefined);

  if (exceptions.length === 0) {
    return <p className="mt-2 text-xs leading-6 text-[#aaa599]">当前窗口没有停工或半日例外。</p>;
  }

  return (
    <div className="mt-2 space-y-2">
      {exceptions.map((exception) => (
        <div key={`${exception.date}-${exception.type}`} className="grid grid-cols-[88px_1fr] gap-3 text-xs leading-5">
          <span className="font-mono text-[#8cc6ff]">{exception.date}</span>
          <span className="truncate text-[#aaa599]">{exception.description ?? exception.type}</span>
        </div>
      ))}
    </div>
  );
}

function exceptionTypeLabel(type: ExceptionType) {
  if (type === "REDUCED_HOURS") return "缩短工时";
  if (type === "HOLIDAY") return "节假日";
  return "棚内停工";
}

function exceptionLoss(exception: PlanningCalendarException) {
  if (exception.type === "REDUCED_HOURS") {
    return roundDays(Math.max(0, Math.min(1, (8 - exception.hoursWorked) / 8)));
  }

  return 1;
}

function sortExceptions(a: PlanningCalendarException, b: PlanningCalendarException) {
  return a.date.localeCompare(b.date) || a.type.localeCompare(b.type);
}

function clampHours(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(8, value));
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">{label}</span>
      {children}
    </label>
  );
}

function PanelHeader({ eyebrow, title, meta, actions }: { eyebrow: string; title: string; meta?: string; actions?: ReactNode }) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-4 border-b border-[#34322b] px-4 py-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d8b46a]">{eyebrow}</p>
        <h2 className="mt-1 truncate text-lg font-semibold">{title}</h2>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {meta ? <p className="hidden text-xs text-[#8f8a7e] 2xl:block">{meta}</p> : null}
        {actions}
      </div>
    </div>
  );
}

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex border border-[#34322b] bg-[#11110f]" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={[
            "h-8 px-3 text-xs font-semibold transition",
            value === option.value ? "bg-[#d8b46a] text-[#171713]" : "text-[#aaa599] hover:bg-[#22201c] hover:text-[#f4f1e8]",
          ].join(" ")}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Metric({ label, value, tone = "normal" }: { label: string; value: string; tone?: "normal" | "ok" | "watch" | "over" }) {
  return (
    <div className="border-r border-b border-[#2a2a28] px-4 py-3 last:border-r-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7f7a70]">{label}</p>
      <p className={["mt-2 font-mono text-xl font-semibold", metricTone(tone)].join(" ")}>{value}</p>
    </div>
  );
}

function ScenarioMetric({ label, value, tone = "normal" }: { label: string; value: string; tone?: "normal" | "ok" | "watch" | "over" }) {
  return (
    <div className="border-r border-[#2a2a28] px-3 py-2 last:border-r-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7f7a70]">{label}</p>
      <p className={["mt-1 font-mono text-sm font-semibold", metricTone(tone)].join(" ")}>{value}</p>
    </div>
  );
}

function MiniMetric({ label, value, tone = "normal" }: { label: string; value: string; tone?: "normal" | "ok" | "over" }) {
  return (
    <div className="border-r border-[#2a2a28] px-2 py-3 last:border-r-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7f7a70]">{label}</p>
      <p className={["mt-2 font-mono text-sm font-semibold", metricTone(tone)].join(" ")}>{value}</p>
    </div>
  );
}

function BriefMetric({
  label,
  value,
  meta,
  tone = "normal",
  onClick,
}: {
  label: string;
  value: string;
  meta: string;
  tone?: "normal" | "ok" | "watch" | "over";
  onClick?: () => void;
}) {
  const className = [
    "min-h-24 border border-[#2f2c25] bg-[#11110f] px-3 py-3 text-left transition",
    onClick ? "hover:border-[#d8b46a] hover:bg-[#17150f] focus:outline-none focus:ring-2 focus:ring-[#d8b46a]" : "",
  ].join(" ");

  const content = (
    <>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7f7a70]">{label}</p>
      <p className={["mt-2 truncate font-mono text-xl font-semibold", metricTone(tone)].join(" ")}>{value}</p>
      <p className="mt-2 truncate text-xs text-[#8f8a7e]">{meta}</p>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}

function BriefRoster({
  title,
  rows,
  empty,
  tone,
}: {
  title: string;
  rows: PlanningUserRow[];
  empty: string;
  tone: "ok" | "over";
}) {
  const valueClass = tone === "over" ? "text-[#ff8b7c]" : "text-[#8cc6ff]";

  return (
    <div className="border border-[#2f2c25] bg-[#11110f]">
      <div className="border-b border-[#2a2a28] px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">{title}</p>
      </div>
      <div className="divide-y divide-[#24231f]">
        {rows.length > 0 ? (
          rows.slice(0, 4).map((row) => (
            <div key={row.id} className="grid grid-cols-[minmax(0,1fr)_76px] items-center gap-3 px-3 py-2 text-xs">
              <div className="min-w-0">
                <p className="truncate font-medium text-[#f4f1e8]">{row.name}</p>
                <p className="mt-1 truncate text-[11px] text-[#8f8a7e]">{row.department} · {days(row.totalWorkload)} / {days(row.totalCapacity)}</p>
              </div>
              <span className={["text-right font-mono font-semibold", valueClass].join(" ")}>{signedDays(row.delta)}</span>
            </div>
          ))
        ) : (
          <div className="px-3 py-8 text-center text-xs text-[#7f7a70]">{empty}</div>
        )}
      </div>
    </div>
  );
}

function metricTone(tone: "normal" | "ok" | "watch" | "over") {
  if (tone === "over") return "text-[#ff8b7c]";
  if (tone === "watch") return "text-[#e8c678]";
  if (tone === "ok") return "text-[#75d9a7]";
  return "text-[#f4f1e8]";
}

function buildInspectRows(data: ResourcePlanningData, group: InspectGroup, weekKey: string | "all"): InspectRow[] {
  if (group === "user") {
    return data.users.map((user) => ({
      name: user.name,
      subtitle: weekKey === "all" ? user.department : `${user.department} · ${weekKey}`,
      capacity: weekKey === "all" ? user.totalCapacity : user.weeks.find((week) => week.weekKey === weekKey)?.capacity ?? 0,
      workload: weekKey === "all" ? user.totalWorkload : user.weeks.find((week) => week.weekKey === weekKey)?.workload ?? 0,
      delta: weekKey === "all" ? user.delta : user.weeks.find((week) => week.weekKey === weekKey)?.delta ?? 0,
    }));
  }

  return data.departments.map((department) => {
    const weeks = weekKey === "all" ? department.weeks : department.weeks.filter((week) => week.weekKey === weekKey);
    const capacity = roundDays(weeks.reduce((sum, week) => sum + week.capacity, 0));
    const workload = roundDays(weeks.reduce((sum, week) => sum + week.workload, 0));

    return {
      name: department.department,
      subtitle: weekKey === "all" ? `${department.weeks.length} weeks` : weekKey,
      capacity,
      workload,
      delta: roundDays(workload - capacity),
    };
  });
}

function findDefaultCell(data: ResourcePlanningData): SelectedCell | null {
  const overbooked = data.users.flatMap((user) => user.weeks.map((week) => ({ userId: user.id, weekKey: week.weekKey, score: week.delta }))).sort((a, b) => b.score - a.score)[0];

  if (overbooked) return { userId: overbooked.userId, weekKey: overbooked.weekKey };

  const firstUser = data.users[0];
  const firstWeek = firstUser?.weeks[0];
  return firstUser && firstWeek ? { userId: firstUser.id, weekKey: firstWeek.weekKey } : null;
}

function cellTone(delta: number) {
  if (delta > 1) return "bg-[#301b1b] text-[#ff8b7c]";
  if (delta < -2) return "bg-[#142233] text-[#7bb8ff]";
  return "bg-[#11110f] text-[#c9c3b5]";
}

function heatTone(delta: number) {
  if (delta > 4) return "bg-[#4a1f1f] text-[#ffb0a4]";
  if (delta > 0) return "bg-[#2d1a1a] text-[#ff8b7c]";
  if (delta < -6) return "bg-[#102944] text-[#8cc6ff]";
  if (delta < 0) return "bg-[#142233] text-[#7bb8ff]";
  return "bg-[#20201d] text-[#aaa599]";
}

function summaryTone(value: number, mode: "delta" | "unassigned") {
  if (mode === "unassigned") {
    if (value > 0) return "bg-[#2c2514] text-[#e8c678]";
    return "bg-[#11110f] text-[#7f7a70]";
  }

  return cellTone(value);
}

function summaryDetail(value: number, mode: "delta" | "unassigned") {
  if (mode === "unassigned") return value > 0 ? "needs owner" : "clear";
  if (value > 1) return "over";
  if (value < -2) return "available";
  return "balanced";
}

function days(value: number) {
  return `${numberFormatter.format(value)}d`;
}

function signedDays(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${numberFormatter.format(rounded)}d`;
}

function calendarLoss(data: ResourcePlanningData) {
  return roundDays(data.weeks.reduce((sum, week) => sum + week.unavailableDays * data.users.length, 0));
}

function weekLabel(data: ResourcePlanningData, weekKey: string) {
  return data.weeks.find((week) => week.key === weekKey)?.label ?? weekKey;
}

function buildScenarioDelta(activeData: ResourcePlanningData, baselineData: ResourcePlanningData) {
  return {
    capacity: roundDays(activeData.totals.capacity - baselineData.totals.capacity),
    calendarLoss: roundDays(calendarLoss(activeData) - calendarLoss(baselineData)),
    overbookedUsers: activeData.totals.overbookedUsers - baselineData.totals.overbookedUsers,
  };
}

function buildResourceDecisionBrief(data: ResourcePlanningData): ResourceDecisionBriefData {
  const pressureCandidate = data.capacity.length
    ? [...data.capacity].sort((a, b) => b.daysOverUnder - a.daysOverUnder)[0]
    : null;
  const pressureWeek = pressureCandidate && pressureCandidate.daysOverUnder > 0 ? pressureCandidate : null;
  const reliefCandidate = data.capacity.length
    ? [...data.capacity].sort((a, b) => a.daysOverUnder - b.daysOverUnder)[0]
    : null;
  const reliefWeek = reliefCandidate && reliefCandidate.daysOverUnder < -1 ? reliefCandidate : null;
  const topOverbookedUsers = data.users
    .filter((user) => user.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 4);
  const topAvailableUsers = data.users
    .filter((user) => user.delta < -2)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 4);
  const unassignedWeeks = data.unassignedWeeks
    .filter((week) => week.workload > 0)
    .sort((a, b) => b.workload - a.workload);
  const loss = calendarLoss(data);
  const unassignedTotal = roundDays(unassignedWeeks.reduce((sum, week) => sum + week.workload, 0));
  const unassignedTaskCount = unassignedWeeks.reduce((sum, week) => sum + week.tasks.length, 0);
  const actions: ResourceDecisionAction[] = [];

  if (pressureWeek && pressureWeek.daysOverUnder > 0) {
    actions.push({
      id: "pressure-week",
      title: `冻结 ${pressureWeek.label} 的新增需求`,
      detail: `该周工作量已经超出 ${days(pressureWeek.daysOverUnder)}。建议先移动低优先级任务、追加短租人手，或确认是否允许加班。`,
      tone: "over",
    });
  }

  if (topOverbookedUsers.length > 0) {
    actions.push({
      id: "overbooked-users",
      title: "先处理人员过载",
      detail: `${topOverbookedUsers.map((user) => `${user.name} ${signedDays(user.delta)}`).join("、")} 是当前窗口最高压力人员，建议在排期会逐人确认可移交任务。`,
      tone: "over",
    });
  }

  if (unassignedWeeks.length > 0) {
    actions.push({
      id: "unassigned-work",
      title: "给未分配任务指定负责人",
      detail: `${unassignedTaskCount} 个任务还没有进入个人容量表，共 ${days(unassignedTotal)}。高峰集中在 ${unassignedWeeks.slice(0, 3).map((week) => weekLabel(data, week.weekKey)).join("、")}。`,
      tone: "watch",
    });
  }

  if (loss > 0) {
    actions.push({
      id: "calendar-loss",
      title: "确认停工/半日损失的追回方案",
      detail: `日历例外移除了 ${days(loss)} 产能。建议在制片会议里明确是顺延交付、转移班组，还是增加供应商支持。`,
      tone: "watch",
    });
  }

  if (topAvailableUsers.length > 0) {
    actions.push({
      id: "available-users",
      title: "把可移动任务转入空余人员",
      detail: `${topAvailableUsers.map((user) => `${user.name} ${signedDays(user.delta)}`).join("、")} 还有可用窗口，可作为过载人员的第一批接收对象。`,
      tone: "ok",
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: "balanced-window",
      title: "当前资源窗口可以进入例行跟踪",
      detail: "没有明显过载、未分配任务或日历损失。建议保留每周容量复盘，避免后续任务导入后才发现风险。",
      tone: "ok",
    });
  }

  const briefText = [
    "制片资源决策摘要",
    `窗口容量: ${days(data.totals.capacity)} / 工作量: ${days(data.totals.workload)} / 差额: ${signedDays(data.totals.delta)}`,
    pressureWeek ? `压力周: ${pressureWeek.label} (${signedDays(pressureWeek.daysOverUnder)})` : "压力周: 暂无",
    reliefWeek ? `可调配周: ${reliefWeek.label} (${signedDays(reliefWeek.daysOverUnder)})` : "可调配周: 暂无明显富余",
    `过载人员: ${topOverbookedUsers.length ? topOverbookedUsers.map((user) => `${user.name} ${signedDays(user.delta)}`).join("、") : "暂无"}`,
    `未分配任务: ${days(unassignedTotal)} / ${unassignedTaskCount} 个任务`,
    `日历损失: ${days(loss)}`,
    "建议动作:",
    ...actions.map((action, index) => `${index + 1}. ${action.title} - ${action.detail}`),
  ].join("\n");

  return {
    pressureWeek,
    reliefWeek,
    topOverbookedUsers,
    topAvailableUsers,
    unassignedWeeks,
    calendarLoss: loss,
    actions,
    briefText,
  };
}

function buildPlanningCsv(data: ResourcePlanningData) {
  const rows = [
    ["department", "user", "week", "capacity_days", "workload_days", "delta_days", "task_count", "calendar_exception_days", "exceptions"],
    ...data.unassignedWeeks.flatMap((week) => {
      const weekMeta = data.weeks.find((item) => item.key === week.weekKey);

      return week.tasks.map((task) => [
        "Unassigned",
        "Unassigned",
        weekMeta?.label ?? week.weekKey,
        "0",
        String(task.days),
        String(task.days),
        "1",
        "0",
        `${task.contextLabel} ${task.name} ${statusLabel(task.status)}`,
      ]);
    }),
    ...data.users.flatMap((user) =>
      user.weeks.map((week) => {
        const weekMeta = data.weeks.find((item) => item.key === week.weekKey);

        return [
          user.department,
          user.name,
          weekMeta?.label ?? week.weekKey,
          String(week.capacity),
          String(week.workload),
          String(week.delta),
          String(week.tasks.length),
          String(week.unavailableDays),
          week.exceptions.map((exception) => `${exception.date} ${exception.description ?? exception.type}`).join(" | "),
        ];
      }),
    ),
  ];

  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function buildWeekCsv(user: PlanningUserRow, week: PlanningUserWeek, weekLabel: string) {
  const rows = [
    ["department", "user", "week", "capacity_days", "workload_days", "delta_days", "task", "context", "status", "task_days", "start_date", "due_date"],
    [
      user.department,
      user.name,
      weekLabel,
      String(week.capacity),
      String(week.workload),
      String(week.delta),
      "Week Total",
      "",
      "",
      String(week.workload),
      "",
      "",
    ],
    ...week.tasks.map((task) => [
      user.department,
      user.name,
      weekLabel,
      String(week.capacity),
      String(week.workload),
      String(week.delta),
      task.name,
      task.contextLabel,
      statusLabel(task.status),
      String(task.days),
      task.startDate ?? "",
      task.dueDate ?? "",
    ]),
  ];

  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function buildInspectCsv(rows: InspectRow[], group: InspectGroup, windowLabel: string) {
  const total = buildInspectTotalRow(rows);
  const csvRows = [
    ["group_by", "window", "name", "subtitle", "capacity_days", "workload_days", "delta_days"],
    ...rows.map((row) => [group, windowLabel, row.name, row.subtitle, String(row.capacity), String(row.workload), String(row.delta)]),
    [group, windowLabel, total.name, total.subtitle, String(total.capacity), String(total.workload), String(total.delta)],
  ];

  return csvRows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function roundDays(value: number) {
  return Math.round(value * 10) / 10;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function buildCellSummary(user: PlanningUserRow, week: PlanningUserWeek, weekLabel: string) {
  const taskLines = week.tasks.length
    ? week.tasks.map((task) => `- ${task.contextLabel} / ${task.name}: ${days(task.days)} (${statusLabel(task.status)})`).join("\n")
    : "- No assigned tasks";
  const exceptionLines = week.exceptions.length
    ? `\nCalendar exceptions:\n${week.exceptions.map((exception) => `- ${exception.date}: ${exception.description ?? exception.type}`).join("\n")}`
    : "";

  return [
    `${user.name} · ${user.department} · ${weekLabel}`,
    `Assigned: ${days(week.workload)} / Capacity: ${days(week.capacity)} / Delta: ${signedDays(week.delta)}`,
    "Tasks:",
    taskLines,
    exceptionLines,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildResourceTaskHref(projectId: string, user: PlanningUserRow, week: PlanningUserWeek, weekLabel: string) {
  const params = new URLSearchParams();
  params.set("action", "new-task");
  params.set("assigneeId", user.id);
  params.set("startDate", week.weekKey);
  params.set("dueDate", addDaysToIsoDate(week.weekKey, 4));
  params.set("name", `${user.department} ${weekLabel} resource task`);

  return `/app/projects/${projectId}/tasks?${params.toString()}`;
}

function addDaysToIsoDate(value: string, daysToAdd: number) {
  const date = parseDate(value);
  if (!date) return value;
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().slice(0, 10);
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    // Clipboard can be blocked in some browser contexts; the menu action should remain harmless.
  }
}

function parseDate(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function diffDays(a: Date, b: Date) {
  return Math.round((a.getTime() - b.getTime()) / 86_400_000);
}

function slugify(value: string) {
  return value.toLowerCase().trim().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-|-$/g, "");
}

const tooltipStyle = {
  background: "#181713",
  border: "1px solid #34322b",
  color: "#f4f1e8",
  fontSize: 12,
};

const exceptionCellStyle = {
  backgroundImage:
    "linear-gradient(135deg, rgba(255,255,255,0.055) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.055) 50%, rgba(255,255,255,0.055) 75%, transparent 75%, transparent)",
  backgroundSize: "12px 12px",
};
