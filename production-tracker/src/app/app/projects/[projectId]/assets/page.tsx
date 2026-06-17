import { AssetTable } from "@/components/asset/asset-table";
import { CreateAssetForm } from "@/components/asset/create-asset-form";
import { getAssetTableItems, type AssetTableItem } from "@/lib/asset-data";
import { getShotTableItems, type ShotTableItem } from "@/lib/shot-data";

export default async function ProjectAssetsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  let assets: AssetTableItem[] = [];
  let shots: ShotTableItem[] = [];
  let error: string | null = null;

  try {
    [assets, shots] = await Promise.all([getAssetTableItems(projectId), getShotTableItems(projectId)]);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "资产数据暂时无法读取。";
  }

  return (
    <>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">Assets</p>
          <h1 className="mt-2 text-3xl font-semibold">资产流水线</h1>
          <p className="mt-2 text-sm text-[#aaa599]">按资产类型分组查看角色、环境、道具、车辆和 FX 资产的任务状态。</p>
        </div>
        <div className="flex h-10 items-center gap-2 text-xs text-[#aaa599]">
          <CreateAssetForm projectId={projectId} />
          <button className="h-10 border border-[#3f3c33] px-3">Sort</button>
          <button className="h-10 border border-[#3f3c33] px-3">Group</button>
          <button className="h-10 border border-[#3f3c33] px-3">Fields</button>
          <button className="h-10 border border-[#3f3c33] px-3">Filter</button>
        </div>
      </div>

      {error ? (
        <div className="border border-[#6f5631] bg-[#211b12] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Database pending</p>
          <h2 className="mt-3 text-xl font-semibold">资产表等待数据库</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#c9c3b5]">{error}</p>
        </div>
      ) : (
        <AssetTable assets={assets} shots={shots} />
      )}
    </>
  );
}
