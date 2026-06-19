import { TaskWorkspace } from "@/components/task/task-workspace";
import { getDictionary, getLocale } from "@/lib/i18n";
import { buildScheduleSuggestions, type ScheduleSuggestionSummary } from "@/lib/schedule-suggestions";
import { getTaskFormOptions, getTaskTableItems, type TaskFormOptions, type TaskTableItem } from "@/lib/task-data";

export default async function ProjectTasksPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const locale = await getLocale();
  const t = getDictionary(locale).pages.tasks;
  let tasks: TaskTableItem[] = [];
  let options: TaskFormOptions = { shots: [], assets: [], users: [] };
  let scheduleSuggestions: ScheduleSuggestionSummary | null = null;
  let error: string | null = null;
  const analysisDate = new Date();

  try {
    [tasks, options] = await Promise.all([getTaskTableItems({ projectId }), getTaskFormOptions(projectId)]);
    scheduleSuggestions = buildScheduleSuggestions({ projectId, tasks, now: analysisDate });
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "任务数据暂时无法读取。";
  }

  return (
    <>
      <div className="mb-4 flex items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">{t.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold">{t.title}</h1>
          <p className="mt-2 text-sm text-[#aaa599]">{t.description}</p>
        </div>
      </div>

      {error ? (
        <div className="border border-[#6f5631] bg-[#211b12] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Database pending</p>
          <h2 className="mt-3 text-xl font-semibold">任务表等待数据库</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#c9c3b5]">{error}</p>
        </div>
      ) : (
        <TaskWorkspace projectId={projectId} tasks={tasks} options={options} scheduleSuggestions={scheduleSuggestions} analysisDate={analysisDate.toISOString()} />
      )}
    </>
  );
}
