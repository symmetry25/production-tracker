import Link from "next/link";
import { notFound } from "next/navigation";

import { ReviewWorkspace } from "@/components/review/review-workspace";
import { getDictionary, getLocale } from "@/lib/i18n";
import { getReviewVersionWorkspace } from "@/lib/review-data";

type ReviewPageProps = {
  params: Promise<{ versionId: string }>;
};

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { versionId } = await params;
  const [locale, workspace] = await Promise.all([getLocale(), getReviewVersionWorkspace(versionId)]);

  if (!workspace) {
    notFound();
  }

  const { selected, versions } = workspace;
  const t = getDictionary(locale).pages.media;

  return (
    <>
      <div className="mb-4 flex items-end justify-between gap-5">
        <div>
          <Link href="/app/projects/demo-mkali-mission/media" className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8f8a7e] transition hover:text-[#d8b46a]">
            {t.reviewRoute.back}
          </Link>
          <h1 className="mt-2 text-3xl font-semibold">{selected.name}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#aaa599]">
            {selected.task.contextLabel} / {selected.task.name} · {selected.uploadedBy.name} · {t.workspace.status[selected.status]}
          </p>
        </div>
      </div>

      <ReviewWorkspace versions={versions} initialVersionId={selected.id} labels={t.workspace} />
    </>
  );
}
