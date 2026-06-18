"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { getUserScorecard } from "@/lib/scoring";

type Scorecard = NonNullable<ReturnType<typeof getUserScorecard>>;

export function ScoreUpdatePanel({ userId, rows }: { userId: string; rows: Scorecard["rows"] }) {
  const router = useRouter();
  const [dimensionId, setDimensionId] = useState(rows[0]?.dimension.id ?? "");
  const [score, setScore] = useState(String(rows[0]?.score ?? 80));
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function submitScore(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    const response = await fetch(`/api/scores/users/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dimensionId, score: Number(score), period: "2026-Q2", comment: "页面快速评分更新" }),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    setStatus("done");
    router.refresh();
  }

  return (
    <form onSubmit={submitScore} className="border border-[#34322b] bg-[#181713] p-4">
      <div className="flex items-end gap-3">
        <label className="block min-w-72">
          <span className="mb-1 block text-[11px] text-[#8f8a7e]">评分维度</span>
          <select value={dimensionId} onChange={(event) => setDimensionId(event.target.value)} className="h-9 w-full border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#f4f1e8] outline-none focus:border-[#d8b46a]">
            {rows.map((row) => <option key={row.dimension.id} value={row.dimension.id}>{row.dimension.name}</option>)}
          </select>
        </label>
        <label className="block w-40">
          <span className="mb-1 block text-[11px] text-[#8f8a7e]">分数</span>
          <input type="number" min={0} max={100} value={score} onChange={(event) => setScore(event.target.value)} className="h-9 w-full border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#f4f1e8] outline-none focus:border-[#d8b46a]" />
        </label>
        <button type="submit" disabled={status === "saving"} className="h-9 border border-[#d8b46a]/55 bg-[#d8b46a]/10 px-4 text-xs font-semibold text-[#e8c678] disabled:opacity-50">
          {status === "saving" ? "更新中" : "更新评分"}
        </button>
        {status === "done" ? <span className="pb-2 text-xs text-[#83d6ae]">已更新</span> : null}
        {status === "error" ? <span className="pb-2 text-xs text-[#ff9c8c]">更新失败</span> : null}
      </div>
    </form>
  );
}
