import { ResourcePlanningWorkspace } from "@/components/resource-planning/resource-planning-workspace";
import { getResourcePlanningData } from "@/lib/resource-planning";

export default async function ResourcePlanningPage() {
  const data = await getResourcePlanningData("demo-mkali-mission");

  return (
    <>
      <div className="mb-5 flex items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">Resource Planning</p>
          <h1 className="mt-2 text-3xl font-semibold">Studio 人天资源规划</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#aaa599]">
            按周查看工作室容量、任务负载、部门热力和人员超载情况，帮助制片在排期前发现资源瓶颈。
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button type="button" className="h-9 border border-[#34322b] px-3 text-[#c9c3b5]">Weekly</button>
          <button type="button" className="h-9 border border-[#34322b] px-3 text-[#c9c3b5]">May 1 - Jun 30</button>
          <button type="button" className="h-9 bg-[#d8b46a] px-3 font-semibold text-[#171713]">Export</button>
        </div>
      </div>

      <ResourcePlanningWorkspace data={data} />
    </>
  );
}
