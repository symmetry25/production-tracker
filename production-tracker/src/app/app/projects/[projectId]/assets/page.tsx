import { AssetTable } from "@/components/asset/asset-table";
import { CreateAssetForm } from "@/components/asset/create-asset-form";
import { getAssetTableItems, type AssetTableItem } from "@/lib/asset-data";
import { getDictionary, getLocale } from "@/lib/i18n";
import { getShotTableItems, type ShotTableItem } from "@/lib/shot-data";

export default async function ProjectAssetsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const locale = await getLocale();
  const t = getDictionary(locale).pages.assets;
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
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">{t.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold">{t.title}</h1>
          <p className="mt-2 text-sm text-[#aaa599]">{t.description}</p>
        </div>
        <div className="flex h-10 items-center gap-2 text-xs text-[#aaa599]">
          <CreateAssetForm projectId={projectId} />
        </div>
      </div>

      {error ? (
        <div className="border border-[#6f5631] bg-[#211b12] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Database pending</p>
          <h2 className="mt-3 text-xl font-semibold">资产表等待数据库</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#c9c3b5]">{error}</p>
        </div>
      ) : (
        <AssetTable
          key={assets.map((asset) => `${asset.id}:${asset.name}:${asset.status}:${asset.linkedShots.length}`).join("|")}
          projectId={projectId}
          assets={assets}
          shots={shots}
        />
      )}
    </>
  );
}
