import { ReviewWorkspace } from "@/components/review/review-workspace";
import { UploadVersionForm } from "@/components/review/upload-version-form";
import { VersionStatus } from "@/generated/prisma/enums";
import type { Dictionary } from "@/lib/i18n";
import { getDictionary, getLocale } from "@/lib/i18n";
import { getProjectReviewTaskOptions, getProjectReviewVersions, type ReviewTaskOption, type ReviewVersionItem } from "@/lib/review-data";

export default async function ProjectMediaPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const locale = await getLocale();
  const t = getDictionary(locale).pages.media;
  let versions: ReviewVersionItem[] = [];
  let tasks: ReviewTaskOption[] = [];
  let error: string | null = null;

  try {
    [versions, tasks] = await Promise.all([getProjectReviewVersions(projectId), getProjectReviewTaskOptions(projectId)]);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "审阅数据暂时无法读取。";
  }

  return (
    <>
      <div className="mb-4 flex items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">{t.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold">{t.title}</h1>
          <p className="mt-2 text-sm text-[#aaa599]">{t.description}</p>
        </div>
        <div className="flex h-10 items-center gap-2 text-xs text-[#aaa599]">
          <UploadVersionForm tasks={tasks} labels={t.upload} />
        </div>
      </div>

      {error ? (
        <div className="border border-[#6f5631] bg-[#211b12] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">{t.databasePending}</p>
          <h2 className="mt-3 text-xl font-semibold">{t.databasePendingTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#c9c3b5]">{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <ReviewCommandCenter versions={versions} labels={t.command} />
          <ReviewWorkspace versions={versions} labels={t.workspace} />
        </div>
      )}
    </>
  );
}

function ReviewCommandCenter({
  versions,
  labels,
}: {
  versions: ReviewVersionItem[];
  labels: Dictionary["pages"]["media"]["command"];
}) {
  const summary = getReviewSummary(versions);
  const actions = buildReviewActions(versions, labels);
  const hasBlockingReview = summary.pending > 0 || summary.changes > 0;

  return (
    <section className="border border-[#34322b] bg-[#151512]">
      <div className="grid border-b border-[#34322b] xl:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)]">
        <div className="border-b border-[#34322b] p-5 xl:border-b-0 xl:border-r">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">{labels.eyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold text-[#f4f1e8]">{hasBlockingReview ? labels.headline : labels.stableHeadline}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#aaa599]">{hasBlockingReview ? labels.narrative : labels.stableNarrative}</p>
          <div className="mt-5 grid grid-cols-4 gap-2">
            <ReviewMetric label={labels.pending} value={summary.pending} tone={summary.pending ? "warn" : "normal"} />
            <ReviewMetric label={labels.changes} value={summary.changes} tone={summary.changes ? "danger" : "normal"} />
            <ReviewMetric label={labels.approved} value={summary.approved} tone="normal" />
            <ReviewMetric label={labels.notes} value={summary.notes} tone="normal" />
          </div>
        </div>

        <div className="min-w-0 p-4">
          <div className="border border-[#2f2d27] bg-[#11110f]">
            <div className="flex items-center justify-between border-b border-[#2f2d27] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">{labels.nextActions}</p>
              <span className="text-xs text-[#8f8a7e]">{formatTemplate(labels.actionsCount, { count: actions.length })}</span>
            </div>
            <div className="divide-y divide-[#24231f]">
              {actions.length ? (
                actions.map((action) => (
                  <a key={action.id} href={`#${action.versionId}`} className="grid gap-3 px-4 py-3 text-sm hover:bg-[#181713] lg:grid-cols-[86px_minmax(0,1fr)_130px]">
                    <span className={["w-fit border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]", toneClass(action.tone)].join(" ")}>{action.label}</span>
                    <span className="min-w-0 truncate text-[#f4f1e8]">{action.title}</span>
                    <span className="text-right font-mono text-xs text-[#8f8a7e]">{action.meta}</span>
                  </a>
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-[#8f8a7e]">{labels.noActions}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewMetric({ label, value, tone }: { label: string; value: number; tone: "normal" | "warn" | "danger" }) {
  return (
    <div className="border border-[#2f2d27] bg-[#11110f] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#69655c]">{label}</p>
      <p className={["mt-1 font-mono text-lg", textClass(tone)].join(" ")}>{value}</p>
    </div>
  );
}

function getReviewSummary(versions: ReviewVersionItem[]) {
  return versions.reduce(
    (summary, version) => ({
      pending: summary.pending + (version.status === VersionStatus.PENDING_REVIEW ? 1 : 0),
      changes: summary.changes + (version.status === VersionStatus.CHANGES_REQUESTED ? 1 : 0),
      approved: summary.approved + (version.status === VersionStatus.APPROVED ? 1 : 0),
      notes: summary.notes + version.notes.length,
    }),
    { pending: 0, changes: 0, approved: 0, notes: 0 },
  );
}

function buildReviewActions(versions: ReviewVersionItem[], labels: Dictionary["pages"]["media"]["command"]) {
  return versions
    .filter((version) => version.status === VersionStatus.PENDING_REVIEW || version.status === VersionStatus.CHANGES_REQUESTED || version.status === VersionStatus.APPROVED)
    .sort((a, b) => reviewRank(a.status) - reviewRank(b.status) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((version) => {
      const isChanges = version.status === VersionStatus.CHANGES_REQUESTED;
      const isApproved = version.status === VersionStatus.APPROVED;

      return {
        id: `${version.id}:action`,
        versionId: version.id,
        label: isChanges ? labels.changesLabel : isApproved ? labels.approvedLabel : labels.reviewLabel,
        tone: isChanges ? "danger" as const : isApproved ? "normal" as const : "warn" as const,
        title: formatTemplate(isChanges ? labels.actionChanges : isApproved ? labels.actionApproved : labels.actionPending, { name: version.name }),
        meta: `${formatTemplate(labels.versionMeta, { number: String(version.number).padStart(3, "0"), context: version.task.contextLabel })} · ${formatTemplate(labels.noteMeta, { count: version.notes.length })}`,
      };
    });
}

function reviewRank(status: VersionStatus) {
  if (status === VersionStatus.CHANGES_REQUESTED) return 0;
  if (status === VersionStatus.PENDING_REVIEW) return 1;
  if (status === VersionStatus.APPROVED) return 2;
  return 3;
}

function toneClass(tone: "normal" | "warn" | "danger") {
  if (tone === "danger") return "border-[#6f2f2f] bg-[#2b1717] text-[#ff9a8f]";
  if (tone === "warn") return "border-[#6f5631] bg-[#211b12] text-[#e8c678]";
  return "border-[#294838] bg-[#13221b] text-[#9cccae]";
}

function textClass(tone: "normal" | "warn" | "danger") {
  if (tone === "danger") return "text-[#ff9a8f]";
  if (tone === "warn") return "text-[#e8c678]";
  return "text-[#f4f1e8]";
}

function formatTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, String(value)), template);
}
