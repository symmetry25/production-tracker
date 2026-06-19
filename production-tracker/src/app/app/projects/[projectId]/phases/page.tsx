import { PhaseWorkspace } from "@/components/phase-work-order/phase-workspace";
import { getProjectPhases } from "@/lib/phase-work-order-data";

type ProjectPhasesPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPhasesPage({ params }: ProjectPhasesPageProps) {
  const { projectId } = await params;
  const phases = await getProjectPhases(projectId);
  const todayDate = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">Phases</p>
        <h1 className="mt-2 text-3xl font-semibold">阶段管理</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#aaa599]">把前期、拍摄、后期和 VFX 审查拆成可跟踪阶段，便于和任务、排期、资源规划对齐。</p>
      </div>

      <PhaseWorkspace projectId={projectId} phases={phases} todayDate={todayDate} />
    </>
  );
}
