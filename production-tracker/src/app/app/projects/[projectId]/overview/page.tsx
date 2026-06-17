import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { getDashboardStats, type DashboardStats } from "@/lib/dashboard-data";
import { getDictionary, getLocale } from "@/lib/i18n";

export default async function ProjectOverviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const locale = await getLocale();
  const t = getDictionary(locale).pages.overview;
  let stats: DashboardStats | null = null;
  let error: string | null = null;

  try {
    stats = await getDashboardStats(projectId);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "项目详情暂时无法读取。";
  }

  if (error || !stats) {
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
        <button className="h-10 border border-[#3f3c33] px-3 text-xs text-[#aaa599]">{t.report}</button>
      </div>

      <DashboardOverview stats={stats} />
    </>
  );
}
