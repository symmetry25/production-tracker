import type { AssetType, DependencyType, TaskStatus, VersionStatus } from "@/generated/prisma/enums";

import type { AssetTableItem } from "@/lib/asset-data";
import type { AssetStatusDatum, DashboardStats } from "@/lib/dashboard-data";
import type { ProjectGridItem } from "@/lib/project-data";
import type { ReviewTaskOption, ReviewVersionItem } from "@/lib/review-data";
import type { ShotTableItem } from "@/lib/shot-data";
import { PIPELINE_STEPS, STATUS_COLORS } from "@/lib/status-colors";
import type { TaskAssignee, TaskTableItem } from "@/lib/task-data";

const demoProjectId = "demo-mkali-mission";
const demoTaskCostPerDay = 8_000;
const startDate = new Date("2026-05-01T00:00:00.000Z");
const dueDate = new Date("2026-08-28T00:00:00.000Z");
const milestoneDate = new Date("2026-07-18T00:00:00.000Z");
const createdAt = new Date("2026-05-20T09:00:00.000Z");

export type DemoCrewMember = TaskAssignee & {
  capacity: number;
};

type DemoShotSeed = {
  code: string;
  sequenceCode: string;
  description: string;
  cutDuration: number;
  status: TaskStatus;
  ownerIds: string[];
};

type DemoAssetSeed = {
  name: string;
  type: AssetType;
  status: TaskStatus;
  description: string;
  linkedShotCodes: string[];
};

type DemoTaskSeed = {
  id: string;
  name: string;
  status: TaskStatus;
  priority: number;
  startDate: string;
  dueDate: string;
  duration: number;
  timeLogged: number;
  estimatedCost: number;
  source: { kind: "shot"; code: string } | { kind: "asset"; name: string };
  assigneeIds: string[];
  predecessorIds?: string[];
  versionCount?: number;
  noteCount?: number;
};

const crew: DemoCrewMember[] = [
  { id: "demo-user-producer", name: "林一凡", department: "制片组", role: "PRODUCER", capacity: 5 },
  { id: "demo-user-line-producer", name: "何越", department: "制片组", role: "PRODUCER", capacity: 5 },
  { id: "demo-user-pm", name: "孟然", department: "制片组", role: "SUPERVISOR", capacity: 5 },
  { id: "demo-user-director", name: "赵宁", department: "导演组", role: "SUPERVISOR", capacity: 4 },
  { id: "demo-user-ad", name: "周岚", department: "导演组", role: "SUPERVISOR", capacity: 5 },
  { id: "demo-user-script", name: "唐婧", department: "编剧/场记组", role: "ARTIST", capacity: 5 },
  { id: "demo-user-actor-lead", name: "沈知夏", department: "演员/选角组", role: "ARTIST", capacity: 4 },
  { id: "demo-user-actor-support", name: "Leo Tan", department: "演员/选角组", role: "ARTIST", capacity: 4 },
  { id: "demo-user-casting", name: "陈茜", department: "演员/选角组", role: "SUPERVISOR", capacity: 4 },
  { id: "demo-user-dp", name: "Marcus Chen", department: "摄影组", role: "SUPERVISOR", capacity: 4 },
  { id: "demo-user-camera-op", name: "吴柏", department: "摄影组", role: "ARTIST", capacity: 4 },
  { id: "demo-user-ac1", name: "Evan Xu", department: "摄影助理组", role: "ARTIST", capacity: 5 },
  { id: "demo-user-ac2", name: "宋雨", department: "摄影助理组", role: "ARTIST", capacity: 5 },
  { id: "demo-user-dit", name: "Ava Wong", department: "DIT组", role: "ARTIST", capacity: 4 },
  { id: "demo-user-data-wrangler", name: "梁译", department: "DIT组", role: "ARTIST", capacity: 5 },
  { id: "demo-user-gaffer", name: "陈昊", department: "灯光电工组", role: "SUPERVISOR", capacity: 4 },
  { id: "demo-user-electrician", name: "韩立", department: "灯光电工组", role: "ARTIST", capacity: 5 },
  { id: "demo-user-key-grip", name: "高峰", department: "器械/Grip组", role: "SUPERVISOR", capacity: 4 },
  { id: "demo-user-art", name: "许珂", department: "美术组", role: "SUPERVISOR", capacity: 4 },
  { id: "demo-user-costume", name: "叶青", department: "服化/造型组", role: "SUPERVISOR", capacity: 4 },
  { id: "demo-user-prop-master", name: "李策", department: "道具组", role: "ARTIST", capacity: 5 },
  { id: "demo-user-sound", name: "梁森", department: "现场录音组", role: "ARTIST", capacity: 5 },
  { id: "demo-user-location", name: "陆遥", department: "场地管理组", role: "SUPERVISOR", capacity: 5 },
  { id: "demo-user-hotel", name: "苏敏", department: "酒店住宿组", role: "ARTIST", capacity: 5 },
  { id: "demo-user-vfx", name: "Nora Li", department: "调色/VFX组", role: "REVIEWER", capacity: 4 },
  { id: "demo-user-transport", name: "高远", department: "车辆运输组", role: "ARTIST", capacity: 5 },
  { id: "demo-user-catering", name: "Mina Zhao", department: "后勤餐饮组", role: "ARTIST", capacity: 5 },
  { id: "demo-user-stunt", name: "雷鹏", department: "特技/安全组", role: "SUPERVISOR", capacity: 3 },
  { id: "demo-user-post", name: "Milo Grant", department: "后期统筹组", role: "SUPERVISOR", capacity: 4 },
  { id: "demo-user-accountant", name: "林会计", department: "财务审计组", role: "PRODUCER", capacity: 4 },
];

