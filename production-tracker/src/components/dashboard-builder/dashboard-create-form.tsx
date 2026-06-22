"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { chartNeedsGroupBy, getGroupFields, getNumericFields } from "@/components/dashboard-builder/widget-options";
import type { ApiResponse } from "@/lib/api-response";
import type { EntityTypeItem } from "@/lib/custom-data-store";
import type { DashboardItem, WidgetConfig, WidgetType } from "@/lib/dashboard-builder";

type TemplateId = "producer_cost" | "vendor_audit" | "blank";
type CreateStatus = "idle" | "saving" | "error";
type WidgetSeed = {
  title: string;
  type: WidgetType;
  entity: "purchase" | "inventory" | "any";
  groupKeys: string[];
  valueKeys: string[];
  aggregation: NonNullable<WidgetConfig["dataSource"]["aggregation"]>["fn"];
  layout: WidgetConfig["layout"];
};

const templates: Array<{ id: TemplateId; name: string; description: string; widgets: number }> = [
  { id: "producer_cost", name: "制片成本驾驶舱", description: "采购金额、供应商排行、库存占比和预算进度，适合给监制看每日成本。", widgets: 4 },
  { id: "vendor_audit", name: "供应商审计看板", description: "供应商支出、付款进度、库存漏斗和明细表，适合复核付款与材料。", widgets: 4 },
  { id: "blank", name: "空白画布", description: "只创建仪表盘，不自动添加 Widget，适合完全自定义。", widgets: 0 },
];

const templateSeeds: Record<Exclude<TemplateId, "blank">, WidgetSeed[]> = {
  producer_cost: [
    { title: "采购金额合计", type: "metric_card", entity: "purchase", groupKeys: [], valueKeys: ["total_amount", "amount", "cost"], aggregation: "sum", layout: { x: 0, y: 0, w: 3, h: 3 } },
    { title: "供应商支出排行", type: "bar_chart", entity: "purchase", groupKeys: ["supplier", "vendor", "company"], valueKeys: ["total_amount", "amount", "cost"], aggregation: "sum", layout: { x: 3, y: 0, w: 5, h: 4 } },
    { title: "库存分类金额", type: "pie_chart", entity: "inventory", groupKeys: ["category", "type", "department"], valueKeys: ["inventory_value", "value", "amount"], aggregation: "sum", layout: { x: 8, y: 0, w: 4, h: 4 } },
    { title: "供应商预算进度", type: "progress_bar", entity: "purchase", groupKeys: ["supplier", "vendor", "company"], valueKeys: ["total_amount", "amount", "cost"], aggregation: "sum", layout: { x: 0, y: 4, w: 6, h: 4 } },
  ],
  vendor_audit: [
    { title: "供应商支出明细", type: "table", entity: "purchase", groupKeys: ["supplier", "vendor", "company"], valueKeys: ["total_amount", "amount", "cost"], aggregation: "sum", layout: { x: 0, y: 0, w: 6, h: 4 } },
    { title: "最大供应商占比", type: "gauge", entity: "purchase", groupKeys: ["supplier", "vendor", "company"], valueKeys: ["total_amount", "amount", "cost"], aggregation: "sum", layout: { x: 6, y: 0, w: 3, h: 4 } },
    { title: "库存金额漏斗", type: "funnel", entity: "inventory", groupKeys: ["category", "type", "department"], valueKeys: ["inventory_value", "value", "amount"], aggregation: "sum", layout: { x: 9, y: 0, w: 3, h: 4 } },
    { title: "供应商金额面积图", type: "area_chart", entity: "purchase", groupKeys: ["supplier", "vendor", "company"], valueKeys: ["total_amount", "amount", "cost"], aggregation: "sum", layout: { x: 0, y: 4, w: 6, h: 4 } },
  ],
};

