import Link from "next/link";

const tools = [
  {
    title: "Project Settings",
    detail: "集中管理项目描述、里程碑、模板标记和缩略图。",
    hrefSuffix: "overview",
  },
  {
    title: "API Health",
    detail: "检查项目、镜头、资产、任务、报表和资源规划接口是否可接入。",
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
          这里放项目级辅助入口，避免导航里的 Other 进入空页面。后续可以继续扩展成字段配置、模板复制、导入导出和审计包。
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
