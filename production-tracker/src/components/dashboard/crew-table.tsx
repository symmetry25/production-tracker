import type { CrewMemberDatum } from "@/lib/dashboard-data";

export function CrewTable({ crew }: { crew: CrewMemberDatum[] }) {
  if (crew.length === 0) {
    return <div className="grid min-h-48 place-items-center p-4 text-sm text-[#8f8a7e]">暂无项目成员任务分配。</div>;
  }

  return (
    <div className="overflow-hidden">
      <div className="grid grid-cols-[1.2fr_120px_110px_90px_90px] border-b border-[#2a2a28] bg-[#1e1e1c] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6e6e69]">
        <Cell>Name</Cell>
        <Cell>Dept</Cell>
        <Cell>Role</Cell>
        <Cell>Tasks</Cell>
        <Cell>Load</Cell>
      </div>
      {crew.map((member) => (
        <div key={member.id} className="grid min-h-11 grid-cols-[1.2fr_120px_110px_90px_90px] border-b border-[#2a2a28] text-sm last:border-b-0">
          <Cell strong>{member.name}</Cell>
          <Cell>{member.department}</Cell>
          <Cell>{member.role}</Cell>
          <Cell>{member.finalCount}/{member.taskCount}</Cell>
          <div className="flex items-center px-3">
            <div className="h-2 w-full bg-[#2a2a28]">
              <div className={["h-full", member.loadPct > 100 ? "bg-[#e24b4a]" : "bg-[#4a9eff]"].join(" ")} style={{ width: `${Math.min(100, member.loadPct)}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Cell({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return <div className={["flex items-center px-3 py-2", strong ? "text-[#f4f1e8]" : "text-[#aaa599]"].join(" ")}>{children}</div>;
}
