import type { AssetType, Role, TaskStatus } from "@/generated/prisma/enums";
import { shouldUseDemoData } from "@/lib/demo-data";
import { getPrisma } from "@/lib/prisma";
import { TASK_COST_PER_DAY } from "@/lib/task-data";

export type BudgetDepartment = {
  id: string;
  name: string;
  budget: number;
  committed: number;
  actual: number;
  risk: "ok" | "watch" | "over";
  color: string;
};

export type ResourcePerson = {
  id: string;
  name: string;
  role: string;
  department: string;
  vendor: string;
  grade: string;
  trustScore: number;
  dayRate: number;
  days: number;
  total: number;
};

export type VendorSpend = {
  id: string;
  name: string;
  category: "equipment" | "vehicle" | "hotel" | "location" | "vfx" | "production";
  owner: string;
  amount: number;
  status: "quoted" | "contracted" | "paid" | "review";
  progress: number;
  auditFlag: string;
};

export type PaymentMilestone = {
  id: string;
  vendorId: string;
  vendorName: string;
  label: string;
  dueDate: string;
  amount: number;
  status: "blocked" | "ready" | "scheduled" | "paid";
  gate: string;
};

export type AuditDocument = {
  id: string;
  owner: string;
  category: string;
  required: number;
  received: number;
  missing: string[];
  severity: "ok" | "watch" | "over";
};

export type ResourceInsight = {
  id: string;
  title: string;
  detail: string;
  severity: "ok" | "watch" | "over";
  amount?: number;
};

export type FundFlowLink = {
  from: string;
  to: string;
  amount: number;
};

export type ResourceBudgetData = {
  project: {
    id: string;
    name: string;
    totalBudget: number;
    actualTotal: number;
    committedTotal: number;
  };
  departments: BudgetDepartment[];
  people: ResourcePerson[];
  vendors: VendorSpend[];
  payments: PaymentMilestone[];
  documents: AuditDocument[];
  insights: ResourceInsight[];
  fundFlow: FundFlowLink[];
};

export type ResourceProjectSnapshot = {
  id: string;
  name: string;
  tasks: ResourceProjectTask[];
  assets: ResourceProjectAsset[];
};

export type ResourceProjectTask = {
  id: string;
  name: string;
  status: TaskStatus;
  timeLogged: number;
  estimatedCost: number | null;
  shot: { id: string; code: string; status: TaskStatus } | null;
  asset: ResourceProjectAsset | null;
  assignments: {
    user: ResourceProjectUser;
  }[];
};

export type ResourceProjectAsset = {
  id: string;
  name: string;
  type: AssetType;
  status: TaskStatus;
};

export type ResourceProjectUser = {
  id: string;
  name: string;
  role: Role;
  department: string | null;
  capacity: number;
  userGrade: { grade: { code: string } } | null;
  scores: {
    score: number;
    dimension: {
      maxScore: number;
      weight: number;
    };
  }[];
};

type DepartmentBucket = {
  id: string;
  name: string;
  budget: number;
  actual: number;
  committed: number;
  color: string;
};

type PersonBucket = {
  user: ResourceProjectUser;
  department: string;
  days: number;
  total: number;
};

type VendorBucket = {
  id: string;
  name: string;
  category: VendorSpend["category"];
  owner: string;
  amount: number;
  actual: number;
  statuses: Set<TaskStatus>;
};

const departments: BudgetDepartment[] = [
  { id: "production", name: "制片组", budget: 380000, committed: 220000, actual: 180000, risk: "watch", color: "#157a6e" },
  { id: "directing", name: "导演组", budget: 220000, committed: 120000, actual: 98000, risk: "ok", color: "#2867b2" },
  { id: "script", name: "编剧/场记组", budget: 100000, committed: 45000, actual: 36000, risk: "ok", color: "#496a8f" },
  { id: "cast", name: "演员/选角组", budget: 530000, committed: 310000, actual: 276000, risk: "watch", color: "#b25f7c" },
  { id: "camera", name: "摄影组", budget: 470000, committed: 265000, actual: 228000, risk: "watch", color: "#c84c39" },
  { id: "camera-assist", name: "摄影助理组", budget: 150000, committed: 75000, actual: 62000, risk: "ok", color: "#a86142" },
  { id: "dit", name: "DIT组", budget: 140000, committed: 70000, actual: 56000, risk: "ok", color: "#4f7f9b" },
  { id: "lighting", name: "灯光电工组", budget: 300000, committed: 180000, actual: 138000, risk: "watch", color: "#c98a1c" },
  { id: "grip", name: "器械/Grip组", budget: 190000, committed: 110000, actual: 85000, risk: "watch", color: "#8f6f2a" },
  { id: "art", name: "美术组", budget: 300000, committed: 185000, actual: 146000, risk: "ok", color: "#6b5aa6" },
  { id: "costume", name: "服化/造型组", budget: 200000, committed: 110000, actual: 88000, risk: "ok", color: "#a05574" },
  { id: "props", name: "道具组", budget: 150000, committed: 85000, actual: 66000, risk: "watch", color: "#8f8a3d" },
  { id: "sound", name: "现场录音组", budget: 140000, committed: 70000, actual: 52000, risk: "ok", color: "#173f52" },
  { id: "location", name: "场地管理组", budget: 235000, committed: 145000, actual: 102000, risk: "watch", color: "#567d3f" },
  { id: "hotel", name: "酒店住宿组", budget: 225000, committed: 130000, actual: 92000, risk: "watch", color: "#b87949" },
  { id: "vehicle", name: "车辆运输组", budget: 250000, committed: 268000, actual: 182000, risk: "over", color: "#477a38" },
  { id: "catering", name: "后勤餐饮组", budget: 175000, committed: 95000, actual: 72000, risk: "ok", color: "#9b6a3e" },
  { id: "stunt", name: "特技/安全组", budget: 170000, committed: 100000, actual: 68000, risk: "watch", color: "#944a3e" },
  { id: "vfx", name: "调色/VFX组", budget: 310000, committed: 220000, actual: 146000, risk: "watch", color: "#7d4b72" },
  { id: "post", name: "后期统筹组", budget: 240000, committed: 120000, actual: 86000, risk: "ok", color: "#7b658c" },
  { id: "finance", name: "财务审计组", budget: 115000, committed: 55000, actual: 38000, risk: "ok", color: "#66706a" },
];