const shotSeeds: DemoShotSeed[] = [
  {
    code: "RAID_0010",
    sequenceCode: "RAID",
    description: "山路车队抵达营地，包含航拍和车辆调度。",
    cutDuration: 128,
    status: "FINAL",
    ownerIds: ["demo-user-dp", "demo-user-dit", "demo-user-transport"],
  },
  {
    code: "RAID_0020",
    sequenceCode: "RAID",
    description: "主演穿过雨棚进入主场景，演员、服装和收音同场。",
    cutDuration: 174,
    status: "APPROVED",
    ownerIds: ["demo-user-ad", "demo-user-sound", "demo-user-art"],
  },
  {
    code: "RAID_0030",
    sequenceCode: "RAID",
    description: "夜戏灯光预设，器材车和发电机占用较高。",
    cutDuration: 212,
    status: "PENDING_REVIEW",
    ownerIds: ["demo-user-gaffer", "demo-user-dp", "demo-user-dit"],
  },
  {
    code: "RAID_0040",
    sequenceCode: "RAID",
    description: "爆点与烟雾需要 VFX 供应商复核版本。",
    cutDuration: 96,
    status: "IN_PROGRESS",
    ownerIds: ["demo-user-vfx", "demo-user-art"],
  },
  {
    code: "HOTEL_0100",
    sequenceCode: "HOTEL",
    description: "酒店走廊长镜头，涉及住宿场地和物业时间限制。",
    cutDuration: 142,
    status: "READY_TO_START",
    ownerIds: ["demo-user-producer", "demo-user-ad", "demo-user-sound"],
  },
  {
    code: "CAR_0200",
    sequenceCode: "CAR",
    description: "跟拍车辆内景，车辆、司机、吸盘车和保险单据需审计。",
    cutDuration: 188,
    status: "IN_PROGRESS",
    ownerIds: ["demo-user-transport", "demo-user-dp"],
  },
  {
    code: "VFX_0300",
    sequenceCode: "VFX",
    description: "雨雾延展和背景替换，交付给外部 VFX vendor。",
    cutDuration: 240,
    status: "PENDING_REVIEW",
    ownerIds: ["demo-user-vfx", "demo-user-post"],
  },
  {
    code: "FINAL_0400",
    sequenceCode: "FINAL",
    description: "最终调色和混音版本汇总，用于监制审查。",
    cutDuration: 160,
    status: "WAITING_TO_START",
    ownerIds: ["demo-user-post", "demo-user-vfx"],
  },
];

