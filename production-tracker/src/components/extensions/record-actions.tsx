"use client";

import { useMemo, useState } from "react";

import type { FieldDefinition } from "@/lib/field-types";

export function RecordActions({ recordId, fields }: { recordId: string; fields: FieldDefinition[] }) {
  const [status, setStatus] = useState<"idle" | "updating" | "updated" | "deleting" | "deleted" | "error">("idle");
  const statusField = useMemo(() => fields.find((field) => field.type === "status" || field.key.toLowerCase().includes("status")), [fields]);
  const nextStatus = statusField?.options?.find((option) => ["approved", "closed", "active"].includes(option.value))?.value ?? statusField?.options?.[0]?.value ?? "approved";

  async function updateRecord() {
    if (!statusField) return;
    setStatus("updating");
    const response = await fetch(`/api/records/${recordId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { [statusField.key]: nextStatus } }),
    });
    setStatus(response.ok ? "updated" : "error");
  }

  async function deleteRecord() {
    setStatus("deleting");
    const response = await fetch(`/api/records/${recordId}`, { method: "DELETE" });
    setStatus(response.ok ? "deleted" : "error");
  }

  if (status === "deleted") {
    return <span className="text-xs text-[#83d6ae]">已删除</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={updateRecord} disabled={!statusField || status === "updating"} className="border border-[#3f3c33] px-2 py-1 text-[11px] text-[#c9c3b5] hover:border-[#d8b46a] hover:text-[#e8c678] disabled:opacity-40">
        {status === "updating" ? "更新中" : "标记状态"}
      </button>
      <button type="button" onClick={deleteRecord} disabled={status === "deleting"} className="border border-[#4a2b24] px-2 py-1 text-[11px] text-[#ff9c8c] hover:border-[#e24b4a] disabled:opacity-40">
        {status === "deleting" ? "删除中" : "删除记录"}
      </button>
      {status === "updated" ? <span className="text-[11px] text-[#83d6ae]">记录已更新</span> : null}
      {status === "error" ? <span className="text-[11px] text-[#ff9c8c]">操作失败</span> : null}
    </div>
  );
}