const people: ResourcePerson[] = [
  { id: "p-producer", name: "林一凡", role: "Producer", department: "制片组", vendor: "个人 / 自由职业", grade: "A", trustScore: 92, dayRate: 3600, days: 36, total: 129600 },
  { id: "p-line-producer", name: "何越", role: "Line Producer", department: "制片组", vendor: "山海制片服务", grade: "A", trustScore: 90, dayRate: 3000, days: 34, total: 102000 },
  { id: "p-pm", name: "孟然", role: "Production Manager", department: "制片组", vendor: "山海制片服务", grade: "B", trustScore: 84, dayRate: 2200, days: 36, total: 79200 },
  { id: "p-director", name: "赵宁", role: "Director", department: "导演组", vendor: "个人 / 自由职业", grade: "A", trustScore: 93, dayRate: 5200, days: 24, total: 124800 },
  { id: "p-ad", name: "周岚", role: "1st AD", department: "导演组", vendor: "个人 / 自由职业", grade: "A", trustScore: 89, dayRate: 2600, days: 30, total: 78000 },
  { id: "p-script", name: "唐婧", role: "Script Supervisor", department: "编剧/场记组", vendor: "个人 / 自由职业", grade: "B", trustScore: 82, dayRate: 1400, days: 28, total: 39200 },
  { id: "p-actor-lead", name: "沈知夏", role: "Lead Actor", department: "演员/选角组", vendor: "星桥经纪", grade: "A", trustScore: 88, dayRate: 12000, days: 18, total: 216000 },
  { id: "p-actor-support", name: "Leo Tan", role: "Supporting Actor", department: "演员/选角组", vendor: "个人 / 自由职业", grade: "B", trustScore: 81, dayRate: 5200, days: 14, total: 72800 },
  { id: "p-casting", name: "陈茜", role: "Casting Director", department: "演员/选角组", vendor: "星桥经纪", grade: "B", trustScore: 86, dayRate: 2100, days: 18, total: 37800 },
  { id: "p-dp", name: "Marcus Chen", role: "Director of Photography", department: "摄影组", vendor: "Northlight Studio", grade: "A", trustScore: 95, dayRate: 6800, days: 24, total: 163200 },
  { id: "p-camera-op", name: "吴柏", role: "Camera Operator", department: "摄影组", vendor: "Northlight Studio", grade: "B", trustScore: 84, dayRate: 3200, days: 24, total: 76800 },
  { id: "p-ac1", name: "Evan Xu", role: "1st Assistant Camera", department: "摄影助理组", vendor: "个人 / 自由职业", grade: "B", trustScore: 83, dayRate: 1800, days: 24, total: 43200 },
  { id: "p-ac2", name: "宋雨", role: "2nd Assistant Camera", department: "摄影助理组", vendor: "个人 / 自由职业", grade: "C", trustScore: 76, dayRate: 1200, days: 24, total: 28800 },
  { id: "p-dit", name: "Ava Wong", role: "Digital Imaging Technician", department: "DIT组", vendor: "Ava DIT Lab", grade: "B", trustScore: 87, dayRate: 3400, days: 22, total: 74800 },
  { id: "p-data-wrangler", name: "梁译", role: "Data Wrangler", department: "DIT组", vendor: "Ava DIT Lab", grade: "C", trustScore: 79, dayRate: 1500, days: 22, total: 33000 },
  { id: "p-gaffer", name: "陈昊", role: "Gaffer", department: "灯光电工组", vendor: "Glow Rigging", grade: "B", trustScore: 84, dayRate: 3900, days: 24, total: 93600 },
  { id: "p-electrician", name: "韩立", role: "Lighting Technician", department: "灯光电工组", vendor: "Glow Rigging", grade: "C", trustScore: 74, dayRate: 1500, days: 24, total: 36000 },
  { id: "p-key-grip", name: "高峰", role: "Key Grip", department: "器械/Grip组", vendor: "GripWorks", grade: "B", trustScore: 82, dayRate: 2800, days: 20, total: 56000 },
  { id: "p-art", name: "许珂", role: "Art Director", department: "美术组", vendor: "K Studio", grade: "A", trustScore: 90, dayRate: 3800, days: 24, total: 91200 },
  { id: "p-costume", name: "叶青", role: "Costume Designer", department: "服化/造型组", vendor: "织影服装", grade: "B", trustScore: 85, dayRate: 2400, days: 20, total: 48000 },
  { id: "p-prop-master", name: "李策", role: "Property Master", department: "道具组", vendor: "旧仓道具", grade: "B", trustScore: 80, dayRate: 1900, days: 20, total: 38000 },
  { id: "p-sound", name: "梁森", role: "Sound Mixer", department: "现场录音组", vendor: "个人 / 自由职业", grade: "B", trustScore: 86, dayRate: 2600, days: 22, total: 57200 },
  { id: "p-location", name: "陆遥", role: "Location Manager", department: "场地管理组", vendor: "港湾外联", grade: "B", trustScore: 83, dayRate: 2100, days: 24, total: 50400 },
  { id: "p-hotel", name: "苏敏", role: "Accommodation Coordinator", department: "酒店住宿组", vendor: "Harbor Hotel Block", grade: "C", trustScore: 75, dayRate: 1400, days: 22, total: 30800 },
  { id: "p-transport", name: "高远", role: "Transportation Captain", department: "车辆运输组", vendor: "远行车辆服务", grade: "C", trustScore: 73, dayRate: 2300, days: 24, total: 55200 },
  { id: "p-catering", name: "Mina Zhao", role: "Craft Service Lead", department: "后勤餐饮组", vendor: "片场热餐", grade: "B", trustScore: 82, dayRate: 1600, days: 24, total: 38400 },
  { id: "p-stunt", name: "雷鹏", role: "Stunt Coordinator", department: "特技/安全组", vendor: "安全动作组", grade: "A", trustScore: 91, dayRate: 4200, days: 10, total: 42000 },
  { id: "p-vfx", name: "Nora Li", role: "VFX Supervisor", department: "调色/VFX组", vendor: "Pixel Harbor VFX", grade: "B", trustScore: 78, dayRate: 5000, days: 18, total: 90000 },
  { id: "p-editor", name: "Milo Grant", role: "Editor", department: "后期统筹组", vendor: "Milo Post", grade: "A", trustScore: 88, dayRate: 3600, days: 20, total: 72000 },
  { id: "p-accountant", name: "林会计", role: "Production Accountant", department: "财务审计组", vendor: "海川财务", grade: "A", trustScore: 94, dayRate: 2400, days: 24, total: 57600 },
];