const assetSeeds: DemoAssetSeed[] = [
  {
    name: "主角雨衣 Hero Raincoat",
    type: "CHARACTER",
    status: "APPROVED",
    description: "服装、化妆和 continuity 备注归档。",
    linkedShotCodes: ["RAID_0020", "HOTEL_0100"],
  },
  {
    name: "山路营地 Mountain Camp",
    type: "ENVIRONMENT",
    status: "IN_PROGRESS",
    description: "场地搭建、灯光 rigging 和夜戏电力规划。",
    linkedShotCodes: ["RAID_0010", "RAID_0030"],
  },
  {
    name: "Picture Car A",
    type: "VEHICLE",
    status: "PENDING_REVIEW",
    description: "车辆公司、司机、保险和油费拆分。",
    linkedShotCodes: ["CAR_0200", "RAID_0010"],
  },
  {
    name: "DIT Cart Package",
    type: "PROP",
    status: "FINAL",
    description: "监看、LUT、转码和素材备份设备。",
    linkedShotCodes: ["RAID_0010", "RAID_0030", "VFX_0300"],
  },
  {
    name: "Rain Extension FX",
    type: "FX",
    status: "PENDING_REVIEW",
    description: "外部 VFX 供应商版本审查对象。",
    linkedShotCodes: ["RAID_0040", "VFX_0300"],
  },
  {
    name: "Hotel Hallway Set",
    type: "ENVIRONMENT",
    status: "READY_TO_START",
    description: "酒店住宿、场租、夜间物业费用和清洁费。",
    linkedShotCodes: ["HOTEL_0100"],
  },
  {
    name: "Camera Vehicle Rig",
    type: "RIG",
    status: "IN_PROGRESS",
    description: "吸盘车、稳定器、无线图传和安全检查。",
    linkedShotCodes: ["CAR_0200"],
  },
];

