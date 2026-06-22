"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ImportActionsPanel({ entityId, sourceText }: { entityId: string; sourceText: string }) {
  const [status, setStatus] = useState<"idle" | "importing" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [textSource, setTextSource] = useState(sourceText);
  const router = useRouter();

  async function importValidRows() {
    setStatus("importing");
    setMessage("");
    const response = file ? await importFile(entityId, file) : await importText(entityId, textSource);
    const body = await response.json().catch(() => null);

    if (!response.ok || body?.error) {
      setStatus("error");
      setMessage(body?.error ?? "导入失败");
      toast.error(body?.error ?? "导入失败");
      return;
    }

    setStatus("done");
    setMessage(`已导入 ${body.data.inserted} 条，跳过 ${body.data.skipped} 条。`);
    toast.success(`已导入 ${body.data.inserted} 条，跳过 ${body.data.skipped} 条。`);
    router.refresh();
  }

  return (
    <div className="border border-[#34322b] bg-[#181713] p-4">
      <p className="text-sm font-semibold">执行导入</p>
      <p className="mt-2 text-xs leading-5 text-[#8f8a7e]">可直接上传 xlsx / csv，也可以粘贴 Excel 表格文本。系统会自动映射字段，并仅写入有效行。</p>
      <input
        type="file"
        accept=".xlsx,.xls,.csv,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        className="mt-4 block w-full text-xs text-[#aaa599] file:mr-3 file:h-9 file:border-0 file:bg-[#2b2924] file:px-3 file:text-xs file:font-semibold file:text-[#f4f1e8] hover:file:bg-[#343027]"
      />
      <textarea
        value={textSource}
        onChange={(event) => {
          setTextSource(event.target.value);
          if (file) setFile(null);
        }}
        rows={5}
        className="mt-3 w-full resize-none border border-[#34322b] bg-[#11110f] px-3 py-2 font-mono text-xs leading-5 text-[#c9c3b5] outline-none focus:border-[#d8b46a]"
      />
      <button type="button" onClick={importValidRows} disabled={status === "importing" || (!file && !textSource.trim())} className="mt-4 h-9 w-full border border-[#27422e] bg-[#132016] text-xs font-semibold text-[#83d6ae] disabled:opacity-50">
        {status === "importing" ? "导入中..." : file ? "上传并导入文件" : "仅导入有效行"}
      </button>
      {message ? <p className={["mt-3 text-xs", status === "error" ? "text-[#ff9c8c]" : "text-[#83d6ae]"].join(" ")}>{message}</p> : null}
    </div>
  );
}

function importText(entityId: string, sourceText: string) {
  return fetch(`/api/entity-types/${entityId}/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sourceText }),
  });
}

function importFile(entityId: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  return fetch(`/api/entity-types/${entityId}/import`, {
    method: "POST",
    body: form,
  });
}