const vendors: VendorSpend[] = [
  {
    id: "v-camera",
    name: "Northlight Camera Rental",
    category: "equipment",
    owner: "摄影组",
    amount: 238000,
    status: "contracted",
    progress: 72,
    auditFlag: "镜头包升级导致押金高于预算 8%",
  },
  {
    id: "v-dit",
    name: "Ava DIT Lab",
    category: "equipment",
    owner: "DIT组",
    amount: 78000,
    status: "contracted",
    progress: 76,
    auditFlag: "LUT、转码和双备份清单已齐，等待最终素材 checksum 归档",
  },
  {
    id: "v-light",
    name: "Glow Rigging & Generator",
    category: "equipment",
    owner: "灯光电工组",
    amount: 164000,
    status: "review",
    progress: 58,
    auditFlag: "夜戏发电车多占半天，需确认是否并入车辆科目",
  },
  {
    id: "v-grip",
    name: "GripWorks Rigging",
    category: "equipment",
    owner: "器械/Grip组",
    amount: 96000,
    status: "contracted",
    progress: 61,
    auditFlag: "吸盘车 rigging 与安全检查单需和车辆保险互相引用",
  },
  {
    id: "v-vehicle",
    name: "远行车辆服务",
    category: "vehicle",
    owner: "车辆运输组",
    amount: 176000,
    status: "contracted",
    progress: 66,
    auditFlag: "司机餐补和油费未拆开",
  },
  {
    id: "v-picture-car",
    name: "Picture Car Unit",
    category: "vehicle",
    owner: "车辆运输组",
    amount: 92000,
    status: "review",
    progress: 52,
    auditFlag: "跟拍车保险和安全员签字未随合同归档",
  },
  {
    id: "v-hotel",
    name: "Harbor Hotel Block",
    category: "hotel",
    owner: "酒店住宿组",
    amount: 172000,
    status: "quoted",
    progress: 42,
    auditFlag: "酒店住宿与场地使用同一合同，审计需拆分",
  },
  {
    id: "v-location",
    name: "旧码头外景地",
    category: "location",
    owner: "场地管理组",
    amount: 112000,
    status: "paid",
    progress: 100,
    auditFlag: "已付款，缺少物业清洁确认单",
  },
  {
    id: "v-stage",
    name: "海岸棚 Stage B",
    category: "location",
    owner: "场地管理组",
    amount: 86000,
    status: "contracted",
    progress: 68,
    auditFlag: "夜间加班条款需要和通告单日期对应",
  },
  {
    id: "v-catering",
    name: "片场热餐",
    category: "production",
    owner: "后勤餐饮组",
    amount: 68000,
    status: "contracted",
    progress: 64,
    auditFlag: "夜戏餐补和额外咖啡车费用需拆分",
  },
  {
    id: "v-vfx",
    name: "Pixel Harbor VFX",
    category: "vfx",
    owner: "调色/VFX组",
    amount: 214000,
    status: "review",
    progress: 48,
    auditFlag: "VFX 供应商版本已到 v003，付款关口需绑定 approved 状态",
  },
  {
    id: "v-post",
    name: "Milo Post Suite",
    category: "vfx",
    owner: "后期统筹组",
    amount: 92000,
    status: "contracted",
    progress: 57,
    auditFlag: "剪辑间和调色间按小时计费，需每日出勤单",
  },
];

