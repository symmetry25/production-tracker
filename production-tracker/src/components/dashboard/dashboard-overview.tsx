import { CountdownWidget } from "@/components/dashboard/countdown-widget";
import { CrewTable } from "@/components/dashboard/crew-table";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { DonutChart, HorizontalBars, StackedAreaChart, StackedBarChart, VelocityChart, VersionStatusBars } from "@/components/dashboard/dashboard-charts";
import { LatestVersionFilmstrip } from "@/components/dashboard/latest-version-filmstrip";
import { ProducerCommandCenter } from "@/components/dashboard/producer-command-center";
import { ProducerDecisionBriefCard } from "@/components/dashboard/producer-decision-brief-card";
import { ResourcePulseCard } from "@/components/dashboard/resource-pulse-card";
import type { DashboardStats } from "@/lib/dashboard-data";
import type { Dictionary } from "@/lib/i18n";
import type { OverviewResourcePulse } from "@/lib/overview-resource-pulse";
import type { ProducerDecisionBrief } from "@/lib/producer-decision-brief";
import type { ScheduleSuggestionSummary } from "@/lib/schedule-suggestions";
import { PIPELINE_STEPS, STATUS_COLORS } from "@/lib/status-colors";
import type { TaskTableItem } from "@/lib/task-data";
import Link from "next/link";
import type { ReactNode } from "react";

export function DashboardOverview({
  projectId,
  stats,
  tasks,
  scheduleSummary,
  resourcePulse,
  decisionBrief,
  labels,
}: {
  projectId: string;
  stats: DashboardStats;
  tasks: TaskTableItem[];
  scheduleSummary: ScheduleSuggestionSummary;
  resourcePulse: OverviewResourcePulse;
  decisionBrief: ProducerDecisionBrief;
  labels: Dictionary["pages"]["overview"];
}) {
  const chartLabels = labels.charts;

  return (
    <div className="space-y-5">
      <ProducerCommandCenter projectId={projectId} stats={stats} tasks={tasks} scheduleSummary={scheduleSummary} labels={labels.producerCommand} />

      <ProducerDecisionBriefCard brief={decisionBrief} labels={labels.decisionBrief} />

      <ProductionTrackingConsole projectId={projectId} stats={stats} tasks={tasks} labels={labels} />

      <ResourcePulseCard pulse={resourcePulse} labels={labels.resourcePulse} />

      <CountdownWidget project={stats.project} counts={stats.counts} labels={labels.countdown} />

      <div className="grid grid-cols-[0.9fr_1.1fr] gap-5">
        <DashboardPanel title={chartLabels.shotStatus.title} eyebrow={chartLabels.shotStatus.eyebrow}>
          <DonutChart data={stats.shotStatus} labels={chartLabels} />
        </DashboardPanel>
        <DashboardPanel title={chartLabels.assetStatus.title} eyebrow={chartLabels.assetStatus.eyebrow}>
          <StackedBarChart data={stats.assetStatus} labels={chartLabels} />
        </DashboardPanel>
      </div>

      <div className="grid grid-cols-[1.25fr_0.75fr] gap-5">
        <DashboardPanel title={chartLabels.taskStatus.title} eyebrow={chartLabels.taskStatus.eyebrow}>
          <StackedAreaChart data={stats.taskStatus} labels={chartLabels} />
        </DashboardPanel>
        <DashboardPanel title={chartLabels.pctFinalByDept.title} eyebrow={chartLabels.pctFinalByDept.eyebrow}>
          <HorizontalBars data={stats.pctFinalByDept} labels={chartLabels} />
        </DashboardPanel>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-5">
        <DashboardPanel title={chartLabels.velocity.title} eyebrow={chartLabels.velocity.eyebrow}>
          <VelocityChart data={stats.velocity} labels={chartLabels} />
        </DashboardPanel>
        <DashboardPanel title={chartLabels.versionStatus.title} eyebrow={chartLabels.versionStatus.eyebrow}>
          <VersionStatusBars data={stats.versionStatus} labels={chartLabels} />
        </DashboardPanel>
      </div>

      <DashboardPanel title={chartLabels.latestVersions.title} eyebrow={chartLabels.latestVersions.eyebrow}>
        <LatestVersionFilmstrip versions={stats.latestVersions} labels={chartLabels.media} />
      </DashboardPanel>

      <DashboardPanel title={chartLabels.crew.title} eyebrow={chartLabels.crew.eyebrow}>
        <CrewTable crew={stats.crew} labels={chartLabels.crewTable} />
      </DashboardPanel>
    </div>
  );
}

