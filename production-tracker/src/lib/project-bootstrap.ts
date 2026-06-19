import { AssetType, TaskStatus } from "@/generated/prisma/enums";
import type { Project } from "@/generated/prisma/client";
import type { getPrisma } from "@/lib/prisma";

type PrismaClient = ReturnType<typeof getPrisma>;
type BootstrapProject = Pick<Project, "id" | "startDate" | "dueDate">;

const pipelineSteps = [
  { name: "LAY", offset: 0, duration: 2, cost: 1200 },
  { name: "ANM", offset: 2, duration: 3, cost: 1800 },
  { name: "LGT", offset: 5, duration: 2, cost: 1500 },
  { name: "CMP", offset: 7, duration: 2, cost: 1600 },
];

const phaseTemplates = [
  { name: "Prep / 前期准备", startOffset: 0, endOffset: 10 },
  { name: "Shoot / 拍摄制作", startOffset: 11, endOffset: 30 },
  { name: "Post / 后期交付", startOffset: 31, endOffset: 52 },
];

const shotTemplates = [
  { code: "MAIN_0010", description: "主场景 establishing shot，可用于测试镜头表、任务状态和审阅版本。" },
  { code: "MAIN_0020", description: "演员调度和部门协作镜头，可用于测试任务分配和资源规划。" },
  { code: "MAIN_0030", description: "需要供应商或后期参与的镜头，可用于测试预算和版本审阅。" },
];

const assetTemplates = [
  { name: "Hero Character / 主演角色", type: AssetType.CHARACTER, description: "角色、服装或关键演员资产。" },
  { name: "Primary Location / 主场景", type: AssetType.ENVIRONMENT, description: "场地、置景、酒店或棚景资产。" },
  { name: "Picture Vehicle / 车辆资产", type: AssetType.VEHICLE, description: "车辆、司机、保险和运输调度资产。" },
];

export async function bootstrapProjectWorkspace(prisma: PrismaClient, project: BootstrapProject) {
  const reviewer = await prisma.user.findFirst({
    where: { role: { in: ["ADMIN", "PRODUCER", "SUPERVISOR"] } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  const artist = await prisma.user.findFirst({
    where: { role: { in: ["ARTIST", "SUPERVISOR", "PRODUCER", "ADMIN"] } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  for (const phase of phaseTemplates) {
    await prisma.phase.create({
      data: {
        projectId: project.id,
        name: phase.name,
        startDate: addDays(project.startDate, phase.startOffset),
        endDate: clampDate(addDays(project.startDate, phase.endOffset), project.dueDate),
      },
    });
  }

  const sequence = await prisma.sequence.create({
    data: {
      projectId: project.id,
      code: "MAIN",
      description: "Default production sequence created for project setup.",
    },
  });

  for (const [shotIndex, shotTemplate] of shotTemplates.entries()) {
    const shot = await prisma.shot.create({
      data: {
        projectId: project.id,
        sequenceId: sequence.id,
        code: shotTemplate.code,
        description: shotTemplate.description,
        cutIn: 1001,
        cutOut: 1101 + shotIndex * 24,
        cutDuration: 100 + shotIndex * 24,
        status: shotIndex === 0 ? TaskStatus.READY_TO_START : TaskStatus.WAITING_TO_START,
      },
    });

    await createPipelineTasks(prisma, {
      shotId: shot.id,
      startDate: addDays(project.startDate, shotIndex * 3),
      assigneeId: artist?.id,
      reviewerId: reviewer?.id,
    });
  }

  for (const [assetIndex, assetTemplate] of assetTemplates.entries()) {
    const asset = await prisma.asset.create({
      data: {
        projectId: project.id,
        name: assetTemplate.name,
        type: assetTemplate.type,
        description: assetTemplate.description,
        status: assetIndex === 0 ? TaskStatus.READY_TO_START : TaskStatus.WAITING_TO_START,
      },
    });

    await createPipelineTasks(prisma, {
      assetId: asset.id,
      startDate: addDays(project.startDate, assetIndex * 4),
      assigneeId: artist?.id,
      reviewerId: reviewer?.id,
    });
  }

  await prisma.workOrder.create({
    data: {
      projectId: project.id,
      title: "Kickoff package / 项目启动包",
      description: "确认通告、预算拆分、人员与供应商、媒体审阅和交付节点。",
      status: "open",
    },
  });
}

async function createPipelineTasks(
  prisma: PrismaClient,
  input: {
    shotId?: string;
    assetId?: string;
    startDate: Date;
    assigneeId?: string;
    reviewerId?: string;
  },
) {
  for (const [index, step] of pipelineSteps.entries()) {
    await prisma.task.create({
      data: {
        name: step.name,
        shotId: input.shotId,
        assetId: input.assetId,
        status: index === 0 ? TaskStatus.READY_TO_START : TaskStatus.WAITING_TO_START,
        priority: Math.max(0, 2 - index),
        startDate: addDays(input.startDate, step.offset),
        dueDate: addDays(input.startDate, step.offset + step.duration),
        duration: step.duration,
        estimatedCost: step.cost,
        assignments: input.assigneeId
          ? {
              create: {
                userId: input.assigneeId,
                reviewerId: input.reviewerId ?? null,
              },
            }
          : undefined,
      },
    });
  }
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function clampDate(date: Date, maxDate: Date) {
  return date.getTime() > maxDate.getTime() ? maxDate : date;
}