const payments: PaymentMilestone[] = [
  {
    id: "pay-camera-deposit",
    vendorId: "v-camera",
    vendorName: "Northlight Camera Rental",
    label: "镜头包二期尾款",
    dueDate: "2026-06-18",
    amount: 68000,
    status: "ready",
    gate: "器材回执已齐，等待制片确认升级理由",
  },
  {
    id: "pay-dit-checksum",
    vendorId: "v-dit",
    vendorName: "Ava DIT Lab",
    label: "DIT 双备份与 checksum 归档款",
    dueDate: "2026-06-19",
    amount: 26000,
    status: "ready",
    gate: "等待 DIT 日报和素材盘编号确认",
  },
  {
    id: "pay-light-generator",
    vendorId: "v-light",
    vendorName: "Glow Rigging & Generator",
    label: "发电车追加费用",
    dueDate: "2026-06-20",
    amount: 42000,
    status: "blocked",
    gate: "需拆分灯光器材与车辆科目",
  },
  {
    id: "pay-picture-car",
    vendorId: "v-picture-car",
    vendorName: "Picture Car Unit",
    label: "跟拍车保险和安全员费用",
    dueDate: "2026-06-21",
    amount: 36000,
    status: "blocked",
    gate: "缺车辆保险、特技安全员签字和司机工时单",
  },
  {
    id: "pay-hotel-block",
    vendorId: "v-hotel",
    vendorName: "Harbor Hotel Block",
    label: "酒店团房定金",
    dueDate: "2026-06-22",
    amount: 76000,
    status: "scheduled",
    gate: "等住宿名单和夜戏天数最终确认",
  },
  {
    id: "pay-location-cleaning",
    vendorId: "v-location",
    vendorName: "旧码头外景地",
    label: "清洁押金返还",
    dueDate: "2026-06-24",
    amount: 18000,
    status: "blocked",
    gate: "缺物业清洁确认单",
  },
  {
    id: "pay-stage-night",
    vendorId: "v-stage",
    vendorName: "海岸棚 Stage B",
    label: "夜间加班棚租",
    dueDate: "2026-06-25",
    amount: 32000,
    status: "scheduled",
    gate: "需与 6 月 21-23 日通告单时间一致",
  },
  {
    id: "pay-catering-night",
    vendorId: "v-catering",
    vendorName: "片场热餐",
    label: "夜戏餐饮追加",
    dueDate: "2026-06-26",
    amount: 16000,
    status: "ready",
    gate: "餐饮人数和演员夜戏名单已确认",
  },
  {
    id: "pay-vfx-v003",
    vendorId: "v-vfx",
    vendorName: "Pixel Harbor VFX",
    label: "v003 审批节点款",
    dueDate: "2026-06-28",
    amount: 72000,
    status: "blocked",
    gate: "需绑定版本 Approved 状态和监制批注",
  },
  {
    id: "pay-post-suite",
    vendorId: "v-post",
    vendorName: "Milo Post Suite",
    label: "剪辑间周结",
    dueDate: "2026-06-30",
    amount: 28000,
    status: "scheduled",
    gate: "等待剪辑间出勤单和导演确认",
  },
];

const documents: AuditDocument[] = [
  {
    id: "doc-camera",
    owner: "Northlight Camera Rental",
    category: "器材",
    required: 6,
    received: 5,
    missing: ["镜头包升级说明"],
    severity: "watch",
  },
  {
    id: "doc-dit",
    owner: "Ava DIT Lab",
    category: "DIT",
    required: 6,
    received: 5,
    missing: ["素材盘 checksum 汇总"],
    severity: "watch",
  },
  {
    id: "doc-light",
    owner: "Glow Rigging & Generator",
    category: "灯光/发电车",
    required: 7,
    received: 4,
    missing: ["发电车工时单", "车辆科目拆分", "现场签收"],
    severity: "over",
  },
  {
    id: "doc-grip",
    owner: "GripWorks Rigging",
    category: "器械/安全",
    required: 5,
    received: 4,
    missing: ["吸盘车安全复核"],
    severity: "watch",
  },
  {
    id: "doc-vehicle",
    owner: "远行车辆服务",
    category: "车辆",
    required: 7,
    received: 5,
    missing: ["司机工时单", "油费明细"],
    severity: "watch",
  },
  {
    id: "doc-picture-car",
    owner: "Picture Car Unit",
    category: "车辆特拍",
    required: 8,
    received: 4,
    missing: ["车辆保险", "安全员签字", "改装检查", "司机工时单"],
    severity: "over",
  },
  {
    id: "doc-hotel",
    owner: "Harbor Hotel Block",
    category: "酒店住宿",
    required: 5,
    received: 3,
    missing: ["住宿名单", "退房损耗条款"],
    severity: "watch",
  },
  {
    id: "doc-location",
    owner: "旧码头外景地",
    category: "场地",
    required: 6,
    received: 5,
    missing: ["物业清洁确认单"],
    severity: "watch",
  },
  {
    id: "doc-stage",
    owner: "海岸棚 Stage B",
    category: "棚租",
    required: 5,
    received: 4,
    missing: ["夜间加班确认"],
    severity: "watch",
  },
  {
    id: "doc-catering",
    owner: "片场热餐",
    category: "后勤餐饮",
    required: 4,
    received: 4,
    missing: [],
    severity: "ok",
  },
  {
    id: "doc-vfx",
    owner: "Pixel Harbor VFX",
    category: "VFX",
    required: 8,
    received: 5,
    missing: ["v003 approved 截图", "付款节点确认", "交付清单"],
    severity: "over",
  },
  {
    id: "doc-post",
    owner: "Milo Post Suite",
    category: "后期",
    required: 5,
    received: 3,
    missing: ["剪辑间出勤单", "导演确认"],
    severity: "watch",
  },
];

