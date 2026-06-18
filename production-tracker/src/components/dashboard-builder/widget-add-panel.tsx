"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { aggregationOptions, chartNeedsGroupBy, chartTypes, getGroupFields, getNumericFields, type AggregationFn } from "@/components/dashboard-builder/widget-options";
import type { EntityTypeItem } from "@/lib/custom-data-store";
import type { WidgetType } from "@/lib/dashboard-builder";

export function WidgetAddPanel({ dashboardId, entities }: { dashboardId: string; entities: EntityTypeItem[] }) {
  const router = useRouter();
  const defaultEntity = entities[0];
  const numericFields = useMemo(() => getNumericFields(defaultEntity?.fields ?? []), [defaultEntity]);
  const [entityId, setEntityId] = useState(defaultEntity?.id ?? "");
  const activeEntity = entities.find((entity) => entity.id === entityId) ?? defaultEntity;
  const activeNumericFields = activeEntity ? getNumericFields(activeEntity.fields) : numericFields;
  const groupFields = activeEntity ? getGroupFields(activeEntity.fields) : [];
  const [title, setTitle] = useState("新增聚合图表");
  const [type, setType] = useState<WidgetType>("bar_chart");
  const [groupBy, setGroupBy] = useState(groupFields[0]?.key ?? "");
  const [field, setField] = useState(activeNumericFields[0]?.key ?? "");
  const [aggregation, setAggregation] = useState<AggregationFn>("sum");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const needsGroupBy = chartNeedsGroupBy(type);

  function changeEntity(nextEntityId: string) {
    const nextEntity = entities.find((entity) => entity.id === nextEntityId) ?? defaultEntity;
    setEntityId(nextEntityId);
    setGroupBy(getGroupFields(nextEntity?.fields ?? [])[0]?.key ?? "");
    setField(getNumericFields(nextEntity?.fields ?? [])[0]?.key ?? "");
  }

  async function addWidget(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    const dataSource = {
      entityTypeId: entityId,
      ...(needsGroupBy && groupBy ? { groupBy } : {}),
      aggregation: { field, fn: aggregation },
      sortDir: "desc",
      limit: 8,
    };
    const response = await fetch(`/api/dashboards/${dashboardId}/widgets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        type,
        dataSource,
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
      <div className="mt-4 grid gap-2 md:grid-cols-6">
        <Input label="标题" value={title} onChange={setTitle} />
        <Select label="图表" value={type} onChange={(value) => setType(value as WidgetType)} options={chartTypes.map((chartType) => [chartType.value, chartType.label])} />
        <Select label="实体" value={entityId} onChange={changeEntity} options={entities.map((entity) => [entity.id, entity.name])} />
        <Select label="分组" value={groupBy} onChange={setGroupBy} options={groupFields.map((fieldItem) => [fieldItem.key, fieldItem.name])} disabled={!needsGroupBy} />
        <Select label="数值" value={field} onChange={setField} options={activeNumericFields.map((fieldItem) => [fieldItem.key, fieldItem.name])} />
        <Select label="聚合" value={aggregation} onChange={(value) => setAggregation(value as AggregationFn)} options={aggregationOptions.map((option) => [option.value, option.label])} />
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

function Select({ label, value, onChange, options, disabled = false }: { label: string; value: string; onChange: (value: string) => void; options: [string, string][]; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-[#8f8a7e]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className="h-9 w-full border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#f4f1e8] outline-none focus:border-[#d8b46a] disabled:text-[#5f5b52]">
        {options.map(([optionValue, labelValue]) => <option key={optionValue} value={optionValue}>{labelValue}</option>)}
      </select>
    </label>
  );
}
