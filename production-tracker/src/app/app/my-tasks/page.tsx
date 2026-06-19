import { auth } from "@/auth";
import { MyTasksWorkspace } from "@/components/task/my-tasks-workspace";
import { getMyTaskItems } from "@/lib/global-pages-data";

export default async function MyTasksPage() {
  const session = await auth();
  const projectId = "demo-mkali-mission";
  const tasks = await getMyTaskItems(projectId, session?.user?.id);
  const todayDate = new Date().toISOString();

  return (
    <>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">My Tasks</p>
        <h1 className="mt-2 text-3xl font-semibold">我的任务</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#aaa599]">把今天要处理的任务、逾期风险、预算消耗和负责人状态放在同一个工作台里。</p>
      </div>

      <MyTasksWorkspace projectId={projectId} tasks={tasks} todayDate={todayDate} userName={session?.user?.name ?? "Production user"} />
    </>
  );
}