function ProductionTrackingConsole({
  projectId,
  stats,
  tasks,
  labels,
}: {
  projectId: string;
  stats: DashboardStats;
  tasks: TaskTableItem[];
  labels: Dictionary["pages"]["overview"];
}) {
  const copy = labels.trackingConsole;
  const shotRows = buildShotRows(tasks);
  const reviewVersions = stats.latestVersions
    .filter((version) => version.status === "PENDING_REVIEW" || version.status === "CHANGES_REQUESTED" || version.status === "VIEWED")
    .slice(0, 5);
  const crewRows = stats.crew.slice().sort((a, b) => b.loadPct - a.loadPct || b.taskCount - a.taskCount).slice(0, 5);

  return (
    <section className="border border-[#34322b] bg-[#151410]">
      <div className="grid border-b border-[#34322b] xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="border-b border-[#34322b] p-5 xl:border-b-0 xl:border-r">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">{copy.eyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold text-[#f4f1e8]">{copy.title}</h2>
          <p className="mt-3 text-sm leading-6 text-[#aaa599]">{copy.description}</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <ConsoleMetric label={copy.metrics.shots} value={stats.counts.shots} />
            <ConsoleMetric label={copy.metrics.versions} value={stats.counts.versions} />
            <ConsoleMetric label={copy.metrics.crew} value={stats.counts.crew} />
          </div>
        </div>

        <div className="grid min-w-0 gap-4 p-4 2xl:grid-cols-[1.05fr_0.95fr_0.9fr]">
          <ConsolePanel title={copy.shotGridTitle} meta={formatTemplate(copy.shotGridMeta, { count: shotRows.length })} href={`/app/projects/${projectId}/shots`} cta={copy.openShots}>
            {shotRows.length ? (
              <div className="space-y-2">
                {shotRows.map((row) => (
                  <Link key={row.contextLabel} href={`/app/projects/${projectId}/shots`} className="grid grid-cols-[96px_minmax(0,1fr)_62px] items-center gap-3 border border-[#2a2a28] bg-[#151512] px-3 py-2 transition hover:border-[#d8b46a]/55">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs text-[#4a9eff]">{row.contextLabel}</p>
                      <p className="mt-1 text-[10px] text-[#7f7a70]">{formatTemplate(copy.taskCount, { count: row.tasks.length })}</p>
                    </div>
                    <div className="flex min-w-0 items-center gap-1.5">
                      {row.tasks.slice(0, 6).map((task) => (
                        <span
                          key={task.id}
                          className="grid h-7 min-w-8 place-items-center border border-[#34322b] bg-[#11110f] px-1 font-mono text-[9px]"
                          style={{ color: STATUS_COLORS[task.status].text }}
                          title={`${task.name} · ${labels.charts.taskStatuses[task.status]}`}
                        >
                          {getPipelineShortName(task.name)}
                        </span>
                      ))}
                    </div>
                    <span className="text-right text-xs text-[#8f8a7e]">{row.done}/{row.tasks.length}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <ConsoleEmptyState text={copy.emptyShots} />
            )}
          </ConsolePanel>

          <ConsolePanel title={copy.reviewQueueTitle} meta={formatTemplate(copy.reviewQueueMeta, { count: reviewVersions.length })} href={`/app/projects/${projectId}/media`} cta={copy.openMedia}>
            {reviewVersions.length ? (
              <div className="space-y-2">
                {reviewVersions.map((version) => (
                  <Link key={version.id} href={`/app/projects/${projectId}/media#${version.id}`} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border border-[#2a2a28] bg-[#151512] px-3 py-2 transition hover:border-[#d8b46a]/55">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs text-[#4a9eff]">{version.name}</p>
                      <p className="mt-1 truncate text-[11px] text-[#8f8a7e]">{version.task.contextLabel} / {version.task.name}</p>
                    </div>
                    <div className="text-right">
                      <span className={["inline-flex border px-2 py-1 text-[10px] font-semibold", versionStatusClass(version.status)].join(" ")}>
                        {labels.charts.versionStatuses[version.status]}
                      </span>
                      <p className="mt-1 font-mono text-[10px] text-[#7f7a70]">v{String(version.number).padStart(3, "0")}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <ConsoleEmptyState text={copy.emptyVersions} />
            )}
          </ConsolePanel>

          <ConsolePanel title={copy.crewLoadTitle} meta={formatTemplate(copy.crewLoadMeta, { count: crewRows.length })} href={`/app/resource-planning?projectId=${projectId}`} cta={copy.openResources}>
            {crewRows.length ? (
              <div className="space-y-2">
                {crewRows.map((member) => (
                  <Link key={member.id} href={`/app/resource-planning?projectId=${projectId}`} className="block border border-[#2a2a28] bg-[#151512] px-3 py-2 transition hover:border-[#d8b46a]/55">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-[#f4f1e8]">{member.name}</p>
                        <p className="mt-1 truncate text-[10px] text-[#7f7a70]">{member.department}</p>
                      </div>
                      <span className={["font-mono text-xs", member.loadPct > 100 ? "text-[#ff8b7c]" : member.loadPct > 85 ? "text-[#e8c678]" : "text-[#9cccae]"].join(" ")}>{member.loadPct}%</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-[#2a2a28]">
                      <div className={member.loadPct > 100 ? "h-full bg-[#e24b4a]" : member.loadPct > 85 ? "h-full bg-[#ef9f27]" : "h-full bg-[#1d9e75]"} style={{ width: `${Math.min(100, member.loadPct)}%` }} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <ConsoleEmptyState text={copy.emptyCrew} />
            )}
          </ConsolePanel>
        </div>
      </div>
    </section>
  );
}

function ConsolePanel({
  title,
  meta,
  href,
  cta,
  children,
}: {
  title: string;
  meta: string;
  href: string;
  cta: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 border border-[#2f2d27] bg-[#11110f]">
      <div className="flex items-start justify-between gap-3 border-b border-[#2f2d27] px-3 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#f4f1e8]">{title}</p>
          <p className="mt-1 text-[11px] text-[#7f7a70]">{meta}</p>
        </div>
        <Link href={href} className="shrink-0 text-xs font-semibold text-[#e8c678] transition hover:text-[#f4d88f]">
          {cta}
        </Link>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function ConsoleMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[#2f2d27] bg-[#11110f] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#69655c]">{label}</p>
      <p className="mt-1 font-mono text-lg text-[#f4f1e8]">{value}</p>
    </div>
  );
}

function ConsoleEmptyState({ text }: { text: string }) {
  return <div className="grid min-h-36 place-items-center border border-dashed border-[#3f3c33] px-3 py-6 text-center text-xs leading-5 text-[#8f8a7e]">{text}</div>;
}

function buildShotRows(tasks: TaskTableItem[]) {
  const grouped = new Map<string, TaskTableItem[]>();

  for (const task of tasks) {
    if (task.context.kind !== "shot") continue;
    grouped.set(task.context.label, [...(grouped.get(task.context.label) ?? []), task]);
  }

  return Array.from(grouped.entries())
    .map(([contextLabel, rowTasks]) => ({
      contextLabel,
      tasks: rowTasks.slice().sort((left, right) => pipelineRank(left.name) - pipelineRank(right.name) || left.name.localeCompare(right.name)),
      done: rowTasks.filter((task) => task.status === "APPROVED" || task.status === "FINAL").length,
    }))
    .sort((left, right) => right.tasks.length - left.tasks.length || left.contextLabel.localeCompare(right.contextLabel))
    .slice(0, 6);
}

function getPipelineShortName(name: string) {
  const upper = name.toUpperCase();
  return PIPELINE_STEPS.find((step) => upper.includes(step)) ?? name.slice(0, 3).toUpperCase();
}

function pipelineRank(name: string) {
  const shortName = getPipelineShortName(name);
  const index = PIPELINE_STEPS.findIndex((step) => step === shortName);
  return index === -1 ? PIPELINE_STEPS.length : index;
}

function versionStatusClass(status: DashboardStats["latestVersions"][number]["status"]) {
  if (status === "CHANGES_REQUESTED") return "border-[#6f2f2f] bg-[#2b1717] text-[#ff9a8f]";
  if (status === "PENDING_REVIEW") return "border-[#6f5631] bg-[#211b12] text-[#e8c678]";
  if (status === "APPROVED") return "border-[#294838] bg-[#13221b] text-[#9cccae]";
  return "border-[#28445f] bg-[#111b2a] text-[#8cc6ff]";
}

function formatTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, String(value)), template);
}
