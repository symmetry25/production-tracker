import { CountdownWidget } from "@/components/dashboard/countdown-widget";
import { CrewTable } from "@/components/dashboard/crew-table";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { DonutChart, HorizontalBars, StackedAreaChart, StackedBarChart, VelocityChart, VersionStatusBars } from "@/components/dashboard/dashboard-charts";
import { LatestVersionFilmstrip } from "@/components/dashboard/latest-version-filmstrip";
import { ProducerCommandCenter } from "@/components/dashboard/producer-command-center";
import { ResourcePulseCard } from "@/components/dashboard/resource-pulse-card";
import type { DashboardStats } from "@/lib/dashboard-data";
import type { Dictionary } from "@/lib/i18n";
import type { OverviewResourcePulse } from "@/lib/overview-resource-pulse";
import type { ScheduleSuggestionSummary } from "@/lib/schedule-suggestions";
import type { TaskTableItem } from "@/lib/task-data";

export function DashboardOverview({
  projectId,
  stats,
  tasks,
  scheduleSummary,
  resourcePulse,
  labels,
}: {
  projectId: string;
  stats: DashboardStats;
  tasks: TaskTableItem[];
  scheduleSummary: ScheduleSuggestionSummary;
  resourcePulse: OverviewResourcePulse;
  labels: Dictionary["pages"]["overview"];
}) {
  const chartLabels = labels.charts;

  return (
    <div className="space-y-5">
      <ProducerCommandCenter projectId={projectId} stats={stats} tasks={tasks} scheduleSummary={scheduleSummary} labels={labels.producerCommand} />

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
