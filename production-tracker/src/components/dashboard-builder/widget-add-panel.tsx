"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { EntityTypeItem } from "@/lib/custom-data-store";

export function WidgetAddPanel({ dashboardId, entities }: { dashboardId: string; entities: EntityTypeItem[] }) {
  const router = useRouter();
  const defaultEntity = entities[0];
  const numericFields = useMemo(() => defaultEntity?.fields.filter((field) => ["number", "currency", "percentage", "score", "rating", "formula"].includes(field.type)) ?? [], [defaultEntity]);
  const [entityId, setEntityId] = useState(defaultEntity?.id ?? "");
  const activeEntity = entities.find((entity) => entity.id === entityId) ?? defaultEntity;
  const activeNumericFields = activeEntity?.fields.filter((field) => ["number", "currency", "percentage", "score", "rating", "formula"].includes(field.type)) ?? numericFields;
  const groupFields = activeEntity?.fields.filter((field) => ["text", "select", "status", "user"].includes(field.type)) ?? [];
  const [title, setTitle] = useState("新增聚合图表");
  const [type, setType] = useState("bar_chart");
  const [groupBy, setGroupBy] = useState(groupFields[0]?.key ?? "");
  const [field, setField] = useState(activeNumericFields[0]?.key ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function addWidget(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    const response = await fetch(`/api/dashboards/${dashboardId}/widgets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        type,
        dataSource: { entityTypeId: entityId, groupBy, aggregation: { field, fn: "sum" }, sortDir: "desc", limit: 8 },
      }),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    setStatus("done");
    router.refresh();
  }

  return (
    <form onSubmit={addWidget} className="border border-[#34322b] bg-[#181713] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">添加 Widget</p>
          <p className="mt-1 text-xs text-[#8f8a7e]">从任意实体选择分组字段和金额/数字字段，生成新的聚合图表。</p>
        </div>
        <button type="submit" disabled={status === "saving"} className="h-9 border border-[#d8b46a]/55 bg-[#d8b46a]/10 px-4 text-xs font-semibold text-[#e8c678] disabled:opacity-50">
          {status === "saving" ? "添加中" : "添加"}
        </button>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-5">
        <Input label="标题" value={title} onChange={setTitle} />
        <Select label="图表" value={type} onChange={setType} options={[["bar_chart", "柱状图"], ["pie_chart", "环形图"], ["metric_card", "指标卡"]]} />
        <Select label="实体" value={entityId} onChange={setEntityId} options={entities.map((entity) => [entity.id, entity.name])} />
        <Select label="分组" value={groupBy} onChange={setGroupBy} options={groupFields.map((fieldItem) => [fieldItem.key, fieldItem.name])} />
        <Select label="数值" value={field} onChange={setField} options={activeNumericFields.map((fieldItem) => [fieldItem.key, fieldItem.name])} />
      </div>
      {status === "done" ? <p className="mt-3 text-xs text-[#83d6ae]">Widget 已添加。</p> : null}
      {status === "error" ? <p className="mt-3 text-xs text-[#ff9c8c]">添加失败，请检查字段映射。</p> : null}
    </form>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-[#8f8a7e]">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#f4f1e8] outline-none focus:border-[#d8b46a]" />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: [string, string][] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-[#8f8a7e]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#f4f1e8] outline-none focus:border-[#d8b46a]">
        {options.map(([optionValue, labelValue]) => <option key={optionValue} value={optionValue}>{labelValue}</option>)}
      </select>
    </label>
  );
}
