import type { FieldDefinition } from "@/lib/field-types";
import { applyFormulaFields } from "@/lib/formula";

export type IndustryTemplate = {
  id: string;
  industry: "vfx" | "retail" | "manufacturing" | "hr" | "generic";
  name: string;
  description: string;
  icon: string;
  color: string;
  fields: FieldDefinition[];
  records: CustomRecord[];
};

export type CustomRecord = {
  id: string;
  data: Record<string, unknown>;
  createdAt: string;
  createdBy: string;
};

const statusColors = {
  draft: "#8f8a7e",
  pending: "#ef9f27",
  approved: "#1d9e75",
  changes: "#e24b4a",
  active: "#4a9eff",
  closed: "#7f77dd",
};

export const industryTemplates: IndustryTemplate[] = [
  {
    id: "retail-purchase-order",
    industry: "retail",
    name: "采购单",
    description: "供应商、金额、交付日期和审批状态，用于测试 Excel 导入与 AI 发票识别。",
    icon: "receipt",
    color: "#4a9eff",
    fields: [
      textField("po_number", "采购单号", 0, true, { config: { prefix: "PO-", padding: 4 } }),
      textField("supplier", "供应商", 1, true),
      dateField("order_date", "下单日期", 2),
      dateField("expected_date", "预计到货", 3),
      currencyField("unit_cost", "单价", 4),
      numberField("quantity", "数量", 5, { unit: "件" }),
      formulaField("total_amount", "合计金额", 6, "{unit_cost} * {quantity}"),
      statusField("status", "状态", 7, ["draft", "pending", "approved", "closed"]),
      scoreField("vendor_score", "供应商评分", 8),
    ],
    records: withFormulas([
      record("po-1", "林一凡", { po_number: "PO-0007", supplier: "青石器材租赁", order_date: "2026-05-12", expected_date: "2026-05-18", unit_cost: 1280, quantity: 6, status: "approved", vendor_score: 86 }),
      record("po-2", "Milo Grant", { po_number: "PO-0008", supplier: "南湾车辆公司", order_date: "2026-05-16", expected_date: "2026-05-20", unit_cost: 900, quantity: 4, status: "pending", vendor_score: 73 }),
    ]),
  },
  {
    id: "retail-inventory",
    industry: "retail",
    name: "库存管理",
    description: "商品 SKU、库存、仓库、补货线和库存金额。",
    icon: "package",
    color: "#1d9e75",
    fields: [
      textField("sku", "SKU", 0, true),
      textField("product_name", "商品名称", 1, true),
      selectField("category", "分类", 2, ["设备", "耗材", "服装", "道具"]),
      numberField("quantity", "库存数量", 3, { unit: "件" }),
      currencyField("unit_cost", "单位成本", 4),
      formulaField("inventory_value", "库存金额", 5, "{quantity} * {unit_cost}"),
      selectField("location", "仓库", 6, ["A库", "B库", "外景车"]),
      numberField("reorder_point", "补货线", 7, { unit: "件" }),
    ],
    records: withFormulas([
      record("sku-1", "Admin User", { sku: "EQ-RED-01", product_name: "RED Komodo 机身", category: "设备", quantity: 3, unit_cost: 42000, location: "A库", reorder_point: 1 }),
      record("sku-2", "Admin User", { sku: "PROP-RAIN-12", product_name: "雨戏防水耗材", category: "耗材", quantity: 48, unit_cost: 95, location: "外景车", reorder_point: 20 }),
    ]),
  },
  {
    id: "manufacturing-workorder",
    industry: "manufacturing",
    name: "工单管理",
    description: "制造、后期或供应商任务都可以用工单方式追踪。",
    icon: "tools",
    color: "#d8b46a",
    fields: [
      textField("work_order_id", "工单编号", 0, true),
      textField("product", "产出物", 1, true),
      numberField("quantity", "数量", 2),
      dateField("start_date", "开始日期", 3),
      dateField("due_date", "截止日期", 4),
      selectField("assigned_line", "执行组", 5, ["DIT组", "调色/VFX组", "摄影组", "后期统筹组"]),
      statusField("status", "状态", 6, ["pending", "active", "changes", "closed"]),
      scoreField("quality_score", "质量评分", 7),
      percentageField("defect_rate", "返工率", 8),
    ],
    records: withFormulas([
      record("wo-1", "Nora Li", { work_order_id: "WO-109", product: "VFX_0300 雨雾延展", quantity: 1, start_date: "2026-06-01", due_date: "2026-06-08", assigned_line: "调色/VFX组", status: "changes", quality_score: 78, defect_rate: 12 }),
      record("wo-2", "陈昊", { work_order_id: "WO-110", product: "夜戏灯光预演", quantity: 3, start_date: "2026-05-14", due_date: "2026-05-16", assigned_line: "灯光电工组", status: "closed", quality_score: 88, defect_rate: 4 }),
    ]),
  },
  {
    id: "generic-crm-contact",
    industry: "generic",
    name: "CRM 联系人",
    description: "联系人、公司、来源、跟进日期和合作状态。",
    icon: "address-book",
    color: "#7f77dd",
    fields: [
      textField("name", "姓名", 0, true),
      textField("company", "公司", 1),
      textField("title", "职位", 2),
      { ...textField("email", "邮箱", 3), type: "email" },
      { ...textField("phone", "电话", 4), type: "phone" },
      selectField("source", "来源", 5, ["朋友介绍", "LinkedIn", "供应商", "活动"]),
      statusField("status", "状态", 6, ["pending", "active", "closed"]),
      dateField("last_contact_date", "最近联系", 7),
    ],
    records: withFormulas([
      record("crm-1", "林一凡", { name: "Iris Wang", company: "CineCloud Studio", title: "Producer", email: "iris@example.com", phone: "+65 8888 1000", source: "LinkedIn", status: "active", last_contact_date: "2026-06-12" }),
      record("crm-2", "Admin User", { name: "Kyle Jones", company: "Northlight Post", title: "Supervisor", email: "kyle@example.com", phone: "+1 415 000 8822", source: "朋友介绍", status: "pending", last_contact_date: "2026-06-15" }),
    ]),
  },
  {
    id: "vfx-shot-tracker",
    industry: "vfx",
    name: "镜头追踪",
    description: "把原来的 VFX 流水线抽象成通用字段模板。",
    icon: "movie",
    color: "#ef9f27",
    fields: [
      textField("shot_code", "镜头号", 0, true),
      textField("sequence", "序列", 1),
      statusField("status", "总状态", 2, ["pending", "active", "approved", "changes", "closed"]),
      selectField("assigned_to", "负责人", 3, ["Nora Li", "Milo Grant", "陈昊", "Marcus Chen"]),
      dateField("due_date", "截止日期", 4),
      statusField("lay_status", "LAY", 5, ["pending", "approved", "changes", "closed"]),
      statusField("anm_status", "ANM", 6, ["pending", "approved", "changes", "closed"]),
      statusField("cmp_status", "CMP", 7, ["pending", "approved", "changes", "closed"]),
      scoreField("risk_score", "风险评分", 8),
    ],
    records: withFormulas([
      record("shot-custom-1", "Milo Grant", { shot_code: "RAID_0010", sequence: "RAID", status: "approved", assigned_to: "Milo Grant", due_date: "2026-05-18", lay_status: "closed", anm_status: "closed", cmp_status: "approved", risk_score: 24 }),
      record("shot-custom-2", "Nora Li", { shot_code: "VFX_0300", sequence: "VFX", status: "changes", assigned_to: "Nora Li", due_date: "2026-06-10", lay_status: "approved", anm_status: "approved", cmp_status: "changes", risk_score: 71 }),
    ]),
  },
];

