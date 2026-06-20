"use client";

import { useState } from "react";

import { downloadCsv, type TableCell } from "@/lib/csv";

export function TrialFeedbackIntakeActions({ rows }: { rows: TableCell[][] }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  async function copyTemplate() {
    const text = rows.map((row) => row.map((cell) => cell ?? "").join("\t")).join("\n");
    const copied = await copyText(text);
    setCopyState(copied ? "copied" : "failed");
    window.setTimeout(() => setCopyState("idle"), 1800);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => downloadCsv("trial-feedback-template.csv", rows)}
        className="h-9 border border-[#3f3c33] px-3 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
      >
        下载 CSV 模板
      </button>
      <button
        type="button"
        onClick={() => void copyTemplate()}
        className="h-9 border border-[#3f3c33] px-3 text-xs font-semibold text-[#aaa599] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
      >
        {copyState === "copied" ? "已复制" : copyState === "failed" ? "复制失败" : "复制到 Excel"}
      </button>
    </div>
  );
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the textarea method for browsers that block async clipboard writes.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } finally {
    textarea.remove();
  }
}
