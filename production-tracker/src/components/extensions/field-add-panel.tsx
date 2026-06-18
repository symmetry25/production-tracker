"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const fieldTypes = [
  ["text", "文本"],
  ["number", "数字"],
  ["currency", "金额"],
  ["date", "日期"],
  ["status", "状态"],
  ["score", "评分"],
] as const;

export function FieldAddPanel({ entityId }: { entityId: string }) {
  const router = useRouter();
  const [name, setName] = useState("备注字段");
  const [key, setKey] = useState("note_field");
  const [type, setType] = useState("text");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function addField(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    const response = await fetch(`/api/entity-types/${entityId}/fields`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        key,
        type,
        required: false,
        width: type === "currency" ? 140 : 160,
        options: type === "status" ? ["pending", "active", "approved", "closed"].map((value) => ({ value, label: value })) : undefined,
        config: type === "currency" ? { currency: "CNY", precision: 2 } : undefined,
      }),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    setStatus("done");
    setName("备注字段");
    setKey((current) => `${current}_copy`);
    router.refresh();
  }

  return (
    <form onSubmit={addField} className="border border-[#34322b] bg-[#181713] p-4">
      <div className="flex items-end gap-3">
        <label className="block min-w-56">
          <span className="mb-1 block text-[11px] text-[#8f8a7e]">字段名</span>
          <input value={name} onChange={(event) => setName(event.target.value)} className="h-9 w-full border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#f4f1e8] outline-none focus:border-[#d8b46a]" />
        </label>
        <label className="block min-w-56">
          <span className="mb-1 block text-[11px] text-[#8f8a7e]">字段 Key</span>
          <input value={key} onChange={(event) => setKey(event.target.value)} className="h-9 w-full border border-[#34322b] bg-[#11110f] px-2 font-mono text-xs text-[#f4f1e8] outline-none focus:border-[#d8b46a]" />
        </label>
        <label className="block w-40">
          <span className="mb-1 block text-[11px] text-[#8f8a7e]">类型</span>
          <select value={type} onChange={(event) => setType(event.target.value)} className="h-9 w-full border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#f4f1e8] outline-none focus:border-[#d8b46a]">
            {fieldTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button type="submit" disabled={status === "saving"} className="h-9 border border-[#d8b46a]/55 bg-[#d8b46a]/10 px-4 text-xs font-semibold text-[#e8c678] disabled:opacity-50">
          {status === "saving" ? "添加中" : "添加字段"}
        </button>
        {status === "done" ? <span className="pb-2 text-xs text-[#83d6ae]">字段已添加</span> : null}
        {status === "error" ? <span className="pb-2 text-xs text-[#ff9c8c]">添加失败</span> : null}
      </div>
    </form>
  );
}
