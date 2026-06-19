"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const refreshOptions = [
  { label: "手动", value: 0 },
  { label: "30 秒", value: 30 },
  { label: "2 分钟", value: 120 },
  { label: "5 分钟", value: 300 },
] as const;

export function DashboardRefreshControls({ updatedAt }: { updatedAt: string }) {
  const router = useRouter();
  const [intervalSeconds, setIntervalSeconds] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(updatedAt);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
      setLastRefresh(new Date().toISOString());
    });
  }, [router, startTransition]);

  useEffect(() => {
    if (!intervalSeconds) return;
    const timer = window.setInterval(refresh, intervalSeconds * 1000);
    return () => window.clearInterval(timer);
  }, [intervalSeconds, refresh]);

  return (
    <div className="flex h-9 items-center gap-2 border border-[#34322b] bg-[#11110f] px-2 text-xs">
      <span className="hidden font-mono text-[#7f7a70] lg:inline">{lastRefresh.slice(0, 19).replace("T", " ")}</span>
      <select
        value={intervalSeconds}
        onChange={(event) => setIntervalSeconds(Number(event.target.value))}
        className="h-7 border border-[#34322b] bg-[#181713] px-2 text-xs text-[#c9c3b5] outline-none focus:border-[#d8b46a]"
        aria-label="Dashboard refresh interval"
      >
        {refreshOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={refresh}
        disabled={pending}
        className="h-7 border border-[#3f3c33] px-3 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678] disabled:opacity-50"
      >
        {pending ? "刷新中" : "刷新"}
      </button>
    </div>
  );
}