const taskSeeds: DemoTaskSeed[] = [
  {
    id: "demo-task-raid0010-lay",
    name: "LAY",
    status: "FINAL",
    priority: 3,
    startDate: "2026-05-03",
    dueDate: "2026-05-05",
    duration: 3,
    timeLogged: 3,
    estimatedCost: 24000,
    source: { kind: "shot", code: "RAID_0010" },
    assigneeIds: ["demo-user-dp", "demo-user-transport"],
    versionCount: 1,
    noteCount: 1,
  },
  {
    id: "demo-task-raid0010-cmp",
    name: "CMP",
    status: "APPROVED",
    priority: 3,
    startDate: "2026-05-06",
    dueDate: "2026-05-10",
    duration: 4,
    timeLogged: 4.5,
    estimatedCost: 36000,
    source: { kind: "shot", code: "RAID_0010" },
    assigneeIds: ["demo-user-vfx", "demo-user-post"],
    predecessorIds: ["demo-task-raid0010-lay"],
    versionCount: 2,
    noteCount: 2,
  },
  {
    id: "demo-task-raid0030-lgt",
    name: "LGT",
    status: "PENDING_REVIEW",
    priority: 4,
    startDate: "2026-05-12",
    dueDate: "2026-05-15",
    duration: 4,
    timeLogged: 5.5,
    estimatedCost: 42000,
    source: { kind: "shot", code: "RAID_0030" },
    assigneeIds: ["demo-user-gaffer", "demo-user-dp"],
    versionCount: 1,
    noteCount: 3,
  },
  {
    id: "demo-task-car0200-rig",
    name: "Camera vehicle rig check",
    status: "IN_PROGRESS",
    priority: 5,
    startDate: "2026-05-18",
    dueDate: "2026-05-20",
    duration: 3,
    timeLogged: 8.75,
    estimatedCost: 68000,
    source: { kind: "asset", name: "Camera Vehicle Rig" },
    assigneeIds: ["demo-user-transport", "demo-user-dp"],
    versionCount: 0,
    noteCount: 1,
  },
  {
    id: "demo-task-dit-package",
    name: "DIT data workflow",
    status: "FINAL",
    priority: 4,
    startDate: "2026-05-04",
    dueDate: "2026-05-09",
    duration: 5,
    timeLogged: 5,
    estimatedCost: 52000,
    source: { kind: "asset", name: "DIT Cart Package" },
    assigneeIds: ["demo-user-dit", "demo-user-post"],
    versionCount: 1,
    noteCount: 1,
  },
  {
    id: "demo-task-hotel-location",
    name: "Hotel permit and accommodation",
    status: "READY_TO_START",
    priority: 4,
    startDate: "2026-05-24",
    dueDate: "2026-05-28",
    duration: 5,
    timeLogged: 6,
    estimatedCost: 118000,
    source: { kind: "shot", code: "HOTEL_0100" },
    assigneeIds: ["demo-user-producer", "demo-user-ad"],
    versionCount: 0,
    noteCount: 2,
  },
  {
    id: "demo-task-vfx0300-rain",
    name: "Rain extension comp",
    status: "PENDING_REVIEW",
    priority: 5,
    startDate: "2026-06-01",
    dueDate: "2026-06-10",
    duration: 8,
    timeLogged: 12,
    estimatedCost: 86000,
    source: { kind: "asset", name: "Rain Extension FX" },
    assigneeIds: ["demo-user-vfx", "demo-user-post"],
    predecessorIds: ["demo-task-raid0030-lgt"],
    versionCount: 3,
    noteCount: 5,
  },
  {
    id: "demo-task-final-report",
    name: "Producer audit report",
    status: "WAITING_TO_START",
    priority: 3,
    startDate: "2026-06-12",
    dueDate: "2026-06-15",
    duration: 3,
    timeLogged: 0,
    estimatedCost: 22000,
    source: { kind: "shot", code: "FINAL_0400" },
    assigneeIds: ["demo-user-producer", "demo-user-post"],
    predecessorIds: ["demo-task-vfx0300-rain"],
    versionCount: 0,
    noteCount: 0,
  },
];

