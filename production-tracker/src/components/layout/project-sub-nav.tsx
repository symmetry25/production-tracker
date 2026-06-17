"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Dictionary } from "@/lib/i18n";

const projectTabs: { key: keyof Dictionary["shell"]["projectTabs"]; slug: string }[] = [
  { key: "overview", slug: "overview" },
  { key: "assets", slug: "assets" },
  { key: "shots", slug: "shots" },
  { key: "tasks", slug: "tasks" },
  { key: "phases", slug: "phases" },
  { key: "media", slug: "media" },
  { key: "workOrders", slug: "work-orders" },
  { key: "other", slug: "other" },
];

export function ProjectSubNav({ projectId, labels }: { projectId: string; labels: Dictionary["shell"]["projectTabs"] }) {
  const pathname = usePathname();

  return (
    <div className="mb-5 flex items-center gap-1 border-b border-[#34322b]">
      {projectTabs.map((tab) => {
        const href = `/app/projects/${projectId}/${tab.slug}`;
        const isActive = pathname.startsWith(href);

        return (
          <Link
            key={tab.key}
            href={href}
            className={[
              "px-3 py-3 text-xs font-semibold uppercase tracking-[0.14em] transition",
              isActive ? "border-b border-[#d8b46a] text-[#e8c678]" : "text-[#8f8a7e] hover:text-[#f4f1e8]",
            ].join(" ")}
          >
            {labels[tab.key]}
          </Link>
        );
      })}
    </div>
  );
}