const taskSelect = {
  id: true,
  name: true,
  status: true,
  timeLogged: true,
  estimatedCost: true,
  shot: {
    select: {
      id: true,
      code: true,
      status: true,
    },
  },
  asset: {
    select: {
      id: true,
      name: true,
      type: true,
      status: true,
    },
  },
  assignments: {
    select: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
          department: true,
          capacity: true,
          userGrade: {
            select: {
              grade: {
                select: {
                  code: true,
                },
              },
            },
          },
          scores: {
            select: {
              score: true,
              dimension: {
                select: {
                  maxScore: true,
                  weight: true,
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

const departmentColors = [
  "#157a6e",
  "#2867b2",
  "#b25f7c",
  "#c84c39",
  "#4f7f9b",
  "#c98a1c",
  "#6b5aa6",
  "#173f52",
  "#567d3f",
  "#7d4b72",
  "#7b658c",
  "#8f6f2a",
];

export async function getResourceBudgetData(projectId: string): Promise<ResourceBudgetData> {
  if (shouldUseDemoData()) {
    if (projectId !== "demo-mkali-mission") {
      return createEmptyResourceBudgetData(projectId);
    }
  } else {
    return getLiveResourceBudgetData(projectId);
  }

  const actualTotal = departments.reduce((sum, department) => sum + department.actual, 0) + vendors.reduce((sum, vendor) => sum + vendor.amount, 0);
  const committedTotal = departments.reduce((sum, department) => sum + department.committed, 0) + vendors.reduce((sum, vendor) => sum + vendor.amount, 0);
  const totalBudget = 5_200_000;

  return {
    project: {
      id: projectId,
      name: "Mkali's Mission",
      totalBudget,
      actualTotal,
      committedTotal,
    },
    departments,
    people,
    vendors,
    payments,
    documents,
    insights: buildInsights(totalBudget, actualTotal),
    fundFlow: buildFundFlow(totalBudget),
  };
}

export function buildResourceBudgetDataFromProject(project: ResourceProjectSnapshot): ResourceBudgetData {
  const departmentBuckets = new Map<string, DepartmentBucket>();
  const personBuckets = new Map<string, PersonBucket>();
  const vendorBuckets = new Map<string, VendorBucket>();

  for (const task of project.tasks) {
    const calculatedCost = getTaskActualCost(task);
    const budgetCost = getTaskBudgetCost(task);
    const taskDepartments = resolveTaskDepartments(task);
    const departmentShare = taskDepartments.length > 0 ? 1 / taskDepartments.length : 1;

    for (const departmentName of taskDepartments) {
      const bucket = getDepartmentBucket(departmentBuckets, departmentName);
      bucket.budget += budgetCost * departmentShare;
      bucket.actual += calculatedCost * departmentShare;
      bucket.committed += Math.max(budgetCost, calculatedCost) * departmentShare;
    }

    const assignedPeople = task.assignments.map((assignment) => assignment.user);
    const personShare = assignedPeople.length > 0 ? 1 / assignedPeople.length : 0;
    for (const user of assignedPeople) {
      const personBucket = personBuckets.get(user.id) ?? {
        user,
        department: user.department ?? resolveAssetDepartment(task.asset),
        days: 0,
        total: 0,
      };
      personBucket.days += task.timeLogged * personShare;
      personBucket.total += calculatedCost * personShare;
      personBuckets.set(user.id, personBucket);
    }

    const vendorMeta = resolveVendorMeta(task);
    const vendor = vendorBuckets.get(vendorMeta.id) ?? {
      ...vendorMeta,
      amount: 0,
      actual: 0,
      statuses: new Set<TaskStatus>(),
    };
    vendor.amount += budgetCost;
    vendor.actual += calculatedCost;
    vendor.statuses.add(task.status);
    vendorBuckets.set(vendor.id, vendor);
  }

  const departments = Array.from(departmentBuckets.values())
    .map((bucket) => ({
      id: bucket.id,
      name: bucket.name,
      budget: Math.round(bucket.budget),
      committed: Math.round(bucket.committed),
      actual: Math.round(bucket.actual),
      risk: resolveDepartmentRisk(bucket),
      color: bucket.color,
    }))
    .sort((a, b) => b.budget - a.budget);
  const people = Array.from(personBuckets.values())
    .map((bucket) => buildResourcePerson(bucket))
    .sort((a, b) => b.total - a.total);
  const vendors = Array.from(vendorBuckets.values())
    .map((bucket) => buildVendorSpend(bucket))
    .filter((vendor) => vendor.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  const payments = buildLivePayments(vendors);
  const documents = buildLiveDocuments(vendors, departments);
  const totalBudget = Math.round(departments.reduce((sum, department) => sum + department.budget, 0));
  const actualTotal = Math.round(departments.reduce((sum, department) => sum + department.actual, 0));
  const committedTotal = Math.round(departments.reduce((sum, department) => sum + department.committed, 0));

  return {
    project: {
      id: project.id,
      name: project.name,
      totalBudget,
      actualTotal,
      committedTotal,
    },
    departments,
    people,
    vendors,
    payments,
    documents,
    insights: buildResourceInsights({
      totalBudget,
      actualTotal,
      departments,
      vendors,
      payments,
      documents,
    }),
    fundFlow: buildLiveFundFlow({
      totalBudget,
      departments,
      vendors,
    }),
  };
}

async function getLiveResourceBudgetData(projectId: string): Promise<ResourceBudgetData> {
  const prisma = getPrisma();
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      assets: {
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
        },
      },
      shots: {
        select: {
          tasks: {
            select: taskSelect,
          },
        },
      },
    },
  });

  if (!project) {
    return createEmptyResourceBudgetData(projectId);
  }

  const assetTasks = await prisma.task.findMany({
    where: { asset: { projectId } },
    select: taskSelect,
  });
  const tasks = dedupeTasksById([...project.shots.flatMap((shot) => shot.tasks), ...assetTasks]);

  return buildResourceBudgetDataFromProject({
    id: project.id,
    name: project.name,
    assets: project.assets,
    tasks,
  });
}

function createEmptyResourceBudgetData(projectId: string): ResourceBudgetData {
  return {
    project: {
      id: projectId,
      name: "Current project",
      totalBudget: 0,
      actualTotal: 0,
      committedTotal: 0,
    },
    departments: [],
    people: [],
    vendors: [],
    payments: [],
    documents: [],
    insights: [],
    fundFlow: [],
  };
}

function buildInsights(totalBudget: number, actualTotal: number): ResourceInsight[] {
  const overDepartments = departments.filter((department) => department.risk === "over");
  const watchVendors = vendors.filter((vendor) => vendor.status === "review");
  const blockedPaymentTotal = payments.filter((payment) => payment.status === "blocked").reduce((sum, payment) => sum + payment.amount, 0);
  const missingDocumentTotal = documents.reduce((sum, document) => sum + Math.max(0, document.required - document.received), 0);

  return [
    {
      id: "budget-rate",
      title: "预算消耗偏快",
      detail: `已记录支出占总预算 ${Math.round((actualTotal / totalBudget) * 100)}%，摄影、车辆、VFX 是主要压力点。`,
      severity: actualTotal / totalBudget > 0.55 ? "watch" : "ok",
      amount: actualTotal,
    },
    {
      id: "over-department",
      title: "超预算部门",
      detail: overDepartments.map((department) => department.name).join("、") || "暂无超预算部门。",
      severity: overDepartments.length ? "over" : "ok",
    },
    {
      id: "review-vendors",
      title: "供应商付款关口",
      detail: `${watchVendors.length} 个供应商需要在付款前补齐版本审批或合同拆分。`,
      severity: watchVendors.length ? "watch" : "ok",
    },
    {
      id: "blocked-payments",
      title: "应暂缓付款",
      detail: `${money(blockedPaymentTotal)} 付款被材料、科目或版本审批卡住。`,
      severity: blockedPaymentTotal > 0 ? "over" : "ok",
      amount: blockedPaymentTotal,
    },
    {
      id: "missing-documents",
      title: "审计材料缺口",
      detail: `仍缺 ${missingDocumentTotal} 份关键材料，集中在灯光/发电车、酒店住宿和 VFX。`,
      severity: missingDocumentTotal > 5 ? "over" : "watch",
    },
  ];
}

function buildFundFlow(totalBudget: number): FundFlowLink[] {
  const categoryTotals = vendors.reduce<Record<string, number>>((current, vendor) => {
    current[vendor.category] = (current[vendor.category] ?? 0) + vendor.amount;
    return current;
  }, {});

  return [
    ...departments.map((department) => ({
      from: "总预算",
      to: department.name,
      amount: department.budget,
    })),
    ...Object.entries(categoryTotals).map(([category, amount]) => ({
      from: "供应商",
      to: categoryLabel(category),
      amount,
    })),
    { from: "总预算", to: "未分配/预备金", amount: Math.max(0, totalBudget - departments.reduce((sum, department) => sum + department.budget, 0)) },
  ];
}

function buildResourceInsights(input: {
  totalBudget: number;
  actualTotal: number;
  departments: BudgetDepartment[];
  vendors: VendorSpend[];
  payments: PaymentMilestone[];
  documents: AuditDocument[];
}): ResourceInsight[] {
  const overDepartments = input.departments.filter((department) => department.risk === "over");
  const watchVendors = input.vendors.filter((vendor) => vendor.status === "review");
  const blockedPaymentTotal = input.payments.filter((payment) => payment.status === "blocked").reduce((sum, payment) => sum + payment.amount, 0);
  const missingDocumentTotal = input.documents.reduce((sum, document) => sum + Math.max(0, document.required - document.received), 0);
  const budgetRate = input.totalBudget > 0 ? input.actualTotal / input.totalBudget : 0;

  return [
    {
      id: "budget-rate",
      title: budgetRate > 0.6 ? "预算消耗偏快" : "预算消耗可控",
      detail:
        input.totalBudget > 0
          ? `已记录支出占总预算 ${Math.round(budgetRate * 100)}%，重点观察 ${overDepartments.map((department) => department.name).join("、") || "高额部门"}。`
          : "当前项目还没有可汇总的任务成本，资源预算会随着任务、人员和资产录入自动生成。",
      severity: budgetRate > 0.75 ? "over" : budgetRate > 0.55 ? "watch" : "ok",
      amount: input.actualTotal,
    },
    {
      id: "over-department",
      title: "超预算部门",
      detail: overDepartments.map((department) => department.name).join("、") || "暂无超预算部门。",
      severity: overDepartments.length ? "over" : "ok",
    },
    {
      id: "review-vendors",
      title: "供应商付款关口",
      detail: `${watchVendors.length} 个供应商需要在付款前补齐审查、合同或交付材料。`,
      severity: watchVendors.length ? "watch" : "ok",
    },
    {
      id: "blocked-payments",
      title: "应暂缓付款",
      detail: `${money(blockedPaymentTotal)} 付款被材料、科目或版本审批卡住。`,
      severity: blockedPaymentTotal > 0 ? "over" : "ok",
      amount: blockedPaymentTotal,
    },
    {
      id: "missing-documents",
      title: "审计材料缺口",
      detail: `仍缺 ${missingDocumentTotal} 份关键材料，优先补齐待复核供应商和超预算部门。`,
      severity: missingDocumentTotal > 5 ? "over" : missingDocumentTotal > 0 ? "watch" : "ok",
    },
  ];
}

function buildLiveFundFlow(input: {
  totalBudget: number;
  departments: BudgetDepartment[];
  vendors: VendorSpend[];
}): FundFlowLink[] {
  const reserve = input.totalBudget - input.departments.reduce((sum, department) => sum + department.budget, 0);
  return [
    ...input.departments.map((department) => ({
      from: "总预算",
      to: department.name,
      amount: department.budget,
    })),
    ...input.vendors.map((vendor) => ({
      from: vendor.owner,
      to: categoryFlowLabel(vendor.category),
      amount: vendor.amount,
    })),
    ...input.vendors.map((vendor) => ({
      from: categoryFlowLabel(vendor.category),
      to: vendor.name,
      amount: vendor.amount,
    })),
    ...(reserve > 0 ? [{ from: "总预算", to: "未分配/预备金", amount: reserve }] : []),
  ];
}

function buildLivePayments(vendors: VendorSpend[]): PaymentMilestone[] {
  const today = new Date();
  return vendors.slice(0, 8).map((vendor, index) => {
    const isBlocked = vendor.status === "review" || vendor.auditFlag.includes("需");
    return {
      id: `pay-${vendor.id}`,
      vendorId: vendor.id,
      vendorName: vendor.name,
      label: `${categoryLabel(vendor.category)}阶段款`,
      dueDate: addDaysIso(today, 2 + index * 2),
      amount: Math.round(vendor.amount * (isBlocked ? 0.35 : 0.45)),
      status: isBlocked ? "blocked" : vendor.status === "paid" ? "paid" : vendor.status === "contracted" ? "scheduled" : "ready",
      gate: isBlocked ? `${vendor.auditFlag}，付款前需要制片/监制确认。` : "预算、任务和供应商状态已对齐，可进入付款排期。",
    };
  });
}

function buildLiveDocuments(vendors: VendorSpend[], departments: BudgetDepartment[]): AuditDocument[] {
  const vendorDocuments: AuditDocument[] = vendors.slice(0, 8).map((vendor) => {
    const required = vendor.status === "review" ? 6 : 4;
    const received = vendor.status === "paid" ? required : vendor.status === "contracted" ? Math.max(2, required - 1) : vendor.status === "review" ? Math.max(1, required - 3) : 2;
    return {
      id: `doc-${vendor.id}`,
      owner: vendor.name,
      category: categoryLabel(vendor.category),
      required,
      received,
      missing: buildMissingDocuments(vendor),
      severity: received === required ? "ok" : received <= required - 3 ? "over" : "watch",
    };
  });

  const departmentDocuments: AuditDocument[] = departments
    .filter((department) => department.risk !== "ok")
    .slice(0, 4)
    .map((department) => ({
      id: `doc-department-${department.id}`,
      owner: department.name,
      category: "部门预算",
      required: 3,
      received: department.risk === "over" ? 1 : 2,
      missing: department.risk === "over" ? ["超预算说明", "追加审批"] : ["预算复核"],
      severity: department.risk,
    }));

  return [...vendorDocuments, ...departmentDocuments];
}

function buildMissingDocuments(vendor: VendorSpend) {
  if (vendor.status === "paid") return [];
  const base = ["合同/报价单", "发票或收据"];
  if (vendor.status === "review") {
    return [...base, vendor.category === "vfx" ? "版本 approved 截图" : "现场签收/交付确认"];
  }
  if (vendor.status === "contracted") return ["发票或收据"];
  return base;
}

function buildVendorSpend(bucket: VendorBucket): VendorSpend {
  const progress = resolveProgress(bucket.statuses);
  const status = resolveVendorStatus(bucket.statuses);
  return {
    id: bucket.id,
    name: bucket.name,
    category: bucket.category,
    owner: bucket.owner,
    amount: Math.round(bucket.amount),
    status,
    progress,
    auditFlag: buildAuditFlag({
      category: bucket.category,
      status,
      amount: bucket.amount,
      actual: bucket.actual,
    }),
  };
}

function buildResourcePerson(bucket: PersonBucket): ResourcePerson {
  const trustScore = resolveTrustScore(bucket.user);
  const days = roundOne(bucket.days);
  return {
    id: bucket.user.id,
    name: bucket.user.name,
    role: roleLabel(bucket.user.role),
    department: bucket.department,
    vendor: "个人 / 项目人员",
    grade: normalizeGrade(bucket.user.userGrade?.grade.code) ?? gradeFromTrustScore(trustScore),
    trustScore,
    dayRate: days > 0 ? Math.round(bucket.total / days) : 0,
    days,
    total: Math.round(bucket.total),
  };
}

function getTaskActualCost(task: ResourceProjectTask) {
  return Math.round(task.timeLogged * TASK_COST_PER_DAY);
}

function getTaskBudgetCost(task: ResourceProjectTask) {
  return Math.round(task.estimatedCost ?? getTaskActualCost(task));
}

function getDepartmentBucket(buckets: Map<string, DepartmentBucket>, departmentName: string) {
  const id = slugify(departmentName);
  const existing = buckets.get(id);
  if (existing) return existing;
  const bucket = {
    id,
    name: departmentName,
    budget: 0,
    actual: 0,
    committed: 0,
    color: departmentColors[buckets.size % departmentColors.length] ?? "#7b658c",
  };
  buckets.set(id, bucket);
  return bucket;
}

function resolveTaskDepartments(task: ResourceProjectTask) {
  const departments = task.assignments.map((assignment) => assignment.user.department).filter((department): department is string => Boolean(department));
  if (departments.length > 0) return Array.from(new Set(departments));
  return [resolveAssetDepartment(task.asset)];
}

function resolveAssetDepartment(asset: ResourceProjectAsset | null) {
  if (!asset) return "未分组";
  const labels: Record<AssetType, string> = {
    CHARACTER: "演员/角色组",
    ENVIRONMENT: "场地/置景组",
    PROP: "道具/器材组",
    FX: "VFX组",
    VEHICLE: "车辆组",
    RIG: "摄影/器械组",
  };
  return labels[asset.type] ?? "未分组";
}

function resolveVendorMeta(task: ResourceProjectTask) {
  const asset = task.asset;
  const category = resolveVendorCategory(asset);
  const owner = task.assignments[0]?.user.department ?? resolveAssetDepartment(asset);
  return {
    id: `${category}-${slugify(owner)}`,
    name: `${owner}${categoryFlowLabel(category)}`,
    category,
    owner,
  };
}

function resolveVendorCategory(asset: ResourceProjectAsset | null): VendorSpend["category"] {
  if (!asset) return "production";
  const categories: Record<AssetType, VendorSpend["category"]> = {
    CHARACTER: "production",
    ENVIRONMENT: "location",
    PROP: "equipment",
    FX: "vfx",
    VEHICLE: "vehicle",
    RIG: "equipment",
  };
  return categories[asset.type] ?? "production";
}

function resolveDepartmentRisk(bucket: DepartmentBucket): BudgetDepartment["risk"] {
  if (bucket.budget <= 0) return "ok";
  const rate = bucket.actual / bucket.budget;
  if (rate > 1) return "over";
  if (rate > 0.72 || bucket.committed > bucket.budget * 1.05) return "watch";
  return "ok";
}

function resolveVendorStatus(statuses: Set<TaskStatus>): VendorSpend["status"] {
  if (statuses.has("PENDING_REVIEW") || statuses.has("ON_HOLD")) return "review";
  if (statuses.has("FINAL") || statuses.has("APPROVED")) return "paid";
  if (statuses.has("IN_PROGRESS") || statuses.has("READY_TO_START")) return "contracted";
  return "quoted";
}

function resolveProgress(statuses: Set<TaskStatus>) {
  const weights: Record<TaskStatus, number> = {
    WAITING_TO_START: 8,
    READY_TO_START: 18,
    IN_PROGRESS: 52,
    PENDING_REVIEW: 72,
    APPROVED: 88,
    FINAL: 100,
    ON_HOLD: 35,
    OMIT: 0,
  };
  if (statuses.size === 0) return 0;
  return Math.round(Array.from(statuses).reduce((sum, status) => sum + (weights[status] ?? 0), 0) / statuses.size);
}

function buildAuditFlag(input: {
  category: VendorSpend["category"];
  status: VendorSpend["status"];
  amount: number;
  actual: number;
}) {
  if (input.status === "review") {
    return `${categoryLabel(input.category)}处于待复核状态，需补齐交付确认和付款依据`;
  }
  if (input.amount > 0 && input.actual > input.amount) {
    return `实际消耗高于预算 ${Math.round((input.actual / input.amount - 1) * 100)}%，需追加审批`;
  }
  if (input.status === "quoted") {
    return "仅有报价或预估，签约前需确认税费、押金和取消条款";
  }
  return "合同、任务进度和预算口径基本一致";
}

function resolveTrustScore(user: ResourceProjectUser) {
  if (user.scores.length > 0) {
    const totalWeight = user.scores.reduce((sum, score) => sum + score.dimension.weight, 0);
    if (totalWeight > 0) {
      const weighted = user.scores.reduce((sum, score) => sum + (score.score / Math.max(1, score.dimension.maxScore)) * 100 * score.dimension.weight, 0);
      return Math.round(weighted / totalWeight);
    }
  }

  const fallback: Record<Role, number> = {
    ADMIN: 92,
    PRODUCER: 88,
    SUPERVISOR: 82,
    REVIEWER: 78,
    ARTIST: 75,
  };
  return fallback[user.role] ?? 75;
}

function roleLabel(role: Role) {
  const labels: Record<Role, string> = {
    ADMIN: "Admin",
    PRODUCER: "Producer",
    SUPERVISOR: "Supervisor",
    ARTIST: "Artist",
    REVIEWER: "Reviewer",
  };
  return labels[role] ?? String(role);
}

function normalizeGrade(code: string | null | undefined) {
  if (code === "A" || code === "B" || code === "C" || code === "D" || code === "E" || code === "F" || code === "G") return code;
  return null;
}

function gradeFromTrustScore(score: number) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  if (score >= 50) return "E";
  if (score >= 30) return "F";
  return "G";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function addDaysIso(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function dedupeTasksById(tasks: ResourceProjectTask[]) {
  return Array.from(new Map(tasks.map((task) => [task.id, task])).values());
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function categoryLabel(category: string) {
  const labels: Record<string, string> = {
    equipment: "器材公司",
    vehicle: "车辆",
    hotel: "酒店住宿",
    location: "场地",
    vfx: "VFX供应商",
    production: "制片杂项",
  };

  return labels[category] ?? category;
}

function categoryFlowLabel(category: string) {
  const labels: Record<string, string> = {
    equipment: "器材供应商",
    vehicle: "车辆供应商",
    hotel: "酒店住宿",
    location: "场地供应商",
    vfx: "VFX供应商",
    production: "制片供应商",
  };

  return labels[category] ?? `${category}供应商`;
}
