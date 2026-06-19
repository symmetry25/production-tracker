import { WorkOrderWorkspace } from "@/components/phase-work-order/work-order-workspace";
import { getProjectWorkOrders } from "@/lib/phase-work-order-data";

type ProjectWorkOrdersPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectWorkOrdersPage({ params }: ProjectWorkOrdersPageProps) {
  const { projectId } = await params;
  const workOrders = await getProjectWorkOrders(projectId);

  return (
    <>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">Work Orders</p>
        <h1 className="mt-2 text-3xl font-semibold">工单列表</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#aaa599]">记录需要跨部门推进的制片、审计、供应商、版本审查和资源协调事项。</p>
      </div>

      <WorkOrderWorkspace projectId={projectId} workOrders={workOrders} />
    </>
  );
}
