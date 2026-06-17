import Link from "next/link";

const projectTabs = ["Overview", "Assets", "Shots", "Tasks", "Phases", "Media", "Work Orders", "Other"];

export function ProjectSubNav({ projectId }: { projectId: string }) {
  return (
    <div className="mb-5 flex items-center gap-1 border-b border-[#34322b]">
      {projectTabs.map((tab, index) => {
        const slug = tab.toLowerCase().replaceAll(" ", "-");

        return (
          <Link
            key={tab}
            href={`/app/projects/${projectId}/${slug}`}
            className={[
              "px-3 py-3 text-xs font-semibold uppercase tracking-[0.14em] transition",
              index === 0 ? "border-b border-[#d8b46a] text-[#e8c678]" : "text-[#8f8a7e] hover:text-[#f4f1e8]",
            ].join(" ")}
          >
            {tab}
          </Link>
        );
      })}
    </div>
  );
}
