import { CountdownWidget } from "@/components/dashboard/countdown-widget";
import { CrewTable } from "@/components/dashboard/crew-table";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { DonutChart, HorizontalBars, StackedAreaChart, StackedBarChart, VelocityChart, VersionStatusBars } from "@/components/dashboard/dashboard-charts";
import { LatestVersionFilmstrip } from "@/components/dashboard/latest-version-filmstrip";
import type { DashboardStats } from "@/lib/dashboard-data";

export function DashboardOverview({ stats }: { stats: DashboardStats }) {
  return (
    <div className="space-y-5">
      <CountdownWidget project={stats.project} counts={stats.counts} />

      <div className="grid grid-cols-[0.9fr_1.1fr] gap-5">
        <DashboardPanel title="Shot Status" eyebrow="pipeline health">
          <DonutChart data={stats.shotStatus} />
        </DashboardPanel>
        <DashboardPanel title="Asset Status By Type" eyebrow="asset matrix">
          <StackedBarChart data={stats.assetStatus} />
        </DashboardPanel>
      </div>

      <div className="grid grid-cols-[1.25fr_0.75fr] gap-5">
        <DashboardPanel title="Task Status By Department" eyebrow="department load">
          <StackedAreaChart data={stats.taskStatus} />
        </DashboardPanel>
        <DashboardPanel title="% Final By Department" eyebrow="delivery confidence">
          <HorizontalBars data={stats.pctFinalByDept} />
        </DashboardPanel>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-5">
        <DashboardPanel title="Velocity" eyebrow="approved and final">
          <VelocityChart data={stats.velocity} />
        </DashboardPanel>
        <DashboardPanel title="Version Review Status" eyebrow="review queue">
          <VersionStatusBars data={stats.versionStatus} />
        </DashboardPanel>
      </div>

      <DashboardPanel title="Latest Versions" eyebrow="filmstrip">
        <LatestVersionFilmstrip versions={stats.latestVersions} />
      </DashboardPanel>

      <DashboardPanel title="Crew Table" eyebrow="project members">
        <CrewTable crew={stats.crew} />
      </DashboardPanel>
    </div>
  );
}
