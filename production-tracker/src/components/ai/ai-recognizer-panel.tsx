"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { buildRecognizedRecords } from "@/lib/ai-apply";
import type { AiRecognitionMode } from "@/lib/ai-recognition";

const modes: AiRecognitionMode[] = ["invoice", "table", "document", "card", "custom"];
type BatchRecognitionItem = {
  current: number;
  total: number;
  name: string;
  result: {
    result?: Record<string, unknown>;
    provider?: string;
    note?: string;
  };
};

type ApplySummary = {
  source: "single" | "batch";
  total: number;
  inserted: number;
  failed: number;
};

export function AiRecognizerPanel({ entityTypeId = "retail-purchase-order" }: { entityTypeId?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<AiRecognitionMode>("invoice");
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchResults, setBatchResults] = useState<BatchRecognitionItem[]>([]);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [note, setNote] = useState("");
  const [applyStatus, setApplyStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [applySummary, setApplySummary] = useState<ApplySummary | null>(null);

  const currentRecords = useMemo(() => buildRecognizedRecords(result), [result]);
  const batchRecords = useMemo(() => buildRecognizedRecords(batchResults), [batchResults]);

  async function runRecognition() {
    setLoading(true);
    const response = await fetch("/api/ai/recognize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, entityTypeId }),
    });
    const body = await response.json();
    setLoading(false);
    setResult(body.data?.result ?? null);
    setNote(body.data?.note ?? body.error ?? "");
    setApplyStatus("idle");
    setApplySummary(null);
  }

  async function applyAsRecord() {
    if (!result) return;
    await applyRecords(currentRecords, "single");
  }

  async function applyBatchAsRecords() {
    await applyRecords(batchRecords, "batch");
  }

  async function applyRecords(records: ReturnType<typeof buildRecognizedRecords>, source: ApplySummary["source"]) {
    if (!records.length) {
      setApplyStatus("error");
      setApplySummary({ source, total: 0, inserted: 0, failed: 0 });
      setNote("没有识别到可以写入的记录。");
      return;
    }

    setApplyStatus("saving");
    setApplySummary(null);

    let inserted = 0;
    let failed = 0;
    for (const data of records) {
      const response = await fetch(`/api/entity-types/${entityTypeId}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, createdBy: "AI识别" }),
      });

      if (response.ok) {
        inserted += 1;
      } else {
        failed += 1;
      }
    }

    setApplySummary({ source, total: records.length, inserted, failed });
    setApplyStatus(failed ? "error" : "done");
    if (inserted > 0) router.refresh();
  }

  async function runBatchRecognition() {
    setBatchLoading(true);
    setBatchResults([]);
    setBatchProgress({ current: 0, total: batchFiles.length || 1 });
    setNote("");
    setApplyStatus("idle");
    setApplySummary(null);

    const files = batchFiles.length
      ? await Promise.all(
          batchFiles.map(async (file) => {
            const dataUrl = await readFileAsDataUrl(file);
            return {
              name: file.name,
              imageType: file.type,
              imageBase64: dataUrl.split(",")[1] ?? "",
            };
          }),
        )
      : [{ name: "mock-document" }];

    const response = await fetch("/api/ai/recognize/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files, mode, entityTypeId }),
    });

    if (!response.ok || !response.body) {
      const payload = await response.json().catch(() => null);
      setBatchLoading(false);
      setNote(payload?.error ?? "批量识别失败。");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const eventText of events) {
        const item = parseSseRecognitionItem(eventText);
        if (!item) continue;
        setBatchProgress({ current: item.current, total: item.total });
        setBatchResults((current) => [...current, item]);
        setResult(item.result.result ?? null);
        setNote(item.result.note ?? "");
      }
    }

    setBatchLoading(false);
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="border border-dashed border-[#4a463d] bg-[#181713] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold">AI 识别测试台</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#aaa599]">选择识别模式后可以单张测试，也可以批量上传发票、手写表格或采购单。配置真实 API Key 前会返回稳定 mock，适合演示和联调。</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={runRecognition} disabled={loading} className="h-9 border border-[#d8b46a]/55 bg-[#d8b46a]/10 px-4 text-xs font-semibold text-[#e8c678] disabled:opacity-50">
              {loading ? "识别中" : "开始识别"}
            </button>
            <button type="button" onClick={applyAsRecord} disabled={!result || applyStatus === "saving"} className="h-9 border border-[#27422e] bg-[#132016] px-4 text-xs font-semibold text-[#83d6ae] disabled:opacity-45">
              {applyStatus === "saving" ? "应用中" : `应用为记录${currentRecords.length > 1 ? ` ${currentRecords.length} 条` : ""}`}
            </button>
          </div>
        </div>
        <div className="mt-5 grid gap-2 md:grid-cols-5">
          {modes.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={["border px-3 py-2 text-center font-mono text-xs transition", mode === item ? "border-[#d8b46a] bg-[#d8b46a]/10 text-[#e8c678]" : "border-[#34322b] bg-[#11110f] text-[#8f8a7e] hover:text-[#f4f1e8]"].join(" ")}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mt-5 border border-[#2f2d27] bg-[#11110f] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#f4f1e8]">批量识别队列</p>
              <p className="mt-1 text-xs text-[#8f8a7e]">支持多张图片或 PDF 截图，接口用 SSE 流式返回每张单据结果。</p>
            </div>
            <button
              type="button"
              onClick={runBatchRecognition}
              disabled={batchLoading}
              className="h-9 border border-[#27422e] bg-[#132016] px-4 text-xs font-semibold text-[#83d6ae] disabled:opacity-50"
            >
              {batchLoading ? "批量识别中" : "运行批量识别"}
            </button>
            <button
              type="button"
              onClick={applyBatchAsRecords}
              disabled={!batchResults.length || applyStatus === "saving"}
              className="h-9 border border-[#d8b46a]/55 bg-[#d8b46a]/10 px-4 text-xs font-semibold text-[#e8c678] disabled:opacity-45"
            >
              {applyStatus === "saving" ? "写入中" : `批量应用${batchRecords.length ? ` ${batchRecords.length} 条` : ""}`}
            </button>
          </div>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(event) => setBatchFiles(Array.from(event.target.files ?? []))}
            className="mt-4 block w-full text-xs text-[#aaa599] file:mr-3 file:h-9 file:border-0 file:bg-[#2b2924] file:px-3 file:text-xs file:font-semibold file:text-[#f4f1e8] hover:file:bg-[#343027]"
          />
          <div className="mt-3 flex items-center justify-between text-xs text-[#8f8a7e]">
            <span>{batchFiles.length ? `${batchFiles.length} 个文件已选择` : "未选择文件时会运行 mock 批量样例"}</span>
            <span className="font-mono">{batchProgress.current}/{batchProgress.total}</span>
          </div>
          <div className="mt-2 h-1.5 bg-[#24231f]">
            <div className="h-full bg-[#83d6ae] transition-all" style={{ width: `${batchProgress.total ? (batchProgress.current / batchProgress.total) * 100 : 0}%` }} />
          </div>
        </div>
        {note ? <p className="mt-4 text-xs text-[#8f8a7e]">{note}</p> : null}
        {applySummary ? (
          <p className={["mt-3 text-xs", applyStatus === "error" ? "text-[#ff9c8c]" : "text-[#83d6ae]"].join(" ")}>
            {applySummary.source === "batch" ? "批量结果" : "当前结果"}共 {applySummary.total} 条，已写入 {applySummary.inserted} 条，失败 {applySummary.failed} 条。
          </p>
        ) : null}
      </div>
      <aside className="border border-[#34322b] bg-[#181713] p-4">
        <p className="text-sm font-semibold">识别结果</p>
        <pre className="mt-3 max-h-80 overflow-auto bg-[#11110f] p-3 text-xs leading-5 text-[#c9c3b5]">{JSON.stringify(result ?? { waiting: "点击开始识别" }, null, 2)}</pre>
        {batchResults.length ? (
          <div className="mt-4 border-t border-[#2a2a28] pt-4">
            <p className="text-sm font-semibold">批量结果</p>
            <div className="mt-3 max-h-72 space-y-2 overflow-auto">
              {batchResults.map((item) => (
                <button
                  key={`${item.current}-${item.name}`}
                  type="button"
                  onClick={() => setResult(item.result.result ?? null)}
                  className="block w-full border border-[#2f2d27] bg-[#11110f] px-3 py-2 text-left hover:border-[#d8b46a]"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="truncate text-xs font-semibold text-[#f4f1e8]">{item.name}</span>
                    <span className="font-mono text-[11px] text-[#83d6ae]">{item.current}/{item.total}</span>
                  </span>
                  <span className="mt-1 block truncate font-mono text-[11px] text-[#8f8a7e]">{JSON.stringify(item.result.result ?? {})}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </aside>
    </section>
  );
}

function parseSseRecognitionItem(eventText: string): BatchRecognitionItem | null {
  const dataLine = eventText.split("\n").find((line) => line.startsWith("data:"));
  if (!dataLine) return null;

  try {
    const payload = JSON.parse(dataLine.slice(5).trim()) as BatchRecognitionItem;
    if (typeof payload.current === "number" && typeof payload.total === "number" && typeof payload.name === "string") {
      return payload;
    }
  } catch {
    return null;
  }

  return null;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });
}