const reviewVersions: ReviewVersionItem[] = [
  {
    id: "demo-version-rain-v003",
    projectId: demoProjectId,
    number: 3,
    name: "VFX_0300_RainComp_v003",
    status: "PENDING_REVIEW",
    fileUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    fileType: "video/mp4",
    thumbnailUrl: null,
    description: "VFX 供应商交付的雨雾延展版本，需要确认边缘和付款节点。",
    frameCount: 240,
    fps: 24,
    createdAt: "2026-06-08T16:40:00.000Z",
    uploadedBy: { id: "demo-user-vfx", name: "Nora Li", department: "调色/VFX组" },
    task: { id: "demo-task-vfx0300-rain", name: "Rain extension comp", contextLabel: "VFX_0300", contextType: "asset" },
    paymentGate: { status: "hold", label: "待审暂缓", detail: "等待监制或导演审批后再放款。" },
    notes: [
      {
        id: "demo-note-rain-1",
        content: "雨丝方向已经统一，但右上角酒店霓虹反光还需要压一点。",
        createdAt: "2026-06-08T18:10:00.000Z",
        author: { id: "demo-user-post", name: "Milo Grant", department: "后期统筹组" },
      },
      {
        id: "demo-note-rain-2",
        content: "供应商报价和交付进度需要同步到审计页，避免付款晚于审批。",
        createdAt: "2026-06-09T09:15:00.000Z",
        author: { id: "demo-user-producer", name: "林一凡", department: "制片组" },
      },
    ],
  },
  {
    id: "demo-version-raid0010-v002",
    projectId: demoProjectId,
    number: 2,
    name: "RAID_0010_CMP_v002",
    status: "APPROVED",
    fileUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    fileType: "video/mp4",
    thumbnailUrl: null,
    description: "山路车队镜头，已通过监制审查。",
    frameCount: 128,
    fps: 24,
    createdAt: "2026-05-12T12:05:00.000Z",
    uploadedBy: { id: "demo-user-post", name: "Milo Grant", department: "后期统筹组" },
    task: { id: "demo-task-raid0010-cmp", name: "CMP", contextLabel: "RAID_0010", contextType: "shot" },
    paymentGate: { status: "ready", label: "可付款", detail: "版本已通过，可进入付款审批。" },
    notes: [
      {
        id: "demo-note-raid-1",
        content: "通过。把镜头关联到车辆公司、器材公司和 DIT 备份记录。",
        createdAt: "2026-05-12T14:22:00.000Z",
        author: { id: "demo-user-ad", name: "周岚", department: "导演组" },
      },
    ],
  },
  {
    id: "demo-version-lgt-v001",
    projectId: demoProjectId,
    number: 1,
    name: "RAID_0030_LGT_v001",
    status: "CHANGES_REQUESTED",
    fileUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    fileType: "video/mp4",
    thumbnailUrl: null,
    description: "夜戏灯光预览版本，当前器材和发电机费用偏高。",
    frameCount: 212,
    fps: 24,
    createdAt: "2026-05-15T21:35:00.000Z",
    uploadedBy: { id: "demo-user-gaffer", name: "陈昊", department: "灯光电工组" },
    task: { id: "demo-task-raid0030-lgt", name: "LGT", contextLabel: "RAID_0030", contextType: "shot" },
    paymentGate: { status: "hold", label: "暂缓付款", detail: "版本需返修，供应商付款应暂缓。" },
    notes: [
      {
        id: "demo-note-lgt-1",
        content: "灯位很好，但发电车需要压缩半天租赁。请更新费用明细。",
        createdAt: "2026-05-16T09:30:00.000Z",
        author: { id: "demo-user-producer", name: "林一凡", department: "制片组" },
      },
    ],
  },
];

export function isDemoProjectId(projectId: string) {
  return projectId === demoProjectId;
}

export function shouldUseDemoData() {
  return !process.env.DATABASE_URL;
}

export function getDemoCrewMembers(projectId: string): DemoCrewMember[] {
  if (!isDemoProjectId(projectId)) {
    return [];
  }

  return crew;
}

export function getDemoProjectGridItems(): ProjectGridItem[] {
  return [
    {
      id: demoProjectId,
      name: "Mkali's Mission",
      code: "MKALI",
      thumbnailUrl: null,
      description: "剧组预算、人员、器材、酒店住宿、车辆、VFX 供应商和版本审查的完整演示项目。",
      startDate,
      dueDate,
      milestone: "VFX vendor review",
      milestoneDate,
      status: "demo",
      createdAt,
      shotCount: shotSeeds.length,
      assetCount: assetSeeds.length,
      taskCount: taskSeeds.length,
      progress: getProgress(startDate, dueDate),
    },
  ];
}

export function getDemoShotTableItems(projectId: string): ShotTableItem[] {
  if (!isDemoProjectId(projectId)) {
    return [];
  }

  return shotSeeds.map((shot) => {
    const pipeline: ShotTableItem["pipeline"] = Object.fromEntries(PIPELINE_STEPS.map((step) => [step, null]));

    for (const step of PIPELINE_STEPS) {
      const id = `demo-shot-task-${shot.code.toLowerCase()}-${step.toLowerCase()}`;
      pipeline[step] = {
        id,
        name: step,
        status: derivePipelineStatus(shot.status, step),
        dueDate: deriveDueDate(shot.code, step),
        assignees: shot.ownerIds.map((id) => getCrewName(id)),
      };
    }

    return {
      id: `demo-shot-${shot.code.toLowerCase()}`,
      code: shot.code,
      description: shot.description,
      cutIn: 1001,
      cutOut: 1001 + shot.cutDuration,
      cutDuration: shot.cutDuration,
      status: shot.status,
      sequenceCode: shot.sequenceCode,
      pipeline,
    };
  });
}

