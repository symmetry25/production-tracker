import type { DashboardStats } from "@/lib/dashboard-data";

export function CountdownWidget({ project, counts }: { project: DashboardStats["project"]; counts: DashboardStats["counts"] }) {
  const dueLabel = new Date(project.dueDate).toLocaleDateString();
  const tone = project.daysRemaining < 0 ? "text-[#e24b4a]" : project.daysRemaining < 21 ? "text-[#ef9f27]" : "text-[#1d9e75]";

  return (
    <div className="grid grid-cols-[1.1fr_1.4fr] gap-4">
      <div className="border border-[#34322b] bg-[#181713] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">Project countdown</p>
        <div className="mt-6 flex items-end gap-3">
          <span className={["font-mono text-6xl font-semibold leading-none", tone].join(" ")}>{project.daysRemaining}</span>
          <span className="pb-2 text-sm text-[#aaa599]">days to due date</span>
        </div>
        <p className="mt-4 text-sm text-[#c9c3b5]">{project.name} · {project.code}</p>
        <p className="mt-1 text-xs text-[#8f8a7e]">Due {dueLabel}{project.milestone ? ` · ${project.milestone}` : ""}</p>
        <div className="mt-5 h-2 overflow-hidden bg-[#2a2a28]">
          <div className="h-full bg-[#d8b46a]" style={{ width: `${project.progressPct}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-5 border border-[#34322b] bg-[#181713]">
        <Metric label="Shots" value={counts.shots} />
        <Metric label="Assets" value={counts.assets} />
        <Metric label="Tasks" value={counts.tasks} />
        <Metric label="Versions" value={counts.versions} />
        <Metric label="Crew" value={counts.crew} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-r border-[#34322b] p-4 last:border-r-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">{label}</p>
      <p className="mt-5 font-mono text-3xl text-[#f4f1e8]">{value}</p>
    </div>
  );
}
