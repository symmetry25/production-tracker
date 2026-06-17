import { CreateTaskForm } from "@/components/task/create-task-form";
import { TaskWorkspace } from "@/components/task/task-workspace";
import { getTaskFormOptions, getTaskTableItems, type TaskFormOptions, type TaskTableItem } from "@/lib/task-data";

export default async function ProjectTasksPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  let tasks: TaskTableItem[] = [];
  let options: TaskFormOptions = { shots: [], assets: [], users: [] };
  let error: string | null = null;

  try {
    [tasks, options] = await Promise.all([getTaskTableItems({ projectId }), getTaskFormOptions(projectId)]);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "任务数据暂时无法读取。";
  }

  return (
    <>
      <div className="mb-4 flex items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">Tasks</p>
          <h1 className="mt-2 text-3xl font-semibold">任务表与甘特图</h1>
          <p className="mt-2 text-sm text-[#aaa599]">把 Shot、Asset、负责人、预算、日期和依赖关系放在同一个制作追踪视图里。</p>
        </div>
        <div className="flex h-10 items-center gap-2 text-xs text-[#aaa599]">
          <CreateTaskForm projectId={projectId} options={options} />
          <button className="h-10 border border-[#3f3c33] px-3">Sort</button>
          <button className="h-10 border border-[#3f3c33] px-3">Group</button>
          <button className="h-10 border border-[#3f3c33] px-3">Fields</button>
          <button className="h-10 border border-[#3f3c33] px-3">Filter</button>
        </div>
      </div>

      {error ? (
        <div className="border border-[#6f5631] bg-[#211b12] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Database pending</p>
          <h2 className="mt-3 text-xl font-semibold">任务表等待数据库</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#c9c3b5]">{error}</p>
        </div>
      ) : (
        <TaskWorkspace tasks={tasks} />
      )}
    </>
  );
}