export function getDemoAssetTableItems(projectId: string): AssetTableItem[] {
  if (!isDemoProjectId(projectId)) {
    return [];
  }

  return assetSeeds.map((asset) => {
    const pipeline: AssetTableItem["pipeline"] = Object.fromEntries(PIPELINE_STEPS.map((step) => [step, null]));

    for (const step of PIPELINE_STEPS) {
      pipeline[step] = {
        id: `demo-asset-task-${asset.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}-${step.toLowerCase()}`,
        name: step,
        status: derivePipelineStatus(asset.status, step),
      };
    }

    return {
      id: getAssetId(asset.name),
      name: asset.name,
      type: asset.type,
      status: asset.status,
      description: asset.description,
      thumbnailUrl: null,
      linkedShots: asset.linkedShotCodes.map((code) => ({ id: getShotId(code), code })),
      pipeline,
    };
  });
}

export function getDemoTaskTableItems(projectId: string): TaskTableItem[] {
  if (!isDemoProjectId(projectId)) {
    return [];
  }

  const tasks = taskSeeds.map(mapTaskSeed);

  return tasks.map((task) => ({
    ...task,
    predecessors: (taskSeeds.find((seed) => seed.id === task.id)?.predecessorIds ?? []).map((predecessorId) => {
      const predecessor = tasks.find((item) => item.id === predecessorId);

      return {
        id: `demo-dependency-${predecessorId}-${task.id}`,
        type: "FS" as DependencyType,
        lagDays: 0,
        taskId: predecessorId,
        taskName: predecessor?.name ?? predecessorId,
        contextLabel: predecessor?.context.label ?? "Demo",
      };
    }),
  }));
}

export function getDemoTaskFormOptions(projectId: string) {
  return {
    shots: getDemoShotTableItems(projectId).map((shot) => ({
      id: shot.id,
      code: shot.code,
      sequenceCode: shot.sequenceCode,
    })),
    assets: getDemoAssetTableItems(projectId).map((asset) => ({
      id: asset.id,
      name: asset.name,
      type: asset.type,
    })),
    users: crew.map(toTaskAssignee),
  };
}

export function getDemoProjectReviewVersions(projectId: string): ReviewVersionItem[] {
  if (!isDemoProjectId(projectId)) {
    return [];
  }

  return reviewVersions;
}

export function getDemoProjectReviewTaskOptions(projectId: string): ReviewTaskOption[] {
  return getDemoTaskTableItems(projectId).map((task) => ({
    id: task.id,
    name: task.name,
    contextLabel: task.context.label,
  }));
}

export function getDemoTaskReviewVersions(taskId: string): ReviewVersionItem[] {
  return reviewVersions.filter((version) => version.task.id === taskId);
}

export function getDemoDashboardStats(projectId: string): DashboardStats {
  const shots = getDemoShotTableItems(projectId);
  const assets = getDemoAssetTableItems(projectId);
  const tasks = getDemoTaskTableItems(projectId);
  const versions = getDemoProjectReviewVersions(projectId);

  return {
    project: {
      id: demoProjectId,
      name: "Mkali's Mission",
      code: "MKALI",
      thumbnailUrl: null,
      description: "用于展示剧组预算、供应商、镜头资产、VFX 审查和制片风险的完整演示项目。",
      startDate: startDate.toISOString(),
      dueDate: dueDate.toISOString(),
      milestone: "VFX vendor review",
      milestoneDate: milestoneDate.toISOString(),
      daysRemaining: Math.ceil((dueDate.getTime() - Date.now()) / 86_400_000),
      progressPct: getProgress(startDate, dueDate),
    },
    counts: {
      shots: shots.length,
      assets: assets.length,
      tasks: tasks.length,
      versions: versions.length,
      crew: crew.length,
    },
    shotStatus: getStatusChart(shots.map((shot) => shot.status)),
    assetStatus: getAssetStatus(assets),
    taskStatus: getTaskStatusByDepartment(tasks),
    velocity: [
      { week: "2026-05-11", approved: 2, final: 1 },
      { week: "2026-05-18", approved: 3, final: 2 },
      { week: "2026-05-25", approved: 2, final: 3 },
      { week: "2026-06-01", approved: 4, final: 2 },
    ],
    versionStatus: getVersionStatus(versions),
    pctFinalByDept: getPercentFinalByDepartment(tasks),
    crew: getCrewStats(tasks),
    latestVersions: versions,
  };
}

