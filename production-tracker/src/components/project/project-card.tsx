import Link from "next/link";
import Image from "next/image";

import { formatUtcDate } from "@/lib/date-format";
import type { ProjectGridItem } from "@/lib/project-data";

export function ProjectCard({ project }: { project: ProjectGridItem }) {
  return (
    <Link href={`/app/projects/${project.id}/overview`} className="group border border-[#353229] bg-[#181713] transition hover:border-[#d8b46a]/65">
      <div className="relative flex h-32 items-end justify-between overflow-hidden bg-[linear-gradient(135deg,#2c2a23,#11110f_62%)] p-4">
        {project.thumbnailUrl ? (
          <>
            <Image src={project.thumbnailUrl} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover opacity-70 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-85" />
            <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,15,0.12),rgba(17,17,15,0.84))]" />
          </>
        ) : null}
        <div className="relative min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#e8c678]">{project.code}</p>
          <h2 className="mt-2 truncate text-xl font-semibold text-[#f4f1e8]">{project.name}</h2>
        </div>
        <span className="relative shrink-0 border border-[#d8b46a]/35 bg-[#11110f]/70 px-2 py-1 text-xs text-[#e8c678] backdrop-blur">{project.status}</span>
      </div>

      <div className="p-3">
        <p className="line-clamp-2 min-h-10 text-sm leading-5 text-[#aaa599]">{project.description || "暂无项目描述。"}</p>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Metric label="Shots" value={project.shotCount.toString()} />
          <Metric label="Assets" value={project.assetCount.toString()} />
          <Metric label="Tasks" value={project.taskCount.toString()} />
        </div>

        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between text-xs text-[#8f8a7e]">
            <span>{formatUtcDate(project.startDate)}</span>
            <span>{formatUtcDate(project.dueDate)}</span>
          </div>
          <div className="h-1.5 bg-[#2b2924]">
            <div className="h-full bg-[#d8b46a] transition-all group-hover:bg-[#e5c67f]" style={{ width: `${project.progress}%` }} />
          </div>
        </div>

        {project.milestone ? (
          <p className="mt-3 text-xs text-[#9f9b8f]">
            Milestone: <span className="text-[#d8b46a]">{project.milestone}</span>
            {project.milestoneDate ? ` · ${formatUtcDate(project.milestoneDate)}` : ""}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#302d26] bg-[#11110f] p-3">
      <p className="text-lg font-semibold tabular-nums text-[#f4f1e8]">{value}</p>
      <p className="mt-1 text-xs text-[#8f8a7e]">{label}</p>
    </div>
  );
}
