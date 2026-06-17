import Link from "next/link";

import { ResourcePlanningWorkspace } from "@/components/resource-planning/resource-planning-workspace";
import { getDepartmentResourcePlanningData, getResourcePlanningData, type ResourcePlanningData } from "@/lib/resource-planning";

type DepartmentResourcePlanningPageProps = {
  params: Promise<{ department: string }>;
};

export default async function DepartmentResourcePlanningPage({ params }: DepartmentResourcePlanningPageProps) {
  const { department: rawDepartment } = await params;
  const department = decodeURIComponent(rawDepartment);
  const fullData = await getResourcePlanningData("demo-mkali-mission");
  const departmentNames = fullData.departments.map((row) => row.department);
  const data = await getDepartmentResourcePlanningData("demo-mkali-mission", department);
  const busiestWeek = getBusiestWeek(data);
  const busiestUser = data.users.slice().sort((a, b) => b.totalWorkload - a.totalWorkload)[0];
  const riskTasks = getRiskTasks(data);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-5">
        <div>
          <Link href="/app/resource-planning" className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8f8a7e] transition hover:text-[#d8b46a]">
            Resource Planning / Back
          </Link>
          <h1 className="mt-2 text-3xl font-semibold">{department} 资源下钻</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#aaa599]">
            聚焦一个部门的人天容量、周负载、任务压力和停工例外，适合制片主任与部门负责人开排期会时使用。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {departmentNames.map((name) => (
            <Link
              key={name}
              href={`/app/resource-planning/${encodeURIComponent(name)}`}
              className={[
                "h-9 border px-3 py-2 transition",
                name === department ? "border-[#d8b46a] bg-[#d8b46a] font-semibold text-[#171713]" : "border-[#34322b] text-[#c9c3b5] hover:border-[#d8b46a] hover:text-[#e8c678]",
              ].join(" ")}
            >
              {name}
            </Link>
          ))}
        </div>
      </div>

      {data.users.length === 0 ? (
        <div className="border border-[#6f5631] bg-[#211b12] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Department not found</p>
          <h2 className="mt-3 text-xl font-semibold">没有找到这个部门的资源数据</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#c9c3b5]">请从右上角选择已有部门，或回到 Studio 资源规划页查看全部部门。</p>
        </div>
      ) : (
        <>
          <section className="mb-5 grid gap-3 xl:grid-cols-[repeat(4,minmax(0,1fr))]">
            <DepartmentMetric label="Members" value={`${data.users.length}`} meta={busiestUser ? `Lead load: ${busiestUser.name}` : "No users"} />
            <DepartmentMetric label="Capacity" value={days(data.totals.capacity)} meta="Window total" />
            <DepartmentMetric label="Workload" value={days(data.totals.workload)} meta={signedDays(data.totals.delta)} tone={data.totals.delta > 0 ? "over" : "ok"} />
            <DepartmentMetric label="Busiest week" value={busiestWeek?.label ?? "-"} meta={busiestWeek ? `${days(busiestWeek.workload)} assigned` : "No workload"} />
          </section>

          <section className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="border border-[#34322b] bg-[#181713]">
              <div className="border-b border-[#34322b] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d8b46a]">department roster</p>
                <h2 className="mt-1 text-lg font-semibold">成员负载排行</h2>
              </div>
              <div className="divide-y divide-[#2a2a28]">
                {data.users
                  .slice()
                  .sort((a, b) => b.totalWorkload - a.totalWorkload)
                  .map((user) => (
                    <div key={user.id} className="grid grid-cols-[1fr_92px_92px_92px] items-center gap-3 px-4 py-3 text-xs">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#f4f1e8]">{user.name}</p>
                        <p className="mt-1 text-[#8f8a7e]">{user.department}</p>
                      </div>
                      <span className="text-right font-mono text-[#8f8a7e]">{days(user.totalCapacity)}</span>
                      <span className="text-right font-mono text-[#e8c678]">{days(user.totalWorkload)}</span>
                      <span className={["text-right font-mono", user.delta > 0 ? "text-[#ff8b7c]" : "text-[#75d9a7]"].join(" ")}>{signedDays(user.delta)}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="border border-[#34322b] bg-[#181713]">
              <div className="border-b border-[#34322b] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d8b46a]">risk tasks</p>
                <h2 className="mt-1 text-lg font-semibold">需要排期关注的任务</h2>
              </div>
              <div className="space-y-2 p-4">
                {riskTasks.length > 0 ? (
                  riskTasks.map((task) => (
                    <div key={`${task.userName}-${task.weekLabel}-${task.id}`} className="border border-[#2a2a28] bg-[#151410] p-3 text-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#f4f1e8]">{task.contextLabel} · {task.name}</p>
                          <p className="mt-1 text-[#8f8a7e]">{task.userName} · {task.weekLabel} · {statusLabel(task.status)}</p>
                        </div>
                        <span className="shrink-0 border border-[#3c3830] px-2 py-1 font-mono text-[#e8c678]">{days(task.days)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="border border-dashed border-[#34322b] px-3 py-8 text-center text-xs text-[#7f7a70]">这个部门当前没有明显压力任务。</div>
                )}
              </div>
            </div>
          </section>

          <ResourcePlanningWorkspace data={data} />
        </>
      )}
    </>
  );
}

function DepartmentMetric({ label, value, meta, tone = "normal" }: { label: string; value: string; meta: string; tone?: "normal" | "ok" | "over" }) {
  return (
    <div className="border border-[#34322b] bg-[#181713] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">{label}</p>
      <p className={["mt-2 truncate font-mono text-2xl font-semibold", tone === "over" ? "text-[#ff8b7c]" : tone === "ok" ? "text-[#75d9a7]" : "text-[#f4f1e8]"].join(" ")}>{value}</p>
      <p className="mt-2 truncate text-xs text-[#8f8a7e]">{meta}</p>
    </div>
  );
}

function getBusiestWeek(data: ResourcePlanningData) {
  return data.capacity.slice().sort((a, b) => b.workload - a.workload)[0];
}

function getRiskTasks(data: ResourcePlanningData) {
  return data.users
    .flatMap((user) =>
      user.weeks.flatMap((week) => {
        const weekLabel = data.weeks.find((item) => item.key === week.weekKey)?.label ?? week.weekKey;

        return week.tasks.map((task) => ({
          ...task,
          userName: user.name,
          weekLabel,
          pressure: week.delta,
        }));
      }),
    )
    .sort((a, b) => b.pressure - a.pressure || b.days - a.days)
    .slice(0, 6);
}

function days(value: number) {
  return `${numberFormatter.format(value)}d`;
}

function signedDays(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${numberFormatter.format(rounded)}d`;
}

function statusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
