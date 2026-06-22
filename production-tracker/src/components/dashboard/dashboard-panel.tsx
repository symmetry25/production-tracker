"use client";

import { useState } from "react";

export function DashboardPanel({
  title,
  eyebrow,
  actions,
  children,
  defaultOpen = true,
}: {
  title: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [expanded, setExpanded] = useState(false);

  return (
    <section className={["border border-[#34322b] bg-[#181713]", expanded ? "fixed inset-4 z-50 flex flex-col shadow-[0_28px_100px_rgba(0,0,0,0.72)]" : ""].join(" ")}>
      {expanded ? <div className="pointer-events-none fixed inset-0 -z-10 bg-black/70" /> : null}
      <header className="flex min-h-12 items-center justify-between gap-3 border-b border-[#34322b] bg-[#1e1e1c] px-4">
        <button type="button" onClick={() => setOpen((value) => !value)} className="flex min-w-0 items-center gap-3 text-left">
          <span className="font-mono text-xs text-[#d8b46a]">{open ? "▼" : "▶"}</span>
          <span className="min-w-0">
            {eyebrow ? <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7f7a70]">{eyebrow}</span> : null}
            <span className="block truncate text-sm font-semibold text-[#f4f1e8]">{title}</span>
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="h-7 border border-[#34322b] px-2 text-[11px] font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
            title={expanded ? "退出全屏" : "全屏查看"}
            aria-label={expanded ? "退出全屏" : "全屏查看"}
          >
            {expanded ? "Exit" : "Full"}
          </button>
        </div>
      </header>
      <div className={["grid min-h-0 transition-[grid-template-rows] duration-200", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]", expanded ? "flex-1" : ""].join(" ")}>
        <div className="overflow-hidden">{children}</div>
      </div>
    </section>
  );
}
