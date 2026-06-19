import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { ReportExportButton } from "@/components/dashboard/report-export-button";
import { getDashboardStats, type DashboardStats } from "@/lib/dashboard-data";
import { getDictionary, getLocale } from "@/lib/i18n";
import { buildScheduleSuggestions, type ScheduleSuggestionSummary } from "@/lib/schedule-suggestions";
import { getTaskTableItems, type TaskTableItem } from "@/lib/task-data";

export default async function ProjectOverviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const locale = await getLocale();
  const t = getDictionary(locale).pages.overview;
  let stats: DashboardStats | null = null;
  let tasks: TaskTableItem[] = [];
  let scheduleSummary: ScheduleSuggestionSummary | null = null;
  let error: string | null = null;
  const analysisDate = new Date();

  try {
    [stats, tasks] = await Promise.all([getDashboardStats(projectId), getTaskTableItems({ projectId })]);
    scheduleSummary = buildScheduleSuggestions({ projectId, tasks, now: analysisDate });
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "项目详情暂时无法读取。";
  }

  if (error || !stats || !scheduleSummary) {
    return (
      <div className="border border-[#6f5631] bg-[#211b12] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Database pending</p>
        <h2 className="mt-3 text-xl font-semibold">{t.databasePending}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#c9c3b5]">{error ?? "项目数据暂时无法读取。"}</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">{t.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold">{stats.project.name} · {stats.project.code}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#aaa599]">
            {stats.project.description ?? t.fallbackDescription}
          </p>
        </div>
        <ReportExportButton stats={stats} label={t.report} />
      </div>

      <DashboardOverview projectId={projectId} stats={stats} tasks={tasks} scheduleSummary={scheduleSummary} labels={t.producerCommand} />
    </>
  );
}
