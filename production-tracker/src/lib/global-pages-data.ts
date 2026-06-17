import { shouldUseDemoData } from "@/lib/demo-data";
import { getPrisma } from "@/lib/prisma";
import { getProjectReviewVersions } from "@/lib/review-data";
import { getTaskTableItems, type TaskTableItem } from "@/lib/task-data";

export type InboxItem = {
  id: string;
  title: string;
  detail: string;
  tone: "info" | "watch" | "over";
  href: string;
};

export type AdminUserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  capacity: number;
};

export async function getMyTaskItems(projectId = "demo-mkali-mission", userId?: string): Promise<TaskTableItem[]> {
  const tasks = await getTaskTableItems({ projectId });

  if (!userId) {
    return tasks.slice(0, 8);
  }

  return tasks.filter((task) => task.assignees.some((assignee) => assignee.id === userId));
}

export async function getInboxItems(projectId = "demo-mkali-mission"): Promise<InboxItem[]> {
  const [tasks, versions] = await Promise.all([getTaskTableItems({ projectId }), getProjectReviewVersions(projectId)]);
  const overBudget = tasks.filter((task) => task.overBudget).slice(0, 3);
  const pendingVersions = versions.filter((version) => version.status === "PENDING_REVIEW").slice(0, 3);

  return [
    ...pendingVersions.map((version) => ({
      id: `version-${version.id}`,
      title: `版本待审：${version.name}`,
      detail: `${version.task.contextLabel} / ${version.task.name}`,
      tone: "watch" as const,
      href: `/app/projects/${projectId}/media`,
    })),
    ...overBudget.map((task) => ({
      id: `task-${task.id}`,
      title: `预算风险：${task.context.label} / ${task.name}`,
      detail: `Logged $${task.calculatedCost.toLocaleString()} vs bid $${task.estimatedCost?.toLocaleString() ?? "--"}`,
      tone: "over" as const,
      href: `/app/projects/${projectId}/tasks`,
    })),
    {
      id: "resource-planning",
      title: "资源规划需要复核",
      detail: "查看 Studio 人天容量、超载人员和未分配工作量。",
      tone: "info",
      href: "/app/resource-planning",
    },
  ];
}

export async function getAdminUsers(): Promise<AdminUserItem[]> {
  if (shouldUseDemoData()) {
    return [
      { id: "demo-user-producer", name: "林一凡", email: "producer@studio.local", role: "PRODUCER", department: "制片组", capacity: 5 },
      { id: "demo-user-dp", name: "Marcus Chen", email: "dp@studio.local", role: "SUPERVISOR", department: "摄影组", capacity: 4 },
      { id: "demo-user-vfx", name: "Nora Li", email: "vfx@studio.local", role: "REVIEWER", department: "调色/VFX组", capacity: 4 },
      { id: "demo-user-post", name: "Milo Grant", email: "post@studio.local", role: "SUPERVISOR", department: "后期统筹组", capacity: 4 },
    ];
  }

  const prisma = getPrisma();
  return prisma.user.findMany({
    orderBy: [{ department: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      capacity: true,
    },
  });
}
