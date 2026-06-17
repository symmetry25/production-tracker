import Link from "next/link";

import { getProjectReviewVersions } from "@/lib/review-data";

export default async function GlobalMediaPage() {
  const versions = await getProjectReviewVersions("demo-mkali-mission");

  return (
    <>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">Global Media</p>
        <h1 className="mt-2 text-3xl font-semibold">全局媒体中心</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#aaa599]">跨项目查看最新版本、审阅状态和上传人，后续可扩展成 playlist 和 screening room。</p>
      </div>

      <section className="grid grid-cols-4 gap-4">
        {versions.map((version) => (
          <Link key={version.id} href={`/app/review/${version.id}`} className="border border-[#34322b] bg-[#181713] p-3 hover:border-[#d8b46a]">
            <div className="grid aspect-video place-items-center bg-black text-xs text-[#8f8a7e]">{version.fileType.startsWith("video") ? "VIDEO" : "MEDIA"}</div>
            <p className="mt-3 truncate font-mono text-xs text-[#c9c3b5]">{version.name}</p>
            <p className="mt-1 text-xs text-[#8f8a7e]">{version.status} · {version.uploadedBy.name}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