export function getIndustryTemplates() {
  return industryTemplates.map(applyTemplateFormulas);
}

export function getDefaultIndustryTemplate() {
  return getIndustryTemplates()[0];
}

function withFormulas(records: CustomRecord[]) {
  return records;
}

function applyTemplateFormulas(template: IndustryTemplate): IndustryTemplate {
  return {
    ...template,
    records: template.records.map((item) => ({
      ...item,
      data: applyFormulaFields(item.data, template.fields),
    })),
  };
}

function record(id: string, createdBy: string, data: Record<string, unknown>): CustomRecord {
  return {
    id,
    data,
    createdBy,
    createdAt: "2026-06-18T00:00:00.000Z",
  };
}

function textField(key: string, name: string, order: number, required = false, overrides: Partial<FieldDefinition> = {}): FieldDefinition {
  return {
    id: key,
    key,
    name,
    type: "text",
    required,
    order,
    width: 180,
    ...overrides,
  };
}

function numberField(key: string, name: string, order: number, config?: FieldDefinition["config"]): FieldDefinition {
  return { ...textField(key, name, order), type: "number", width: 120, config };
}

function currencyField(key: string, name: string, order: number): FieldDefinition {
  return { ...textField(key, name, order), type: "currency", width: 140, config: { currency: "CNY", precision: 2 } };
}

function percentageField(key: string, name: string, order: number): FieldDefinition {
  return { ...textField(key, name, order), type: "percentage", width: 120, config: { min: 0, max: 100, precision: 1 } };
}

function dateField(key: string, name: string, order: number): FieldDefinition {
  return { ...textField(key, name, order), type: "date", width: 140 };
}

function scoreField(key: string, name: string, order: number): FieldDefinition {
  return { ...textField(key, name, order), type: "score", width: 120, config: { scoreMin: 0, scoreMax: 100, scoreStep: 1 } };
}

function selectField(key: string, name: string, order: number, options: string[]): FieldDefinition {
  return { ...textField(key, name, order), type: "select", options: options.map((value) => ({ value, label: value })) };
}

function statusField(key: string, name: string, order: number, options: string[]): FieldDefinition {
  return {
    ...selectField(key, name, order, options),
    type: "status",
    config: { statusColors },
  };
}

function formulaField(key: string, name: string, order: number, expression: string): FieldDefinition {
  return {
    ...textField(key, name, order),
    type: "formula",
    readOnly: true,
    config: { expression, precision: 2 },
  };
}
