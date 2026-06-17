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

      <section className="grid grid-cols-3 gap-4">
        {workOrders.map((order) => (
          <article key={order.id} className="border border-[#34322b] bg-[#181713] p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold text-[#f4f1e8]">{order.title}</h2>
              <span className="border border-[#3f3c33] bg-[#11110f] px-2 py-1 text-xs text-[#e8c678]">{order.status}</span>
            </div>
            <p className="mt-3 min-h-16 text-sm leading-6 text-[#aaa599]">{order.description ?? "No description"}</p>
            <p className="mt-4 font-mono text-xs text-[#7f7a70]">{new Date(order.createdAt).toLocaleString()}</p>
          </article>
        ))}
      </section>
    </>
  );
}
