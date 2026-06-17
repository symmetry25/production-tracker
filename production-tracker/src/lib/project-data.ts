import type { Project } from "@/generated/prisma/client";
import { getDemoProjectGridItems, shouldUseDemoData } from "@/lib/demo-data";
import { getPrisma } from "@/lib/prisma";

export type ProjectGridItem = Pick<
  Project,
  "id" | "name" | "code" | "thumbnailUrl" | "description" | "startDate" | "dueDate" | "milestone" | "milestoneDate" | "status" | "createdAt"
> & {
  shotCount: number;
  assetCount: number;
  taskCount: number;
  progress: number;
};

export async function getProjectGridItems(): Promise<ProjectGridItem[]> {
  if (shouldUseDemoData()) {
    return getDemoProjectGridItems();
  }

  const prisma = getPrisma();
  const projects = await prisma.project.findMany({
    where: { status: { not: "deleted" } },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          shots: true,
          assets: true,
        },
      },
      shots: {
        select: {
          _count: {
            select: { tasks: true },
          },
        },
      },
    },
  });

  return projects.map((project) => {
    const totalDays = Math.max(1, project.dueDate.getTime() - project.startDate.getTime());
    const elapsedDays = Date.now() - project.startDate.getTime();

    return {
      id: project.id,
      name: project.name,
      code: project.code,
      thumbnailUrl: project.thumbnailUrl,
      description: project.description,
      startDate: project.startDate,
      dueDate: project.dueDate,
      milestone: project.milestone,
      milestoneDate: project.milestoneDate,
      status: project.status,
      createdAt: project.createdAt,
      shotCount: project._count.shots,
      assetCount: project._count.assets,
      taskCount: project.shots.reduce((sum, shot) => sum + shot._count.tasks, 0),
      progress: Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100))),
    };
  });
}
