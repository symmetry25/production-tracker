import { ProjectCard } from "@/components/project/project-card";
import type { ProjectGridItem } from "@/lib/project-data";

export function ProjectGrid({ projects }: { projects: ProjectGridItem[] }) {
  if (projects.length === 0) {
    return (
      <div className="grid min-h-80 place-items-center border border-dashed border-[#3f3c33] bg-[#181713] p-10 text-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">No projects</p>
          <h2 className="mt-3 text-2xl font-semibold">还没有项目</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#aaa599]">创建第一个项目后，这里会显示镜头数、资产数、任务数和项目时间进度。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
