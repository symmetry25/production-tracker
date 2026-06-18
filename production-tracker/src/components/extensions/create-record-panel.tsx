"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { FieldDefinition } from "@/lib/field-types";

export function CreateRecordPanel({ entityId, fields }: { entityId: string; fields: FieldDefinition[] }) {
  const router = useRouter();
  const editableFields = useMemo(() => fields.filter((field) => !field.readOnly && !field.hidden).slice(0, 5), [fields]);
  const [draft, setDraft] = useState<Record<string, string>>(() => Object.fromEntries(editableFields.map((field) => [field.key, defaultValue(field)])));
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function submitRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    const response = await fetch(`/api/entity-types/${entityId}/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: draft }),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    setStatus("done");
    router.refresh();
  }

  return (
    <form onSubmit={submitRecord} className="border border-[#34322b] bg-[#181713] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">快速新增记录</p>
          <p className="mt-1 text-xs text-[#8f8a7e]">选择当前实体前 5 个可编辑字段，保存后公式字段会自动计算。</p>
        </div>
        <button type="submit" disabled={status === "saving"} className="h-9 border border-[#d8b46a]/55 bg-[#d8b46a]/10 px-4 text-xs font-semibold text-[#e8c678] disabled:opacity-50">
          {status === "saving" ? "保存中" : "保存记录"}
        </button>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-5">
        {editableFields.map((field) => (
          <label key={field.key} className="block">
            <span className="mb-1 block text-[11px] text-[#8f8a7e]">{field.name}</span>
            <FieldControl field={field} value={draft[field.key] ?? ""} onChange={(value) => setDraft((current) => ({ ...current, [field.key]: value }))} />
          </label>
        ))}
      </div>
      {status === "done" ? <p className="mt-3 text-xs text-[#83d6ae]">记录已保存，页面数据已刷新。</p> : null}
      {status === "error" ? <p className="mt-3 text-xs text-[#ff9c8c]">保存失败，请检查必填字段。</p> : null}
    </form>
  );
}

function FieldControl({ field, value, onChange }: { field: FieldDefinition; value: string; onChange: (value: string) => void }) {
  const className = "h-9 w-full border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#f4f1e8] outline-none focus:border-[#d8b46a]";

  if (field.type === "select" || field.type === "status") {
    return (
      <select value={value} onChange={(event) => onChange(event.target.value)} className={className}>
        <option value="">--</option>
        {(field.options ?? []).map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    );
  }

  if (field.type === "date") {
    return <input type="date" value={value} onChange={(event) => onChange(event.target.value)} className={className} />;
  }

  if (["number", "currency", "percentage", "score", "rating"].includes(field.type)) {
    return <input type="number" value={value} onChange={(event) => onChange(event.target.value)} className={className} />;
  }

  return <input type="text" value={value} onChange={(event) => onChange(event.target.value)} className={className} />;
}

function defaultValue(field: FieldDefinition) {
  if (field.type === "date") return "2026-06-18";
  if (["number", "currency", "percentage", "score", "rating"].includes(field.type)) return "1";
  if (field.required && field.key.includes("number")) return `AUTO-${Date.now().toString().slice(-4)}`;
  if (field.required) return `测试${field.name}`;
  return field.options?.[0]?.value ?? "";
}