function mapTaskSeed(seed: DemoTaskSeed): TaskTableItem {
  const calculatedCost = Math.round(seed.timeLogged * demoTaskCostPerDay);
  const assignees = seed.assigneeIds.map((id) => toTaskAssignee(getCrewMember(id)));

  return {
    id: seed.id,
    name: seed.name,
    status: seed.status,
    priority: seed.priority,
    startDate: `${seed.startDate}T00:00:00.000Z`,
    dueDate: `${seed.dueDate}T00:00:00.000Z`,
    duration: seed.duration,
    timeLogged: seed.timeLogged,
    estimatedCost: seed.estimatedCost,
    calculatedCost,
    overBudget: calculatedCost > seed.estimatedCost,
    context: getDemoTaskContext(seed.source),
    assignees,
    reviewerIds: ["demo-user-producer"],
    predecessors: [],
    successors: [],
    versionCount: seed.versionCount ?? 0,
    noteCount: seed.noteCount ?? 0,
  };
}

function getDemoTaskContext(source: DemoTaskSeed["source"]): TaskTableItem["context"] {
  if (source.kind === "shot") {
    return {
      kind: "shot",
      id: getShotId(source.code),
      label: source.code,
      secondary: shotSeeds.find((shot) => shot.code === source.code)?.sequenceCode ?? "SEQ",
    };
  }

  return {
    kind: "asset",
    id: getAssetId(source.name),
    label: source.name,
    secondary: assetSeeds.find((asset) => asset.name === source.name)?.type ?? "PROP",
  };
}

function getStatusChart(statuses: TaskStatus[]) {
  const counts = new Map<TaskStatus, number>();
  for (const status of statuses) {
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([status, value]) => ({
    name: STATUS_COLORS[status].label,
    value,
    color: STATUS_COLORS[status].dot,
  }));
}

function getAssetStatus(assets: AssetTableItem[]) {
  const grouped = new Map<AssetType, AssetStatusDatum>();

  for (const asset of assets) {
    const current = grouped.get(asset.type) ?? {
      type: asset.type,
      WAITING_TO_START: 0,
      READY_TO_START: 0,
      IN_PROGRESS: 0,
      PENDING_REVIEW: 0,
      APPROVED: 0,
      FINAL: 0,
      ON_HOLD: 0,
      OMIT: 0,
    };
    current[asset.status] += 1;
    grouped.set(asset.type, current);
  }

  return Array.from(grouped.values());
}

function getTaskStatusByDepartment(tasks: TaskTableItem[]) {
  const statuses: TaskStatus[] = ["WAITING_TO_START", "READY_TO_START", "IN_PROGRESS", "PENDING_REVIEW", "APPROVED", "FINAL", "ON_HOLD", "OMIT"];
  const grouped = new Map<string, DashboardStats["taskStatus"][number]>();

  for (const task of tasks) {
    for (const assignee of task.assignees) {
      const department = assignee.department ?? "未分组";
      const current =
        grouped.get(department) ??
        ({
          department,
          WAITING_TO_START: 0,
          READY_TO_START: 0,
          IN_PROGRESS: 0,
          PENDING_REVIEW: 0,
          APPROVED: 0,
          FINAL: 0,
          ON_HOLD: 0,
          OMIT: 0,
        } satisfies DashboardStats["taskStatus"][number]);

      current[task.status] += 1;
      grouped.set(department, current);
    }
  }

  return Array.from(grouped.values()).sort((a, b) => {
    const aTotal = statuses.reduce((sum, status) => sum + a[status], 0);
    const bTotal = statuses.reduce((sum, status) => sum + b[status], 0);
    return bTotal - aTotal;
  });
}

