import type { AssetType, TaskStatus, VersionStatus } from "@/generated/prisma/enums";

import { getDemoDashboardStats, shouldUseDemoData } from "@/lib/demo-data";
import { getPrisma } from "@/lib/prisma";
import type { ReviewVersionItem } from "@/lib/review-data";
import { getProjectReviewVersions } from "@/lib/review-data";
import { ASSET_TYPE_LABELS, STATUS_COLORS } from "@/lib/status-colors";

const taskStatusOrder: TaskStatus[] = [
  "WAITING_TO_START",
  "READY_TO_START",
  "IN_PROGRESS",
  "PENDING_REVIEW",
  "APPROVED",
  "FINAL",
  "ON_HOLD",
  "OMIT",
];

const versionStatusOrder: VersionStatus[] = ["PENDING_REVIEW", "VIEWED", "APPROVED", "CHANGES_REQUESTED"];

export type DashboardStats = {
  project: {
    id: string;
    name: string;
    code: string;
    description: string | null;
    startDate: string;
    dueDate: string;
    milestone: string | null;
    milestoneDate: string | null;
    daysRemaining: number;
    progressPct: number;
  };
  counts: {
    shots: number;
    assets: number;
    tasks: number;
    versions: number;
    crew: number;
  };
  shotStatus: ChartDatum[];
  assetStatus: AssetStatusDatum[];
  taskStatus: TaskStatusTrendDatum[];
  velocity: VelocityDatum[];
  versionStatus: VersionStatusDatum[];
  pctFinalByDept: PercentFinalDatum[];
  crew: CrewMemberDatum[];
  latestVersions: ReviewVersionItem[];
};

export type ChartDatum = {
  name: string;
  value: number;
  color: string;
};

export type AssetStatusDatum = {
  type: string;
} & Record<TaskStatus, number>;

export type TaskStatusTrendDatum = {
  department: string;
} & Record<TaskStatus, number>;

export type VelocityDatum = {
  week: string;
  final: number;
  approved: number;
};

export type VersionStatusDatum = {
  status: VersionStatus;
  label: string;
  value: number;
};

export type PercentFinalDatum = {
  department: string;
  pctFinal: number;
  final: number;
  total: number;
};

export type CrewMemberDatum = {
  id: string;
  name: string;
  department: string;
  role: string;
  taskCount: number;
  finalCount: number;
  loadPct: number;
};

export async function getDashboardStats(projectId: string): Promise<DashboardStats> {
  if (shouldUseDemoData()) {
    return getDemoDashboardStats(projectId);
  }

  const prisma = getPrisma();
  const [project, shots, assets, tasks, versions] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        startDate: true,
        dueDate: true,
        milestone: true,
        milestoneDate: true,
      },
    }),
    prisma.shot.findMany({
      where: { projectId },
      select: { status: true },
    }),
    prisma.asset.findMany({
      where: { projectId },
      select: { type: true, status: true },
    }),
    prisma.task.findMany({
      where: {
        OR: [{ shot: { projectId } }, { asset: { projectId } }],
      },
      select: {
        id: true,
        status: true,
        updatedAt: true,
        assignments: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                department: true,
                role: true,
                capacity: true,
              },
            },
          },
        },
      },
    }),
    prisma.version.findMany({
      where: {
        task: {
          OR: [{ shot: { projectId } }, { asset: { projectId } }],
        },
      },
      select: {
        status: true,
      },
    }),
  ]);

  if (!project) {
    throw new Error("Project not found.");
  }

  const latestVersions = (await getProjectReviewVersions(projectId)).slice(0, 12);

  return {
    project: {
      id: project.id,
      name: project.name,
      code: project.code,
      description: project.description,
      startDate: project.startDate.toISOString(),
      dueDate: project.dueDate.toISOString(),
      milestone: project.milestone,
      milestoneDate: project.milestoneDate?.toISOString() ?? null,
      daysRemaining: getDaysRemaining(project.dueDate),
      progressPct: getProjectProgress(project.startDate, project.dueDate),
    },
    counts: {
      shots: shots.length,
      assets: assets.length,
      tasks: tasks.length,
      versions: versions.length,
      crew: countCrew(tasks),
    },
    shotStatus: getShotStatus(shots),
    assetStatus: getAssetStatus(assets),
    taskStatus: getTaskStatusByDepartment(tasks),
    velocity: getVelocity(tasks),
    versionStatus: getVersionStatus(versions),
    pctFinalByDept: getPercentFinalByDepartment(tasks),
    crew: getCrew(tasks),
    latestVersions,
  };
}

export async function getDashboardSlice<T extends keyof DashboardStats>(projectId: string, key: T): Promise<DashboardStats[T]> {
  const stats = await getDashboardStats(projectId);
  return stats[key];
}

function getShotStatus(shots: { status: TaskStatus }[]): ChartDatum[] {
  return taskStatusOrder
    .map((status) => ({
      name: STATUS_COLORS[status].label,
      value: shots.filter((shot) => shot.status === status).length,
      color: STATUS_COLORS[status].dot,
    }))
    .filter((item) => item.value > 0);
}

function getAssetStatus(assets: { type: AssetType; status: TaskStatus }[]): AssetStatusDatum[] {
  const grouped = new Map<AssetType, AssetStatusDatum>();

  for (const asset of assets) {
    const current = grouped.get(asset.type) ?? createEmptyAssetStatus(asset.type);
    current[asset.status] += 1;
    grouped.set(asset.type, current);
  }

  return Array.from(grouped.values());
}

