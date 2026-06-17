import { getProjectPhases } from "@/lib/phase-work-order-data";

type ProjectPhasesPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPhasesPage({ params }: ProjectPhasesPageProps) {
  const { projectId } = await params;
  const phases = await getProjectPhases(projectId);

  return (
    <>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">Phases</p>
        <h1 className="mt-2 text-3xl font-semibold">阶段管理</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#aaa599]">把前期、拍摄、后期和 VFX 审查拆成可跟踪阶段，便于和任务、排期、资源规划对齐。</p>
      </div>

      <section className="border border-[#34322b] bg-[#181713]">
        <div className="grid grid-cols-[1fr_140px_140px_120px_1fr] border-b border-[#2a2a28] bg-[#1e1e1c] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#6e6e69]">
          <span>Phase</span>
          <span>Start</span>
          <span>End</span>
          <span>Tasks</span>
          <span>Timeline</span>
        </div>
        {phases.map((phase) => (
          <div key={phase.id} className="grid min-h-16 grid-cols-[1fr_140px_140px_120px_1fr] items-center border-b border-[#2a2a28] px-4 py-3 text-sm">
            <span className="font-medium text-[#f4f1e8]">{phase.name}</span>
            <span className="font-mono text-xs text-[#aaa599]">{phase.startDate}</span>
            <span className="font-mono text-xs text-[#aaa599]">{phase.endDate}</span>
            <span className="font-mono text-xs text-[#e8c678]">{phase.taskCount}</span>
            <div className="h-2 bg-[#26231d]">
              <div className="h-full bg-[#d8b46a]" style={{ width: `${Math.min(100, 32 + phase.taskCount * 9)}%` }} />
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
