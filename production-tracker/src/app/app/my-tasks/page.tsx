import { auth } from "@/auth";
import { MyTasksWorkspace } from "@/components/task/my-tasks-workspace";
import { getCurrentProjectId, getProjectIdFromSearchParams } from "@/lib/current-project";
import { getMyTaskItems } from "@/lib/global-pages-data";

type MyTasksPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MyTasksPage({ searchParams }: MyTasksPageProps) {
  const session = await auth();
  const resolvedSearchParams = await searchParams;
  const projectId = await getCurrentProjectId(getProjectIdFromSearchParams(resolvedSearchParams));
  const tasks = projectId ? await getMyTaskItems(projectId, session?.user?.id) : [];
  const todayDate = new Date().toISOString();

  return (
    <>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">My Tasks</p>
        <h1 className="mt-2 text-3xl font-semibold">我的任务</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#aaa599]">把今天要处理的任务、逾期风险、预算消耗和负责人状态放在同一个工作台里。</p>
      </div>

      {projectId ? (
        <MyTasksWorkspace projectId={projectId} tasks={tasks} todayDate={todayDate} userName={session?.user?.name ?? "Production user"} />
      ) : (
        <div className="grid min-h-80 place-items-center border border-dashed border-[#3f3c33] bg-[#181713] p-10 text-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">No active project</p>
            <h2 className="mt-3 text-2xl font-semibold">还没有项目任务</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#aaa599]">创建项目并分配任务后，这里会显示你的待办、风险和预算状态。</p>
          </div>
        </div>
      )}
    </>
  );
}
