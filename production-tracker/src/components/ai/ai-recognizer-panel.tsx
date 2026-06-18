"use client";

import { useState } from "react";

import type { AiRecognitionMode } from "@/lib/ai-recognition";

const modes: AiRecognitionMode[] = ["invoice", "table", "document", "card", "custom"];

export function AiRecognizerPanel({ entityTypeId = "retail-purchase-order" }: { entityTypeId?: string }) {
  const [mode, setMode] = useState<AiRecognitionMode>("invoice");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [note, setNote] = useState("");

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
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="border border-dashed border-[#4a463d] bg-[#181713] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold">AI 识别测试台</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#aaa599]">选择识别模式后直接调用接口；配置真实 API Key 前会返回稳定 mock，适合演示和联调。</p>
          </div>
          <button type="button" onClick={runRecognition} disabled={loading} className="h-9 border border-[#d8b46a]/55 bg-[#d8b46a]/10 px-4 text-xs font-semibold text-[#e8c678] disabled:opacity-50">
            {loading ? "识别中" : "开始识别"}
          </button>
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
      </div>
      <aside className="border border-[#34322b] bg-[#181713] p-4">
        <p className="text-sm font-semibold">识别结果</p>
        <pre className="mt-3 max-h-80 overflow-auto bg-[#11110f] p-3 text-xs leading-5 text-[#c9c3b5]">{JSON.stringify(result ?? { waiting: "点击开始识别" }, null, 2)}</pre>
      </aside>
    </section>
  );
}