export function DashboardCreateForm({ entities, projectId }: { entities: EntityTypeItem[]; projectId: string | null }) {
  const router = useRouter();
  const [name, setName] = useState("新的制片仪表盘");
  const [description, setDescription] = useState("面向制片、监制和制片厂的自定义数据看板。");
  const [templateId, setTemplateId] = useState<TemplateId>("producer_cost");
  const [isShared, setIsShared] = useState(true);
  const [status, setStatus] = useState<CreateStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const selectedTemplate = templates.find((template) => template.id === templateId) ?? templates[0]!;
  const templatePreview = useMemo(() => buildTemplatePreview(templateId, entities), [entities, templateId]);
  const canCreate = Boolean(name.trim()) && (templateId === "blank" || templatePreview.ready);

  async function createDashboard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canCreate) return;
    setStatus("saving");
    setError(null);

    const created = await postJson<DashboardItem>("/api/dashboards", {
      name,
      description,
      projectId,
      isShared,
    });

    if (!created.data) {
      setStatus("error");
      setError(created.error ?? "创建仪表盘失败。");
      return;
    }

    if (templateId !== "blank") {
      for (const seed of buildWidgetSeeds(templateId, entities)) {
        const response = await postJson(`/api/dashboards/${created.data.id}/widgets`, seed);
        if (response.error) {
          setStatus("error");
          setError(response.error);
          return;
        }
      }
    }

    router.push(`/app/dashboards/${created.data.id}/edit`);
    router.refresh();
  }

  return (
    <form onSubmit={createDashboard} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="border border-[#34322b] bg-[#181713]">
        <div className="border-b border-[#2a2a28] px-5 py-4">
          <p className="text-sm font-semibold text-[#f4f1e8]">仪表盘信息</p>
          <p className="mt-1 text-xs text-[#8f8a7e]">先确定看板用途，创建后可以继续拖拽 Widget、调整字段映射和布局。</p>
        </div>
        <div className="grid gap-4 p-5">
          <TextInput label="名称" value={name} onChange={setName} />
          <label className="block">
            <span className="mb-1 block text-[11px] text-[#8f8a7e]">说明</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="w-full resize-none border border-[#34322b] bg-[#11110f] px-3 py-2 text-sm text-[#f4f1e8] outline-none focus:border-[#d8b46a]" />
          </label>
          <label className="flex items-center gap-3 border border-[#2f2d27] bg-[#11110f] px-3 py-3 text-sm">
            <input type="checkbox" checked={isShared} onChange={(event) => setIsShared(event.target.checked)} className="size-4 accent-[#d8b46a]" />
            <span>
              <span className="block font-semibold text-[#f4f1e8]">共享给项目成员</span>
              <span className="mt-1 block text-xs text-[#8f8a7e]">适合监制、制片厂和部门负责人一起查看。</span>
            </span>
          </label>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="border border-[#34322b] bg-[#181713]">
          <div className="border-b border-[#2a2a28] px-4 py-3">
            <p className="text-sm font-semibold text-[#f4f1e8]">初始模板</p>
          </div>
          <div className="space-y-2 p-3">
            {templates.map((template) => (
              <label key={template.id} className={["block cursor-pointer border p-3 transition", templateId === template.id ? "border-[#d8b46a] bg-[#211d13]" : "border-[#2f2d27] bg-[#11110f] hover:border-[#5a5549]"].join(" ")}>
                <input type="radio" name="dashboard-template" value={template.id} checked={templateId === template.id} onChange={() => setTemplateId(template.id)} className="sr-only" />
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-sm font-semibold text-[#f4f1e8]">{template.name}</span>
                    <span className="mt-1 block text-xs leading-5 text-[#8f8a7e]">{template.description}</span>
                  </span>
                  <span className="font-mono text-xs text-[#e8c678]">{template.widgets}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="border border-[#34322b] bg-[#181713] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d8b46a]">template check</p>
          <p className="mt-2 text-sm font-semibold text-[#f4f1e8]">{selectedTemplate.name}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <PreviewMetric label="实体" value={templatePreview.entityCount} />
            <PreviewMetric label="字段" value={templatePreview.fieldCount} />
          </div>
          <p className={["mt-3 text-xs leading-5", templatePreview.ready || templateId === "blank" ? "text-[#8f8a7e]" : "text-[#ff9c8c]"].join(" ")}>
            {templateId === "blank" ? "空白画布不需要预设字段。" : templatePreview.message}
          </p>
          <button type="submit" disabled={!canCreate || status === "saving"} className="mt-4 h-10 w-full border border-[#d8b46a]/60 bg-[#d8b46a]/10 text-sm font-semibold text-[#e8c678] transition hover:border-[#e8c678] disabled:opacity-45">
            {status === "saving" ? "创建中..." : "创建并进入编辑器"}
          </button>
          {status === "error" ? <p className="mt-3 text-xs text-[#ff9c8c]">{error}</p> : null}
        </section>
      </aside>
    </form>
  );
}

async function postJson<T = unknown>(url: string, payload: unknown): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return response.json() as Promise<ApiResponse<T>>;
}

function buildWidgetSeeds(templateId: TemplateId, entities: EntityTypeItem[]) {
  if (templateId === "blank") return [];
  return templateSeeds[templateId].map((seed) => {
    const entity = chooseEntity(entities, seed.entity);
    const numericFields = getNumericFields(entity?.fields ?? []);
    const groupFields = getGroupFields(entity?.fields ?? []);
    const field = chooseField(numericFields, seed.valueKeys);
    const groupBy = chooseField(groupFields, seed.groupKeys);

    return {
      title: seed.title,
      type: seed.type,
      dataSource: {
        entityTypeId: entity?.id ?? "",
        ...(chartNeedsGroupBy(seed.type) && groupBy ? { groupBy } : {}),
        aggregation: { field, fn: seed.aggregation },
        sortDir: "desc",
        limit: 8,
      },
      layout: seed.layout,
    };
  });
}

function buildTemplatePreview(templateId: TemplateId, entities: EntityTypeItem[]) {
  if (templateId === "blank") return { ready: true, entityCount: 0, fieldCount: 0, message: "空白画布" };
  const seeds = buildWidgetSeeds(templateId, entities);
  const entityIds = new Set(seeds.map((seed) => seed.dataSource.entityTypeId).filter(Boolean));
  const fieldCount = seeds.filter((seed) => seed.dataSource.aggregation.field).length;
  const ready = seeds.every((seed) => seed.dataSource.entityTypeId && seed.dataSource.aggregation.field);
  return {
    ready,
    entityCount: entityIds.size,
    fieldCount,
    message: ready ? "模板字段已匹配，可以直接生成初始 Widget。" : "当前实体缺少数值字段。请先安装行业模板或选择空白画布。",
  };
}

function chooseEntity(entities: EntityTypeItem[], intent: WidgetSeed["entity"]) {
  if (intent === "any") return entities.find((entity) => getNumericFields(entity.fields).length) ?? entities[0];
  const keyword = intent === "purchase" ? /purchase|采购|供应商|vendor|supplier/i : /inventory|库存|器材|asset/i;
  return entities.find((entity) => keyword.test(`${entity.id} ${entity.slug} ${entity.name}`) && getNumericFields(entity.fields).length) ?? entities.find((entity) => getNumericFields(entity.fields).length) ?? entities[0];
}

function chooseField(fields: ReturnType<typeof getNumericFields>, preferredKeys: string[]) {
  return fields.find((field) => preferredKeys.some((key) => field.key.toLowerCase().includes(key.toLowerCase())))?.key ?? fields[0]?.key ?? "";
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-[#8f8a7e]">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm text-[#f4f1e8] outline-none focus:border-[#d8b46a]" />
    </label>
  );
}

function PreviewMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[#2f2d27] bg-[#11110f] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#69655c]">{label}</p>
      <p className="mt-1 font-mono text-lg text-[#f4f1e8]">{value}</p>
    </div>
  );
}
