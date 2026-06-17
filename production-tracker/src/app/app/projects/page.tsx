import { CreateProjectForm } from "./create-project-form";
import { ProjectGrid } from "@/components/project/project-grid";
import { getProjectGridItems, type ProjectGridItem } from "@/lib/project-data";

export default async function ProjectsPage() {
  let projects: ProjectGridItem[] = [];
  let error: string | null = null;

  try {
    projects = await getProjectGridItems();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "项目数据暂时无法读取。";
  }

  return (
    <>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">Projects</p>
          <h1 className="mt-2 text-3xl font-semibold">项目网格</h1>
          <p className="mt-2 text-sm text-[#aaa599]">管理项目入口、截止日期、里程碑、镜头量和资产量。</p>
        </div>
        <CreateProjectForm />
      </div>

      {error ? (
        <div className="border border-[#6f5631] bg-[#211b12] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Database pending</p>
          <h2 className="mt-3 text-xl font-semibold">数据库还没有连接或迁移</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#c9c3b5]">
            {error}
            <br />
            配好 `.env` 的 DATABASE_URL 后运行 `npm run db:migrate -- --name init`，再运行 `npm run db:seed`。
          </p>
        </div>
      ) : (
        <ProjectGrid projects={projects} />
      )}
    </>
  );
}
