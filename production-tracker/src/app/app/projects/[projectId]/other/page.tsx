import Link from "next/link";

const tools = [
  {
    title: "Project Settings",
    detail: "回到总览核对项目描述、里程碑、交付日期和核心健康指标。",
    hrefSuffix: "overview",
  },
  {
    title: "API Health",
    detail: "通过项目页、报表页和资源规划入口确认关键数据链路是否正常。",
    hrefSuffix: "overview",
  },
  {
    title: "Audit Readiness",
    detail: "把预算、供应商、版本审查和资源负载连接到制片审计视角。",
    hrefSuffix: "resources",
  },
  {
    title: "Calendar Exceptions",
    detail: "查看假期、减产日和停工对资源规划的影响。",
    hrefSuffix: "resources",
  },
];

export default async function ProjectOtherPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  return (
    <>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">Other</p>
        <h1 className="mt-2 text-3xl font-semibold">项目工具与扩展</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#aaa599]">
          项目级辅助入口集中放在这里：审计准备、接口巡检、日历例外和预算资源检查都能从同一页进入。
        </p>
      </div>

      <section className="grid grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Link key={tool.title} href={`/app/projects/${projectId}/${tool.hrefSuffix}`} className="border border-[#34322b] bg-[#181713] p-5 transition hover:border-[#d8b46a]/70">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d8b46a]">{tool.title}</p>
            <p className="mt-3 text-sm leading-6 text-[#c9c3b5]">{tool.detail}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
