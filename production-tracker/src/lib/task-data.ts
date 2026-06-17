import type { AssetType, DependencyType, Role, TaskStatus } from "@/generated/prisma/enums";

import { getDemoTaskFormOptions, getDemoTaskTableItems, shouldUseDemoData } from "@/lib/demo-data";
import { getPrisma } from "@/lib/prisma";

export const TASK_COST_PER_DAY = 100;

export type TaskContext =
  | {
      kind: "shot";
      id: string;
      label: string;
      secondary: string;
    }
  | {
      kind: "asset";
      id: string;
      label: string;
      secondary: AssetType;
    }
  | {
      kind: "unassigned";
      id: null;
      label: string;
      secondary: string;
    };

export type TaskAssignee = {
  id: string;
  name: string;
  department: string | null;
  role: Role;
};

export type TaskDependencyItem = {
  id: string;
  type: DependencyType;
  lagDays: number;
  taskId: string;
  taskName: string;
  contextLabel: string;
};

export type TaskTableItem = {
  id: string;
  name: string;
  status: TaskStatus;
  priority: number;
  startDate: string | null;
  dueDate: string | null;
  duration: number | null;
  timeLogged: number;
  estimatedCost: number | null;
  calculatedCost: number;
  overBudget: boolean;
  context: TaskContext;
  assignees: TaskAssignee[];
  reviewerIds: string[];
  predecessors: TaskDependencyItem[];
  successors: TaskDependencyItem[];
  versionCount: number;
  noteCount: number;
};

export type TaskFormOptions = {
  shots: {
    id: string;
    code: string;
    sequenceCode: string;
  }[];
  assets: {
    id: string;
    name: string;
    type: AssetType;
  }[];
  users: TaskAssignee[];
};

type GetTaskTableItemsFilters = {
  projectId: string;
  shotId?: string | null;
  assetId?: string | null;
  status?: TaskStatus | null;
  assigneeId?: string | null;
};

export async function getTaskTableItems(filters: GetTaskTableItemsFilters): Promise<TaskTableItem[]> {
  if (shouldUseDemoData()) {
    return getDemoTaskTableItems(filters.projectId).filter((task) => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.shotId && task.context.id !== filters.shotId) return false;
      if (filters.assetId && task.context.id !== filters.assetId) return false;
      if (filters.assigneeId && !task.assignees.some((assignee) => assignee.id === filters.assigneeId)) return false;
      return true;
    });
  }

  const prisma = getPrisma();
  const tasks = await prisma.task.findMany({
    where: {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.shotId ? { shotId: filters.shotId } : {}),
      ...(filters.assetId ? { assetId: filters.assetId } : {}),
      ...(filters.assigneeId
        ? {
            assignments: {
              some: {
                userId: filters.assigneeId,
              },
            },
          }
        : {}),
      OR: [{ shot: { projectId: filters.projectId } }, { asset: { projectId: filters.projectId } }],
    },
    orderBy: [{ priority: "desc" }, { startDate: "asc" }, { dueDate: "asc" }, { name: "asc" }],
    include: {
      shot: {
        select: {
          id: true,
          code: true,
          sequence: { select: { code: true } },
        },
      },
      asset: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
      assignments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              department: true,
              role: true,
            },
          },
        },
      },
      predecessors: {
        include: {
          predecessor: {
            include: {
              shot: { select: { code: true } },
              asset: { select: { name: true } },
            },
          },
        },
      },
      successors: {
        include: {
          successor: {
            include: {
              shot: { select: { code: true } },
              asset: { select: { name: true } },
            },
          },
        },
      },
      _count: {
        select: {
          versions: true,
          notes: true,
        },
      },
    },
  });

  return tasks.map((task) => {
    const estimatedCost = task.estimatedCost ?? null;
    const calculatedCost = Math.round(task.timeLogged * TASK_COST_PER_DAY);

    return {
      id: task.id,
      name: task.name,
      status: task.status,
      priority: task.priority,
      startDate: task.startDate?.toISOString() ?? null,
      dueDate: task.dueDate?.toISOString() ?? null,
      duration: task.duration,
      timeLogged: task.timeLogged,
      estimatedCost,
      calculatedCost,
      overBudget: typeof estimatedCost === "number" && calculatedCost > estimatedCost,
      context: resolveTaskContext(task),
      assignees: task.assignments.map((assignment) => assignment.user),
      reviewerIds: task.assignments.flatMap((assignment) => (assignment.reviewerId ? [assignment.reviewerId] : [])),
      predecessors: task.predecessors.map((dependency) => ({
        id: dependency.id,
        type: dependency.type,
        lagDays: dependency.lagDays,
        taskId: dependency.predecessorId,
        taskName: dependency.predecessor.name,
        contextLabel: resolveDependencyContextLabel(dependency.predecessor),
      })),
      successors: task.successors.map((dependency) => ({
        id: dependency.id,
        type: dependency.type,
        lagDays: dependency.lagDays,
        taskId: dependency.successorId,
        taskName: dependency.successor.name,
        contextLabel: resolveDependencyContextLabel(dependency.successor),
      })),
      versionCount: task._count.versions,
      noteCount: task._count.notes,
    };
  });
}

export async function getTaskFormOptions(projectId: string): Promise<TaskFormOptions> {
  if (shouldUseDemoData()) {
    return getDemoTaskFormOptions(projectId);
  }

  const prisma = getPrisma();
  const [shots, assets, users] = await Promise.all([
    prisma.shot.findMany({
      where: { projectId },
      orderBy: [{ sequence: { code: "asc" } }, { code: "asc" }],
      select: {
        id: true,
        code: true,
        sequence: { select: { code: true } },
      },
    }),
    prisma.asset.findMany({
      where: { projectId },
      orderBy: [{ type: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        type: true,
      },
    }),
    prisma.user.findMany({
      orderBy: [{ department: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        department: true,
        role: true,
      },
    }),
  ]);

  return {
    shots: shots.map((shot) => ({
      id: shot.id,
      code: shot.code,
      sequenceCode: shot.sequence?.code ?? "NO_SEQUENCE",
    })),
    assets,
    users,
  };
}

function resolveTaskContext(task: {
  shot: { id: string; code: string; sequence: { code: string } | null } | null;
  asset: { id: string; name: string; type: AssetType } | null;
}): TaskContext {
  if (task.shot) {
    return {
      kind: "shot",
      id: task.shot.id,
      label: task.shot.code,
      secondary: task.shot.sequence?.code ?? "NO_SEQUENCE",
    };
  }

  if (task.asset) {
    return {
      kind: "asset",
      id: task.asset.id,
      label: task.asset.name,
      secondary: task.asset.type,
    };
  }

  return {
    kind: "unassigned",
    id: null,
    label: "Unassigned",
    secondary: "No source",
  };
}

function resolveDependencyContextLabel(task: {
  shot: { code: string } | null;
  asset: { name: string } | null;
}): string {
  if (task.shot) {
    return task.shot.code;
  }

  if (task.asset) {
    return task.asset.name;
  }

  return "Unassigned";
}
