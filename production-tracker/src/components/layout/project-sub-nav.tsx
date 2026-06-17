"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const projectTabs = ["Overview", "Assets", "Shots", "Tasks", "Phases", "Media", "Work Orders", "Other"];

export function ProjectSubNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  return (
    <div className="mb-5 flex items-center gap-1 border-b border-[#34322b]">
      {projectTabs.map((tab) => {
        const slug = tab.toLowerCase().replaceAll(" ", "-");
        const href = `/app/projects/${projectId}/${slug}`;
        const isActive = pathname.startsWith(href);

        return (
          <Link
            key={tab}
            href={href}
            className={[
              "px-3 py-3 text-xs font-semibold uppercase tracking-[0.14em] transition",
              isActive ? "border-b border-[#d8b46a] text-[#e8c678]" : "text-[#8f8a7e] hover:text-[#f4f1e8]",
            ].join(" ")}
          >
            {tab}
          </Link>
        );
      })}
    </div>
  );
}
