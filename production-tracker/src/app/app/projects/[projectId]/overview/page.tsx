import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { getDashboardStats, type DashboardStats } from "@/lib/dashboard-data";

export default async function ProjectOverviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
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
        <h2 className="mt-3 text-xl font-semibold">生产洞察看板等待数据库</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#c9c3b5]">{error ?? "项目数据暂时无法读取。"}</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">Project overview</p>
          <h1 className="mt-2 text-3xl font-semibold">{stats.project.name} · {stats.project.code}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#aaa599]">
            {stats.project.description ?? "生产洞察看板汇总镜头、资产、任务、版本和成员状态，供制片、监制和工作室负责人快速判断风险。"}
          </p>
        </div>
        <button className="h-10 border border-[#3f3c33] px-3 text-xs text-[#aaa599]">Download Report</button>
      </div>

      <DashboardOverview stats={stats} />
    </>
  );
}
