import { CreateShotForm } from "@/components/shot/create-shot-form";
import { ShotTable } from "@/components/shot/shot-table";
import { getShotTableItems, type ShotTableItem } from "@/lib/shot-data";

export default async function ProjectShotsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  let shots: ShotTableItem[] = [];
  let error: string | null = null;

  try {
    shots = await getShotTableItems(projectId);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "镜头数据暂时无法读取。";
  }

  return (
    <>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">Shots</p>
          <h1 className="mt-2 text-3xl font-semibold">镜头流水线</h1>
          <p className="mt-2 text-sm text-[#aaa599]">按 Sequence 分组查看每个镜头在 LAY、ANM、CFX、FX、LGT、CMP 的状态。</p>
        </div>
        <div className="flex h-10 items-center gap-2 text-xs text-[#aaa599]">
          <CreateShotForm projectId={projectId} />
          <button className="h-10 border border-[#3f3c33] px-3">Sort</button>
          <button className="h-10 border border-[#3f3c33] px-3">Group</button>
          <button className="h-10 border border-[#3f3c33] px-3">Fields</button>
          <button className="h-10 border border-[#3f3c33] px-3">Filter</button>
        </div>
      </div>

      {error ? (
        <div className="border border-[#6f5631] bg-[#211b12] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Database pending</p>
          <h2 className="mt-3 text-xl font-semibold">镜头表等待数据库</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#c9c3b5]">{error}</p>
        </div>
      ) : (
        <ShotTable shots={shots} />
      )}
    </>
  );
}
