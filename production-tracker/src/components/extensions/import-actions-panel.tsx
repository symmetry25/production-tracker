"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ImportActionsPanel({ entityId, sourceText }: { entityId: string; sourceText: string }) {
  const [status, setStatus] = useState<"idle" | "importing" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function importValidRows() {
    setStatus("importing");
    const response = await fetch(`/api/entity-types/${entityId}/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceText }),
    });
    const body = await response.json().catch(() => null);

    if (!response.ok || body?.error) {
      setStatus("error");
      setMessage(body?.error ?? "导入失败");
      return;
    }

    setStatus("done");
    setMessage(`已导入 ${body.data.inserted} 条，跳过 ${body.data.skipped} 条。`);
    router.refresh();
  }

  return (
    <div className="border border-[#34322b] bg-[#181713] p-4">
      <p className="text-sm font-semibold">执行导入</p>
      <p className="mt-2 text-xs leading-5 text-[#8f8a7e]">先按预检结果仅导入有效行，错误行保留在报告中。</p>
      <button type="button" onClick={importValidRows} disabled={status === "importing"} className="mt-4 h-9 w-full border border-[#27422e] bg-[#132016] text-xs font-semibold text-[#83d6ae] disabled:opacity-50">
        {status === "importing" ? "导入中..." : "仅导入有效行"}
      </button>
      {message ? <p className={["mt-3 text-xs", status === "error" ? "text-[#ff9c8c]" : "text-[#83d6ae]"].join(" ")}>{message}</p> : null}
    </div>
  );
}