function getVersionStatus(versions: ReviewVersionItem[]) {
  const labels: Record<VersionStatus, string> = {
    PENDING_REVIEW: "Pending Review",
    VIEWED: "Viewed",
    APPROVED: "Approved",
    CHANGES_REQUESTED: "Changes Requested",
  };
  const statuses: VersionStatus[] = ["PENDING_REVIEW", "VIEWED", "APPROVED", "CHANGES_REQUESTED"];

  return statuses.map((status) => ({
    status,
    label: labels[status],
    value: versions.filter((version) => version.status === status).length,
  }));
}

function getPercentFinalByDepartment(tasks: TaskTableItem[]) {
  return getTaskStatusByDepartment(tasks)
    .map((row) => {
      const total = Object.entries(row).reduce((sum, [key, value]) => (key === "department" ? sum : sum + Number(value)), 0);
      const final = row.FINAL;

      return {
        department: row.department,
        pctFinal: total ? Math.round((final / total) * 100) : 0,
        final,
        total,
      };
    })
    .sort((a, b) => b.total - a.total);
}

function getCrewStats(tasks: TaskTableItem[]) {
  return crew
    .map((member) => {
      const assignedTasks = tasks.filter((task) => task.assignees.some((assignee) => assignee.id === member.id));
      const finalCount = assignedTasks.filter((task) => task.status === "FINAL").length;

      return {
        id: member.id,
        name: member.name,
        department: member.department ?? "未分组",
        role: member.role,
        taskCount: assignedTasks.length,
        finalCount,
        loadPct: Math.min(220, Math.round((assignedTasks.length / Math.max(1, member.capacity * 2)) * 100)),
      };
    })
    .filter((member) => member.taskCount > 0)
    .sort((a, b) => b.taskCount - a.taskCount);
}

function derivePipelineStatus(baseStatus: TaskStatus, step: string): TaskStatus {
  if (baseStatus === "FINAL") return step === "CMP" ? "FINAL" : "APPROVED";
  if (baseStatus === "APPROVED") return step === "CMP" ? "APPROVED" : "FINAL";
  if (baseStatus === "PENDING_REVIEW") return step === "LGT" || step === "CMP" ? "PENDING_REVIEW" : "IN_PROGRESS";
  if (baseStatus === "IN_PROGRESS") return step === "LAY" || step === "ANM" ? "IN_PROGRESS" : "READY_TO_START";
  if (baseStatus === "READY_TO_START") return step === "LAY" ? "READY_TO_START" : "WAITING_TO_START";
  return baseStatus;
}

function deriveDueDate(code: string, step: string) {
  const shotIndex = Math.max(0, shotSeeds.findIndex((shot) => shot.code === code));
  const stepIndex = Math.max(0, PIPELINE_STEPS.indexOf(step as (typeof PIPELINE_STEPS)[number]));
  const date = new Date(startDate);
  date.setUTCDate(date.getUTCDate() + shotIndex * 4 + stepIndex + 4);
  return date.toISOString();
}

function getProgress(start: Date, due: Date) {
  const total = due.getTime() - start.getTime();
  const elapsed = Date.now() - start.getTime();

  if (total <= 0) {
    return 100;
  }

  return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
}

function getCrewName(id: string) {
  return getCrewMember(id).name;
}

function getCrewMember(id: string) {
  return crew.find((member) => member.id === id) ?? crew[0];
}

function toTaskAssignee(member: DemoCrewMember): TaskAssignee {
  return {
    id: member.id,
    name: member.name,
    department: member.department,
    role: member.role,
  };
}

function getShotId(code: string) {
  return `demo-shot-${code.toLowerCase()}`;
}

function getAssetId(name: string) {
  return `demo-asset-${name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`;
}
