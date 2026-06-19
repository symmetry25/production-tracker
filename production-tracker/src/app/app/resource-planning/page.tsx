import { ResourcePlanningRangeControls } from "@/components/resource-planning/resource-planning-range-controls";
import { ResourcePlanningWorkspace } from "@/components/resource-planning/resource-planning-workspace";
import { getCurrentProjectId, getProjectIdFromSearchParams } from "@/lib/current-project";
import { getResourcePlanningData } from "@/lib/resource-planning";

type ResourcePlanningPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const defaultRange = {
  start: "2026-05-01",
  end: "2026-06-30",
};

export default async function ResourcePlanningPage({ searchParams }: ResourcePlanningPageProps) {
  const resolvedSearchParams = await searchParams;
  const range = parseRange(resolvedSearchParams);
  const projectId = await getCurrentProjectId(getProjectIdFromSearchParams(resolvedSearchParams));

  if (!projectId) {
    return (
      <>
        <ResourcePlanningHeader range={range} />
        <EmptyProjectState />
      </>
    );
  }

  const data = await getResourcePlanningData(projectId, range.start, range.end);

  return (
    <>
      <ResourcePlanningHeader range={range} />

      <ResourcePlanningWorkspace data={data} projectId={projectId} />
    </>
  );
}

function ResourcePlanningHeader({ range }: { range: { start: string; end: string } }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">Resource Planning</p>
        <h1 className="mt-2 text-3xl font-semibold">Studio 人天资源规划</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#aaa599]">
          按周查看工作室容量、任务负载、部门热力和人员超载情况，帮助制片在排期前发现资源瓶颈。
        </p>
      </div>
      <ResourcePlanningRangeControls key={`${range.start}-${range.end}`} range={range} />
    </div>
  );
}

function EmptyProjectState() {
  return (
    <div className="grid min-h-80 place-items-center border border-dashed border-[#3f3c33] bg-[#181713] p-10 text-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">No active project</p>
        <h2 className="mt-3 text-2xl font-semibold">还没有可用于资源规划的项目</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#aaa599]">先创建项目并录入镜头、资产或任务后，这里会显示部门容量和人员负载。</p>
      </div>
    </div>
  );
}

function parseRange(searchParams: Record<string, string | string[] | undefined>) {
  const start = first(searchParams.start);
  const end = first(searchParams.end);

  if (isDate(start) && isDate(end) && start <= end) {
    return { start, end };
  }

  return defaultRange;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isDate(value: string | undefined): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
