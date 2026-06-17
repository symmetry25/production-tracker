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

  return (
    <section className="border border-[#34322b] bg-[#181713]">
      <header className="flex min-h-12 items-center justify-between gap-3 border-b border-[#34322b] bg-[#1e1e1c] px-4">
        <button type="button" onClick={() => setOpen((value) => !value)} className="flex min-w-0 items-center gap-3 text-left">
          <span className="font-mono text-xs text-[#d8b46a]">{open ? "▼" : "▶"}</span>
          <span className="min-w-0">
            {eyebrow ? <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7f7a70]">{eyebrow}</span> : null}
            <span className="block truncate text-sm font-semibold text-[#f4f1e8]">{title}</span>
          </span>
        </button>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </header>
      <div className={["grid transition-[grid-template-rows] duration-200", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"].join(" ")}>
        <div className="overflow-hidden">{children}</div>
      </div>
    </section>
  );
}
