import { ReviewWorkspace } from "@/components/review/review-workspace";
import { UploadVersionForm } from "@/components/review/upload-version-form";
import { VersionStatus } from "@/generated/prisma/enums";
import type { Dictionary } from "@/lib/i18n";
import { getDictionary, getLocale } from "@/lib/i18n";
import { buildReviewPaymentGateSummary, type ReviewPaymentGateSummary } from "@/lib/review-payment-gates";
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
          <VendorReviewGatePanel versions={versions} labels={t.vendorGate} />
          <ReviewWorkspace versions={versions} labels={t.workspace} />
        </div>
      )}
    </>
  );
}

function VendorReviewGatePanel({
  versions,
  labels,
}: {
  versions: ReviewVersionItem[];
  labels: Dictionary["pages"]["media"]["vendorGate"];
}) {
  const summary = buildReviewPaymentGateSummary(versions);
  const headline = getGateHeadline(summary, labels);
  const action = getGateAction(summary, labels);
  const featuredItems = summary.items.slice(0, 6);

  return (
    <section className={["overflow-hidden border bg-[#151512]", gatePanelClass(summary.tone)].join(" ")}>
      <div className="grid xl:grid-cols-[minmax(300px,0.72fr)_minmax(0,1.28fr)]">
        <div className="border-b border-[#34322b] p-5 xl:border-b-0 xl:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">{labels.eyebrow}</p>
              <h2 className="mt-3 text-2xl font-semibold text-[#f4f1e8]">{headline}</h2>
            </div>
            <span className={["shrink-0 border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]", gatePillClass(summary.tone === "empty" ? "watch" : summary.tone)].join(" ")}>
              {summary.tone === "empty" ? labels.state.empty : labels.state[summary.tone]}
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#aaa599]">
            {summary.counts.total ? formatTemplate(labels.description, { total: summary.counts.total, notes: summary.counts.notes }) : labels.emptyDescription}
          </p>
          <div className="mt-5 grid grid-cols-5 gap-2">
            <GateMetric label={labels.metrics.hold} value={summary.counts.hold} tone={summary.counts.hold ? "hold" : "normal"} />
            <GateMetric label={labels.metrics.watch} value={summary.counts.watch} tone={summary.counts.watch ? "watch" : "normal"} />
            <GateMetric label={labels.metrics.ready} value={summary.counts.ready} tone="ready" />
            <GateMetric label={labels.metrics.notes} value={summary.counts.notes} tone="normal" />
            <GateMetric label={labels.metrics.total} value={summary.counts.total} tone="normal" />
          </div>
          <div className="mt-4 border border-[#2f2d27] bg-[#11110f] px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#69655c]">{labels.actionLabel}</p>
            <p className="mt-1 text-sm font-medium text-[#f4f1e8]">{action}</p>
          </div>
        </div>

        <div className="min-w-0 p-4">
          <div className="flex items-center justify-between border-b border-[#2f2d27] pb-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">{labels.listTitle}</p>
              <p className="mt-1 text-xs text-[#8f8a7e]">{formatTemplate(labels.listCount, { count: featuredItems.length })}</p>
            </div>
            <span className="text-xs text-[#8f8a7e]">{labels.openHint}</span>
          </div>

          {featuredItems.length ? (
            <div className="mt-3 grid gap-2 2xl:grid-cols-2">
              {featuredItems.map((item) => {
                const gateCopy = labels.gates[item.gateStatus];

                return (
                  <a key={item.id} href={`#${item.id}`} className="group grid min-w-0 grid-cols-[82px_minmax(0,1fr)] gap-3 border border-[#2f2d27] bg-[#11110f] p-2.5 transition hover:border-[#d8b46a] hover:bg-[#191813]">
                    <div
                      className="grid aspect-video place-items-center overflow-hidden border border-[#2f2d27] bg-cover bg-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7f7a70]"
                      style={item.thumbnailUrl ? { backgroundImage: `url(${item.thumbnailUrl})` } : undefined}
                    >
                      {item.thumbnailUrl ? <span className="sr-only">{item.contextLabel}</span> : item.contextLabel.slice(0, 8)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate font-mono text-xs text-[#4a9eff] group-hover:text-[#74b4ff]">{item.name}</span>
                        <span className={["shrink-0 border px-2 py-1 text-[10px] font-semibold", gatePillClass(item.gateStatus)].join(" ")} title={gateCopy.detail}>
                          {gateCopy.label}
                        </span>
                      </div>
                      <p className="mt-2 truncate text-xs text-[#c9c3b5]">
                        {item.contextLabel} / {item.taskName}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#7f7a70]">
                        <span>{formatTemplate(labels.versionMeta, { version: item.versionLabel })}</span>
                        <span>{formatTemplate(labels.notesMeta, { count: item.noteCount })}</span>
                        <span>{formatTemplate(labels.framesMeta, { frames: formatInteger(item.frameCount), fps: item.fps ?? "--" })}</span>
                        <span className="truncate">{formatTemplate(labels.ownerMeta, { owner: item.uploadedBy })}</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="mt-3 grid min-h-32 place-items-center border border-dashed border-[#3f3c33] text-sm text-[#8f8a7e]">{labels.emptyList}</div>
          )}
        </div>
      </div>
    </section>
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

function GateMetric({ label, value, tone }: { label: string; value: number; tone: "normal" | "hold" | "watch" | "ready" }) {
  return (
    <div className="min-w-0 border border-[#2f2d27] bg-[#11110f] px-3 py-2">
      <p className="truncate text-[10px] uppercase tracking-[0.14em] text-[#69655c]">{label}</p>
      <p className={["mt-1 font-mono text-lg", gateMetricTextClass(tone)].join(" ")}>{value}</p>
    </div>
  );
}

function getGateHeadline(summary: ReviewPaymentGateSummary, labels: Dictionary["pages"]["media"]["vendorGate"]) {
  if (summary.tone === "hold") return labels.headlineHold;
  if (summary.tone === "watch") return labels.headlineWatch;
  if (summary.tone === "ready") return labels.headlineReady;
  return labels.headlineEmpty;
}

function getGateAction(summary: ReviewPaymentGateSummary, labels: Dictionary["pages"]["media"]["vendorGate"]) {
  if (summary.counts.hold > 0) return formatTemplate(labels.actionHold, { count: summary.counts.hold });
  if (summary.counts.watch > 0) return formatTemplate(labels.actionWatch, { count: summary.counts.watch });
  if (summary.counts.ready > 0) return formatTemplate(labels.actionReady, { count: summary.counts.ready });
  return labels.actionEmpty;
}

function gatePanelClass(tone: ReviewPaymentGateSummary["tone"]) {
  if (tone === "hold") return "border-[#563333] shadow-[inset_3px_0_0_#e24b4a]";
  if (tone === "watch") return "border-[#5a482d] shadow-[inset_3px_0_0_#ef9f27]";
  if (tone === "ready") return "border-[#314c3d] shadow-[inset_3px_0_0_#1d9e75]";
  return "border-[#34322b]";
}

function gatePillClass(tone: "hold" | "watch" | "ready") {
  if (tone === "hold") return "border-[#6f2f2f] bg-[#2b1717] text-[#ff9a8f]";
  if (tone === "watch") return "border-[#6f5631] bg-[#211b12] text-[#e8c678]";
  return "border-[#294838] bg-[#13221b] text-[#9cccae]";
}

function gateMetricTextClass(tone: "normal" | "hold" | "watch" | "ready") {
  if (tone === "hold") return "text-[#ff9a8f]";
  if (tone === "watch") return "text-[#e8c678]";
  if (tone === "ready") return "text-[#9cccae]";
  return "text-[#f4f1e8]";
}

function formatInteger(value: number | null) {
  return value == null ? "--" : new Intl.NumberFormat("en-US").format(value);
}

function formatTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, String(value)), template);
}
