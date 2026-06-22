import Link from "next/link";

import type { TaskStatus } from "@/generated/prisma/enums";
import type { DashboardStats, VersionStatusDatum } from "@/lib/dashboard-data";
import type { Dictionary } from "@/lib/i18n";
import type { ScheduleSuggestionSummary } from "@/lib/schedule-suggestions";
import type { TaskTableItem } from "@/lib/task-data";

type Tone = "normal" | "warn" | "danger";
type Labels = Dictionary["pages"]["overview"]["producerCommand"];

type FinanceSummary = {
  actual: number;
  bid: number;
  risk: number;
  burnPct: number;
  tone: Tone;
};

type DeliverySummary = {
  openTasks: number;
  tone: Tone;
  headline: string;
  narrative: string;
};

type ProducerAction = {
  id: string;
  label: string;
  tone: Tone;
  title: string;
  meta: string;
  href: string;
};

const completeStatuses: TaskStatus[] = ["APPROVED", "FINAL", "OMIT"];

export function ProducerCommandCenter({
  projectId,
  stats,
  tasks,
  scheduleSummary,
  labels,
}: {
  projectId: string;
  stats: DashboardStats;
  tasks: TaskTableItem[];
  scheduleSummary: ScheduleSuggestionSummary;
  labels: Labels;
}) {
  const finance = buildFinanceSummary(tasks);
  const delivery = buildDeliverySummary(stats, tasks, scheduleSummary, labels);
  const topActions = buildTopActions(projectId, stats, scheduleSummary, finance, labels);
  const reviewQueue = getPendingReviewCount(stats.versionStatus);
  const overloadedCrew = stats.crew.filter((member) => member.loadPct > 100).length;
  const financeRecommendation = buildFinanceRecommendation(finance, labels);

  return (
    <section className="border border-[#34322b] bg-[#151512]">
      <div className="grid border-b border-[#34322b] xl:grid-cols-[minmax(320px,0.95fr)_minmax(0,1.35fr)]">
        <div className="border-b border-[#34322b] p-5 xl:border-b-0 xl:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">{labels.eyebrow}</p>
              <h2 className="mt-3 text-2xl font-semibold text-[#f4f1e8]">{delivery.headline}</h2>
            </div>
            <span className={["border px-3 py-2 font-mono text-sm", healthClass(delivery.tone)].join(" ")}>{scheduleSummary.healthScore}</span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#aaa599]">{delivery.narrative}</p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Signal label={labels.scheduleHealth} value={`${scheduleSummary.healthScore}/100`} tone={delivery.tone} />
            <Signal label={labels.budgetBurn} value={`${finance.burnPct}%`} tone={finance.tone} />
            <Signal label={labels.reviewQueue} value={reviewQueue} tone={reviewQueue > 0 ? "warn" : "normal"} />
            <Signal label={labels.overloadedCrew} value={overloadedCrew} tone={overloadedCrew > 0 ? "danger" : "normal"} />
          </div>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 border border-[#2f2d27] bg-[#11110f]">
            <div className="flex items-center justify-between border-b border-[#2f2d27] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">{labels.decisions}</p>
              <span className="text-xs text-[#8f8a7e]">{formatTemplate(labels.actionsCount, { count: topActions.length })}</span>
            </div>
            <div className="divide-y divide-[#24231f]">
              {topActions.length ? (
                topActions.map((item) => (
                  <Link key={item.id} href={item.href} className="grid gap-3 px-4 py-3 text-sm hover:bg-[#181713] lg:grid-cols-[96px_minmax(0,1fr)_120px]">
                    <span className={["w-fit border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]", toneClass(item.tone)].join(" ")}>{item.label}</span>
                    <span className="min-w-0 truncate text-[#f4f1e8]">{item.title}</span>
                    <span className="text-right font-mono text-xs text-[#8f8a7e]">{item.meta}</span>
                  </Link>
                ))
              ) : (
                <ProducerActionEmptyState projectId={projectId} labels={labels} />
              )}
            </div>
          </div>

          <div className="border border-[#2f2d27] bg-[#11110f] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">{labels.budgetCorridor}</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="font-mono text-2xl text-[#f4f1e8]">{formatCurrency(finance.actual)}</p>
                <p className="mt-1 text-xs text-[#8f8a7e]">{labels.loggedCost}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-[#aaa599]">{formatCurrency(finance.bid)}</p>
                <p className="mt-1 text-xs text-[#8f8a7e]">{labels.approvedBid}</p>
              </div>
            </div>
            <div className="mt-4 h-2 bg-[#2a2a28]">
              <div className={["h-full", finance.tone === "danger" ? "bg-[#e24b4a]" : finance.tone === "warn" ? "bg-[#ef9f27]" : "bg-[#1d9e75]"].join(" ")} style={{ width: `${Math.min(100, finance.burnPct)}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Mini label={labels.atRisk} value={formatCurrency(finance.risk)} tone={finance.risk > 0 ? "danger" : "normal"} />
              <Mini label={labels.openTasks} value={delivery.openTasks} tone={delivery.openTasks > 0 ? "warn" : "normal"} />
            </div>
            <div className="mt-4 border-t border-[#2f2d27] pt-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#69655c]">{labels.producerNote}</p>
              <p className={["mt-2 text-xs leading-5", textClass(finance.tone)].join(" ")}>{financeRecommendation}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid border-t border-[#2a2a28] md:grid-cols-4">
        <FooterSignal label={labels.milestone} value={stats.project.milestone ?? "--"} detail={stats.project.milestoneDate?.slice(0, 10) ?? labels.dateUnset} />
        <FooterSignal label={labels.criticalSchedule} value={scheduleSummary.criticalCount} detail={formatTemplate(labels.watchItems, { count: scheduleSummary.warningCount })} tone={scheduleSummary.criticalCount > 0 ? "danger" : "normal"} />
        <FooterSignal label={labels.deliveryProgress} value={`${stats.project.progressPct}%`} detail={formatTemplate(labels.daysRemaining, { days: stats.project.daysRemaining })} tone={stats.project.daysRemaining < 21 ? "warn" : "normal"} />
        <FooterSignal label={labels.versions} value={stats.counts.versions} detail={formatTemplate(labels.pendingReview, { count: reviewQueue })} tone={reviewQueue > 0 ? "warn" : "normal"} />
      </div>
    </section>
  );
}

function ProducerActionEmptyState({ projectId, labels }: { projectId: string; labels: Labels }) {
  return (
    <div className="p-4">
      <div className="border border-dashed border-[#3f3c33] bg-[#151410] p-4">
        <p className="text-sm font-semibold text-[#f4f1e8]">{labels.emptyTitle}</p>
        <p className="mt-2 text-xs leading-5 text-[#8f8a7e]">{labels.emptyHint}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/app/projects/${projectId}/tasks`} className="border border-[#34322b] px-3 py-2 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]">
            {labels.emptyLinks.tasks}
          </Link>
          <Link href={`/app/projects/${projectId}/media`} className="border border-[#34322b] px-3 py-2 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]">
            {labels.emptyLinks.media}
          </Link>
          <Link href={`/app/projects/${projectId}/resources`} className="border border-[#34322b] px-3 py-2 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]">
            {labels.emptyLinks.resources}
          </Link>
        </div>
      </div>
    </div>
  );
}

function buildFinanceSummary(tasks: TaskTableItem[]): FinanceSummary {
  const actual = tasks.reduce((sum, task) => sum + task.calculatedCost, 0);
  const bid = tasks.reduce((sum, task) => sum + (task.estimatedCost ?? 0), 0);
  const risk = tasks.reduce((sum, task) => sum + (task.overBudget ? task.calculatedCost - (task.estimatedCost ?? 0) : 0), 0);
  const burnPct = bid ? Math.round((actual / bid) * 100) : 0;
  const tone: Tone = risk > 0 || burnPct > 92 ? "danger" : burnPct > 78 ? "warn" : "normal";

  return {
    actual,
    bid,
    risk,
    burnPct,
    tone,
  };
}

function buildDeliverySummary(stats: DashboardStats, tasks: TaskTableItem[], scheduleSummary: ScheduleSuggestionSummary, labels: Labels): DeliverySummary {
  const openTasks = tasks.filter((task) => !completeStatuses.includes(task.status)).length;
  const tone: Tone = scheduleSummary.criticalCount > 0 ? "danger" : scheduleSummary.warningCount > 0 ? "warn" : "normal";
  const milestone = stats.project.milestone ?? labels.milestone;

  return {
    openTasks,
    tone,
    headline: labels.healthHeadlines[tone],
    narrative:
      tone === "danger"
        ? formatTemplate(labels.healthNarratives.danger, { critical: scheduleSummary.criticalCount, milestone })
        : tone === "warn"
          ? formatTemplate(labels.healthNarratives.warn, { warning: scheduleSummary.warningCount })
          : labels.healthNarratives.normal,
  };
}

function buildTopActions(projectId: string, stats: DashboardStats, scheduleSummary: ScheduleSuggestionSummary, finance: FinanceSummary, labels: Labels): ProducerAction[] {
  const scheduleActions: ProducerAction[] = scheduleSummary.suggestions.slice(0, 3).map((item) => ({
    id: item.id,
    label: labels.actionLabels[item.severity],
    tone: item.severity === "critical" ? "danger" : item.severity === "warning" ? "warn" : "normal",
    title: formatTemplate(labels.scheduleActions[item.kind], { context: item.contextLabel }),
    meta: item.budgetImpact > 0 ? formatCurrency(item.budgetImpact) : `${item.impactDays}d`,
    href: `/app/projects/${projectId}/tasks?task=${encodeURIComponent(item.taskId)}`,
  }));

  const financeAction: ProducerAction[] =
    finance.risk > 0
      ? [
          {
            id: "budget-risk",
            label: labels.actionLabels.budget,
            tone: "danger",
            title: formatTemplate(labels.actionTitles.budget, { amount: formatCurrency(finance.risk) }),
            meta: formatTemplate(labels.actionMeta.burn, { burnPct: finance.burnPct }),
            href: `/app/projects/${projectId}/resources`,
          },
        ]
      : [];

  const reviewQueue = getPendingReviewCount(stats.versionStatus);
  const reviewAction: ProducerAction[] =
    reviewQueue > 0
      ? [
          {
            id: "review-queue",
            label: labels.actionLabels.review,
            tone: "warn",
            title: formatTemplate(labels.actionTitles.review, { count: reviewQueue }),
            meta: formatTemplate(labels.actionMeta.items, { count: reviewQueue }),
            href: `/app/projects/${projectId}/media`,
          },
        ]
      : [];

  return [...financeAction, ...reviewAction, ...scheduleActions].slice(0, 5);
}

function buildFinanceRecommendation(finance: FinanceSummary, labels: Labels) {
  if (finance.risk > 0) {
    return formatTemplate(labels.financeRecommendations.freeze, { amount: formatCurrency(finance.risk) });
  }

  if (finance.tone === "warn") {
    return formatTemplate(labels.financeRecommendations.watch, { burnPct: finance.burnPct });
  }

  return labels.financeRecommendations.stable;
}

function getPendingReviewCount(versionStatus: VersionStatusDatum[]) {
  return versionStatus.find((item) => item.status === "PENDING_REVIEW")?.value ?? 0;
}

function Signal({ label, value, tone = "normal" }: { label: string; value: string | number; tone?: Tone }) {
  return (
    <div className="border border-[#2f2d27] bg-[#11110f] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#69655c]">{label}</p>
      <p className={["mt-1 font-mono text-lg", textClass(tone)].join(" ")}>{value}</p>
    </div>
  );
}

function Mini({ label, value, tone = "normal" }: { label: string; value: string | number; tone?: Tone }) {
  return (
    <div className="border border-[#2f2d27] bg-[#181713] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#69655c]">{label}</p>
      <p className={["mt-1 font-mono text-sm", textClass(tone)].join(" ")}>{value}</p>
    </div>
  );
}

function FooterSignal({ label, value, detail, tone = "normal" }: { label: string; value: string | number; detail: string; tone?: Tone }) {
  return (
    <div className="border-b border-r border-[#34322b] px-4 py-3 last:border-r-0 md:border-b-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">{label}</p>
      <p className={["mt-1 truncate font-mono text-base", textClass(tone)].join(" ")}>{value}</p>
      <p className="mt-1 truncate text-xs text-[#8f8a7e]">{detail}</p>
    </div>
  );
}

function toneClass(tone: Tone) {
  if (tone === "danger") return "border-[#6f2f2f] bg-[#2b1717] text-[#ff9a8f]";
  if (tone === "warn") return "border-[#6f5631] bg-[#211b12] text-[#e8c678]";
  return "border-[#294838] bg-[#13221b] text-[#9cccae]";
}

function healthClass(tone: Tone) {
  if (tone === "danger") return "border-[#6f2f2f] bg-[#2b1717] text-[#ff9a8f]";
  if (tone === "warn") return "border-[#6f5631] bg-[#211b12] text-[#e8c678]";
  return "border-[#294838] bg-[#13221b] text-[#9cccae]";
}

function textClass(tone: Tone) {
  if (tone === "danger") return "text-[#ff9a8f]";
  if (tone === "warn") return "text-[#e8c678]";
  return "text-[#f4f1e8]";
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString()}`;
}

function formatTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, String(value)), template);
}
