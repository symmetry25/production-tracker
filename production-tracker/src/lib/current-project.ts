import { shouldUseDemoData } from "@/lib/demo-data";
import { getPrisma } from "@/lib/prisma";

export const demoProjectId = "demo-mkali-mission";

export type PageSearchParams = Record<string, string | string[] | undefined>;

export function getProjectIdFromSearchParams(searchParams: PageSearchParams) {
  return firstParam(searchParams.projectId) ?? null;
}

export function getProjectIdFromRequest(request: Request) {
  const { searchParams } = new URL(request.url);
  return searchParams.get("projectId");
}

export async function getCurrentProjectId(requestedProjectId?: string | null): Promise<string | null> {
  if (requestedProjectId) {
    return requestedProjectId;
  }

  if (shouldUseDemoData()) {
    return demoProjectId;
  }

  const prisma = getPrisma();
  const project = await prisma.project.findFirst({
    where: {
      status: { not: "deleted" },
      isTemplate: false,
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  return project?.id ?? null;
}

export function buildProjectQuery(projectId: string | null | undefined) {
  return projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
}

export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
