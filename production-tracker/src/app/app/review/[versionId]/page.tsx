import Link from "next/link";
import { notFound } from "next/navigation";

import { ReviewWorkspace } from "@/components/review/review-workspace";
import { getReviewVersion } from "@/lib/review-data";

type ReviewPageProps = {
  params: Promise<{ versionId: string }>;
};

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { versionId } = await params;
  const version = await getReviewVersion(versionId);

  if (!version) {
    notFound();
  }

  return (
    <>
      <div className="mb-4 flex items-end justify-between gap-5">
        <div>
          <Link href="/app/projects/demo-mkali-mission/media" className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8f8a7e] transition hover:text-[#d8b46a]">
            Review / Back to media
          </Link>
          <h1 className="mt-2 text-3xl font-semibold">{version.name}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#aaa599]">
            {version.task.contextLabel} / {version.task.name} · {version.uploadedBy.name} · {version.status}
          </p>
        </div>
      </div>

      <ReviewWorkspace versions={[version]} />
    </>
  );
}
