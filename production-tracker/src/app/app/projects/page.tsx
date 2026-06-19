import { CreateProjectForm } from "./create-project-form";
import { ProjectGrid } from "@/components/project/project-grid";
import { ProjectPortfolioCommand } from "@/components/project/project-portfolio-command";
import { getDictionary, getLocale } from "@/lib/i18n";
import { buildProjectPortfolio } from "@/lib/project-portfolio";
import { getProjectGridItems, type ProjectGridItem } from "@/lib/project-data";
import { getResourceBudgetData } from "@/lib/resource-data";

export default async function ProjectsPage() {
  const locale = await getLocale();
  const t = getDictionary(locale).pages.projects;
  let projects: ProjectGridItem[] = [];
  let error: string | null = null;

  try {
    projects = await getProjectGridItems();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "项目数据暂时无法读取。";
  }

  const resourceEntries = error
    ? []
    : await Promise.all(
        projects.map(async (project) => {
          const data = await getResourceBudgetData(project.id);
          return [project.id, data] as const;
        }),
      );
  const portfolio = buildProjectPortfolio(projects, Object.fromEntries(resourceEntries));

  return (
    <>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">{t.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold">{t.title}</h1>
          <p className="mt-2 text-sm text-[#aaa599]">{t.description}</p>
        </div>
        <CreateProjectForm />
      </div>

      {error ? (
        <div className="border border-[#6f5631] bg-[#211b12] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Database pending</p>
          <h2 className="mt-3 text-xl font-semibold">{t.databasePending}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#c9c3b5]">
            {error}
            <br />
            配好 `.env` 的 DATABASE_URL 后运行 `npm run db:migrate -- --name init`，再运行 `npm run db:seed`。
          </p>
        </div>
      ) : (
        <>
          <ProjectPortfolioCommand portfolio={portfolio} labels={t.portfolio} />
          <ProjectGrid projects={projects} />
        </>
      )}
    </>
  );
}
