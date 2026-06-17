import { shouldUseDemoData } from "@/lib/demo-data";

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
  insights: ResourceInsight[];
  fundFlow: FundFlowLink[];
};

const departments: BudgetDepartment[] = [
  { id: "production", name: "制片组", budget: 226000, committed: 196000, actual: 178000, risk: "watch", color: "#157a6e" },
  { id: "directing", name: "导演组", budget: 156000, committed: 112000, actual: 98000, risk: "ok", color: "#2867b2" },
  { id: "cast", name: "演员选角组", budget: 140000, committed: 126000, actual: 108000, risk: "watch", color: "#b25f7c" },
  { id: "camera", name: "摄影组", budget: 238000, committed: 242000, actual: 218000, risk: "over", color: "#c84c39" },
  { id: "dit", name: "DIT组", budget: 72000, committed: 64000, actual: 52000, risk: "ok", color: "#4f7f9b" },
  { id: "lighting", name: "灯光电工组", budget: 164000, committed: 174000, actual: 142000, risk: "watch", color: "#c98a1c" },
  { id: "art", name: "美术组", budget: 160000, committed: 138000, actual: 116000, risk: "ok", color: "#6b5aa6" },
  { id: "sound", name: "现场录音组", budget: 84000, committed: 58000, actual: 46000, risk: "ok", color: "#173f52" },
  { id: "location", name: "场地运输组", budget: 108000, committed: 132000, actual: 96000, risk: "over", color: "#567d3f" },
  { id: "vfx", name: "调色/VFX组", budget: 98000, committed: 122000, actual: 76000, risk: "over", color: "#7d4b72" },
  { id: "post", name: "后期统筹组", budget: 62000, committed: 44000, actual: 38000, risk: "ok", color: "#7b658c" },
];

const people: ResourcePerson[] = [
  { id: "p-producer", name: "林一凡", role: "Line Producer", department: "制片组", vendor: "个人 / 自由职业", grade: "A", trustScore: 92, dayRate: 2800, days: 28, total: 78400 },
  { id: "p-ad", name: "周岚", role: "1st AD", department: "导演组", vendor: "个人 / 自由职业", grade: "A", trustScore: 89, dayRate: 2400, days: 24, total: 57600 },
  { id: "p-dp", name: "Marcus Chen", role: "Director of Photography", department: "摄影组", vendor: "Northlight Studio", grade: "A", trustScore: 95, dayRate: 6200, days: 18, total: 111600 },
  { id: "p-dit", name: "Ava Wong", role: "Digital Imaging Technician", department: "DIT组", vendor: "Ava DIT Lab", grade: "B", trustScore: 87, dayRate: 3200, days: 16, total: 51200 },
  { id: "p-gaffer", name: "陈昊", role: "Gaffer", department: "灯光电工组", vendor: "Glow Rigging", grade: "B", trustScore: 84, dayRate: 3800, days: 18, total: 68400 },
  { id: "p-art", name: "许珂", role: "Art Director", department: "美术组", vendor: "K Studio", grade: "A", trustScore: 90, dayRate: 3600, days: 18, total: 64800 },
  { id: "p-vfx", name: "Nora Li", role: "VFX Supervisor", department: "调色/VFX组", vendor: "Pixel Harbor VFX", grade: "B", trustScore: 78, dayRate: 4800, days: 14, total: 67200 },
  { id: "p-transport", name: "高远", role: "Transportation Captain", department: "场地运输组", vendor: "远行车辆服务", grade: "C", trustScore: 73, dayRate: 2200, days: 20, total: 44000 },
];

const vendors: VendorSpend[] = [
  {
    id: "v-camera",
    name: "Northlight Camera Rental",
    category: "equipment",
    owner: "摄影组",
    amount: 126000,
    status: "contracted",
    progress: 72,
    auditFlag: "镜头包升级导致押金高于预算 8%",
  },
  {
    id: "v-light",
    name: "Glow Rigging & Generator",
    category: "equipment",
    owner: "灯光电工组",
    amount: 98000,
    status: "review",
    progress: 58,
    auditFlag: "夜戏发电车多占半天，需确认是否并入车辆科目",
  },
  {
    id: "v-vehicle",
    name: "远行车辆服务",
    category: "vehicle",
    owner: "场地运输组",
    amount: 84000,
    status: "contracted",
    progress: 66,
    auditFlag: "司机餐补和油费未拆开",
  },
  {
    id: "v-hotel",
    name: "Harbor Hotel Block",
    category: "hotel",
    owner: "制片组",
    amount: 118000,
    status: "quoted",
    progress: 42,
    auditFlag: "酒店住宿与场地使用同一合同，审计需拆分",
  },
  {
    id: "v-location",
    name: "旧码头外景地",
    category: "location",
    owner: "场地运输组",
    amount: 76000,
    status: "paid",
    progress: 100,
    auditFlag: "已付款，缺少物业清洁确认单",
  },
  {
    id: "v-vfx",
    name: "Pixel Harbor VFX",
    category: "vfx",
    owner: "调色/VFX组",
    amount: 136000,
    status: "review",
    progress: 48,
    auditFlag: "VFX 供应商版本已到 v003，付款关口需绑定 approved 状态",
  },
];

export async function getResourceBudgetData(projectId: string): Promise<ResourceBudgetData> {
  if (!shouldUseDemoData() || projectId !== "demo-mkali-mission") {
    return createEmptyResourceBudgetData(projectId);
  }

  const actualTotal = departments.reduce((sum, department) => sum + department.actual, 0) + vendors.reduce((sum, vendor) => sum + vendor.amount, 0);
  const committedTotal = departments.reduce((sum, department) => sum + department.committed, 0) + vendors.reduce((sum, vendor) => sum + vendor.amount, 0);
  const totalBudget = 2_220_000;

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
    insights: buildInsights(totalBudget, actualTotal),
    fundFlow: buildFundFlow(totalBudget),
  };
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
    insights: [],
    fundFlow: [],
  };
}

function buildInsights(totalBudget: number, actualTotal: number): ResourceInsight[] {
  const overDepartments = departments.filter((department) => department.risk === "over");
  const watchVendors = vendors.filter((vendor) => vendor.status === "review");

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
  ];
}

function buildFundFlow(totalBudget: number): FundFlowLink[] {
  const categoryTotals = vendors.reduce<Record<string, number>>((current, vendor) => {
    current[vendor.category] = (current[vendor.category] ?? 0) + vendor.amount;
    return current;
  }, {});

  return [
    ...departments.slice(0, 7).map((department) => ({
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