function getTaskStatusByDepartment(
  tasks: {
    status: TaskStatus;
    assignments: { user: { department: string | null } }[];
  }[],
): TaskStatusTrendDatum[] {
  const grouped = new Map<string, TaskStatusTrendDatum>();

  for (const task of tasks) {
    const departments = task.assignments.length
      ? new Set(task.assignments.map((assignment) => assignment.user.department ?? "Unassigned"))
      : new Set(["Unassigned"]);

    for (const department of departments) {
      const current = grouped.get(department) ?? createEmptyTaskTrend(department);
      current[task.status] += 1;
      grouped.set(department, current);
    }
  }

  return Array.from(grouped.values()).sort((a, b) => a.department.localeCompare(b.department));
}

function getVelocity(tasks: { status: TaskStatus; updatedAt: Date }[]): VelocityDatum[] {
  const buckets = new Map<string, VelocityDatum>();

  for (const task of tasks) {
    if (task.status !== "FINAL" && task.status !== "APPROVED") {
      continue;
    }

    const week = getWeekKey(task.updatedAt);
    const current = buckets.get(week) ?? { week, final: 0, approved: 0 };

    if (task.status === "FINAL") {
      current.final += 1;
    } else {
      current.approved += 1;
    }

    buckets.set(week, current);
  }

  return Array.from(buckets.values()).sort((a, b) => a.week.localeCompare(b.week)).slice(-10);
}

function getVersionStatus(versions: { status: VersionStatus }[]): VersionStatusDatum[] {
  return versionStatusOrder.map((status) => ({
    status,
    label: versionStatusLabel(status),
    value: versions.filter((version) => version.status === status).length,
  }));
}

function getPercentFinalByDepartment(
  tasks: {
    status: TaskStatus;
    assignments: { user: { department: string | null } }[];
  }[],
): PercentFinalDatum[] {
  return getTaskStatusByDepartment(tasks)
    .map((department) => {
      const total = taskStatusOrder.reduce((sum, status) => sum + department[status], 0);
      const final = department.FINAL;

      return {
        department: department.department,
        pctFinal: total ? Math.round((final / total) * 100) : 0,
        final,
        total,
      };
    })
    .sort((a, b) => b.pctFinal - a.pctFinal);
}

function getCrew(
  tasks: {
    status: TaskStatus;
    assignments: {
      user: {
        id: string;
        name: string;
        department: string | null;
        role: string;
        capacity: number;
      };
    }[];
  }[],
): CrewMemberDatum[] {
  const grouped = new Map<string, CrewMemberDatum & { capacity: number }>();

  for (const task of tasks) {
    for (const assignment of task.assignments) {
      const current =
        grouped.get(assignment.user.id) ??
        ({
          id: assignment.user.id,
          name: assignment.user.name,
          department: assignment.user.department ?? "Unassigned",
          role: assignment.user.role,
          taskCount: 0,
          finalCount: 0,
          loadPct: 0,
          capacity: assignment.user.capacity,
        } satisfies CrewMemberDatum & { capacity: number });

      current.taskCount += 1;
      current.finalCount += task.status === "FINAL" ? 1 : 0;
      current.loadPct = Math.min(240, Math.round((current.taskCount / Math.max(1, current.capacity * 4)) * 100));
      grouped.set(assignment.user.id, current);
    }
  }

  return Array.from(grouped.values())
    .sort((a, b) => b.taskCount - a.taskCount)
    .map((member) => ({
      id: member.id,
      name: member.name,
      department: member.department,
      role: member.role,
      taskCount: member.taskCount,
      finalCount: member.finalCount,
      loadPct: member.loadPct,
    }))
    .slice(0, 12);
}

function createEmptyAssetStatus(type: AssetType): AssetStatusDatum {
  return {
    type: ASSET_TYPE_LABELS[type],
    WAITING_TO_START: 0,
    READY_TO_START: 0,
    IN_PROGRESS: 0,
    PENDING_REVIEW: 0,
    APPROVED: 0,
    FINAL: 0,
    ON_HOLD: 0,
    OMIT: 0,
  };
}

function createEmptyTaskTrend(department: string): TaskStatusTrendDatum {
  return {
    department,
    WAITING_TO_START: 0,
    READY_TO_START: 0,
    IN_PROGRESS: 0,
    PENDING_REVIEW: 0,
    APPROVED: 0,
    FINAL: 0,
    ON_HOLD: 0,
    OMIT: 0,
  };
}

function getDaysRemaining(dueDate: Date): number {
  return Math.ceil((dueDate.getTime() - Date.now()) / 86_400_000);
}

function getProjectProgress(startDate: Date, dueDate: Date): number {
  const total = dueDate.getTime() - startDate.getTime();
  const elapsed = Date.now() - startDate.getTime();

  if (total <= 0) {
    return 100;
  }

  return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
}

function countCrew(tasks: { assignments: { user: { id: string } }[] }[]): number {
  return new Set(tasks.flatMap((task) => task.assignments.map((assignment) => assignment.user.id))).size;
}

function getWeekKey(date: Date): string {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = start.getUTCDay() || 7;
  start.setUTCDate(start.getUTCDate() - day + 1);
  return start.toISOString().slice(0, 10);
}

function versionStatusLabel(status: VersionStatus): string {
  switch (status) {
    case "PENDING_REVIEW":
      return "Pending Review";
    case "VIEWED":
      return "Viewed";
    case "APPROVED":
      return "Approved";
    case "CHANGES_REQUESTED":
      return "Changes Requested";
  }
}
