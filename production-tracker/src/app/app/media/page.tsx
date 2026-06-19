import Link from "next/link";

import { getCurrentProjectId, getProjectIdFromSearchParams } from "@/lib/current-project";
import { getProjectReviewVersions } from "@/lib/review-data";

type GlobalMediaPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GlobalMediaPage({ searchParams }: GlobalMediaPageProps) {
  const resolvedSearchParams = await searchParams;
  const projectId = await getCurrentProjectId(getProjectIdFromSearchParams(resolvedSearchParams));
  const versions = projectId ? await getProjectReviewVersions(projectId) : [];

  return (
    <>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">Global Media</p>
        <h1 className="mt-2 text-3xl font-semibold">全局媒体中心</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#aaa599]">跨项目查看最新版本、审阅状态和上传人，后续可扩展成 playlist 和 screening room。</p>
      </div>

      {projectId && versions.length > 0 ? (
        <section className="grid grid-cols-4 gap-4">
          {versions.map((version) => (
            <Link key={version.id} href={`/app/review/${version.id}`} className="border border-[#34322b] bg-[#181713] p-3 hover:border-[#d8b46a]">
              <div className="grid aspect-video place-items-center bg-black text-xs text-[#8f8a7e]">{version.fileType.startsWith("video") ? "VIDEO" : "MEDIA"}</div>
              <p className="mt-3 truncate font-mono text-xs text-[#c9c3b5]">{version.name}</p>
              <p className="mt-1 text-xs text-[#8f8a7e]">{version.status} · {version.uploadedBy.name}</p>
            </Link>
          ))}
        </section>
      ) : (
        <div className="grid min-h-80 place-items-center border border-dashed border-[#3f3c33] bg-[#181713] p-10 text-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">No media</p>
            <h2 className="mt-3 text-2xl font-semibold">{projectId ? "当前项目还没有审阅版本" : "还没有可用项目"}</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#aaa599]">上传任务版本后，这里会集中显示待审、已看、已批准和需修改的媒体。</p>
          </div>
        </div>
      )}
    </>
  );
}
