"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export type ResourcePlanningRange = {
  start: string;
  end: string;
};

export function ResourcePlanningRangeControls({ range, compact = false }: { range: ResourcePlanningRange; compact?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [start, setStart] = useState(range.start);
  const [end, setEnd] = useState(range.end);

  function updateRange(nextRange: ResourcePlanningRange) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("start", nextRange.start);
    params.set("end", nextRange.end);
    router.push(`${pathname}?${params.toString()}`);
  }

  function resetRange() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("start");
    params.delete("end");
    router.push(params.size ? `${pathname}?${params.toString()}` : pathname);
  }

  return (
    <div className={["flex flex-wrap items-end gap-2 text-xs", compact ? "justify-end" : ""].join(" ")}>
      <label className="grid gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">Start</span>
        <input
          name="resource-planning-start"
          type="date"
          autoComplete="off"
          value={start}
          onChange={(event) => setStart(event.target.value)}
          className="h-9 w-[140px] border border-[#34322b] bg-[#11110f] px-2 font-mono text-[#f4f1e8] outline-none transition focus:border-[#d8b46a] focus-visible:ring-2 focus-visible:ring-[#d8b46a]/35"
        />
      </label>
      <label className="grid gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">End</span>
        <input
          name="resource-planning-end"
          type="date"
          autoComplete="off"
          value={end}
          onChange={(event) => setEnd(event.target.value)}
          className="h-9 w-[140px] border border-[#34322b] bg-[#11110f] px-2 font-mono text-[#f4f1e8] outline-none transition focus:border-[#d8b46a] focus-visible:ring-2 focus-visible:ring-[#d8b46a]/35"
        />
      </label>
      <button
        type="button"
        onClick={() => updateRange({ start, end })}
        disabled={!isValidDate(start) || !isValidDate(end) || start > end}
        className="h-9 bg-[#d8b46a] px-3 font-semibold text-[#171713] transition hover:bg-[#edc875] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8b46a]/45 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Apply
      </button>
      <button
        type="button"
        onClick={resetRange}
        className="h-9 border border-[#34322b] px-3 text-[#aaa599] transition hover:border-[#d8b46a] hover:text-[#f4f1e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8b46a]/35"
      >
        Reset
      </button>
    </div>
  );
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
