import { getPrisma } from "@/lib/prisma";

export default async function ProjectOverviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  let projectName = "项目详情";
  let error: string | null = null;

  try {
    const prisma = getPrisma();
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        name: true,
        code: true,
        description: true,
        _count: {
          select: {
            shots: true,
            assets: true,
          },
        },
      },
    });

    if (project) {
      projectName = `${project.name} · ${project.code}`;
    }
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "项目详情暂时无法读取。";
  }

  return (
    <div className="border border-[#353229] bg-[#181713] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">Project overview</p>
      <h1 className="mt-2 text-3xl font-semibold">{projectName}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#aaa599]">
        这里会承接 DEV 文档 Step 8 的生产洞察看板。当前先完成项目入口闭环，后续会加入镜头、资产、任务、版本和资源规划统计。
      </p>
      {error ? <p className="mt-4 border border-[#6f5631] bg-[#211b12] px-3 py-2 text-sm text-[#e8c678]">{error}</p> : null}
    </div>
  );
}
