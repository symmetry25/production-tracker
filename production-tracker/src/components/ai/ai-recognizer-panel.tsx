"use client";

import { useState } from "react";

import type { AiRecognitionMode } from "@/lib/ai-recognition";

const modes: AiRecognitionMode[] = ["invoice", "table", "document", "card", "custom"];

export function AiRecognizerPanel({ entityTypeId = "retail-purchase-order" }: { entityTypeId?: string }) {
  const [mode, setMode] = useState<AiRecognitionMode>("invoice");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [note, setNote] = useState("");
  const [applyStatus, setApplyStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

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
  }

  async function applyAsRecord() {
    if (!result) return;
    setApplyStatus("saving");
    const data = normalizeRecognizedRecord(result);
    const response = await fetch(`/api/entity-types/${entityTypeId}/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, createdBy: "AI识别" }),
    });
    setApplyStatus(response.ok ? "done" : "error");
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="border border-dashed border-[#4a463d] bg-[#181713] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold">AI 识别测试台</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#aaa599]">选择识别模式后直接调用接口；配置真实 API Key 前会返回稳定 mock，适合演示和联调。</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={runRecognition} disabled={loading} className="h-9 border border-[#d8b46a]/55 bg-[#d8b46a]/10 px-4 text-xs font-semibold text-[#e8c678] disabled:opacity-50">
              {loading ? "识别中" : "开始识别"}
            </button>
            <button type="button" onClick={applyAsRecord} disabled={!result || applyStatus === "saving"} className="h-9 border border-[#27422e] bg-[#132016] px-4 text-xs font-semibold text-[#83d6ae] disabled:opacity-45">
              {applyStatus === "saving" ? "应用中" : "应用为记录"}
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
        {note ? <p className="mt-4 text-xs text-[#8f8a7e]">{note}</p> : null}
        {applyStatus === "done" ? <p className="mt-3 text-xs text-[#83d6ae]">识别结果已写入采购单记录。</p> : null}
        {applyStatus === "error" ? <p className="mt-3 text-xs text-[#ff9c8c]">应用失败，请检查字段映射。</p> : null}
      </div>
      <aside className="border border-[#34322b] bg-[#181713] p-4">
        <p className="text-sm font-semibold">识别结果</p>
        <pre className="mt-3 max-h-80 overflow-auto bg-[#11110f] p-3 text-xs leading-5 text-[#c9c3b5]">{JSON.stringify(result ?? { waiting: "点击开始识别" }, null, 2)}</pre>
      </aside>
    </section>
  );
}

function normalizeRecognizedRecord(result: Record<string, unknown>) {
  const total = Number(result.total ?? result.total_amount ?? 0);
  const item = Array.isArray(result.items) ? (result.items[0] as Record<string, unknown> | undefined) : undefined;

  return {
    po_number: String(result.invoice_number ?? result.document_number ?? `AI-${Date.now().toString().slice(-5)}`),
    supplier: String(result.seller_name ?? result.parties?.["from" as never] ?? "AI识别供应商"),
    order_date: String(result.invoice_date ?? result.date ?? "2026-06-18"),
    expected_date: "2026-06-25",
    unit_cost: total || Number(item?.unit_price ?? item?.amount ?? 1),
    quantity: Number(item?.quantity ?? 1),
    status: "pending",
    vendor_score: Math.round(Number(result.confidence ?? 0.85) * 100),
  };
}
