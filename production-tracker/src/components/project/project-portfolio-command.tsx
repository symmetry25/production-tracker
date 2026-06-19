import Link from "next/link";

import { formatUtcDate } from "@/lib/date-format";
import type { Dictionary } from "@/lib/i18n";
import type { ProjectPortfolio, ProjectPortfolioHealth, ProjectPortfolioItem } from "@/lib/project-portfolio";

type PortfolioLabels = Dictionary["pages"]["projects"]["portfolio"];

export function ProjectPortfolioCommand({ portfolio, labels }: { portfolio: ProjectPortfolio; labels: PortfolioLabels }) {
  const nextMilestone = portfolio.nextMilestone;

  return (
    <section className="mb-6 border border-[#34322b] bg-[#151410]">
      <div className="grid border-b border-[#34322b] xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.45fr)]">
        <div className="border-b border-[#34322b] p-5 xl:border-b-0 xl:border-r">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">{labels.eyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold text-[#f4f1e8]">{labels.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#aaa599]">{labels.description}</p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <PortfolioMetric label={labels.activeProjects} value={portfolio.projectCount} />
            <PortfolioMetric label={labels.atRiskProjects} value={portfolio.atRiskCount} tone={portfolio.atRiskCount > 0 ? "hold" : "clear"} />
            <PortfolioMetric label={labels.budgetBurn} value={`${portfolio.budgetBurnPct}%`} tone={portfolio.budgetBurnPct > 85 ? "watch" : "clear"} />
            <PortfolioMetric label={labels.blockedPayments} value={formatMoney(portfolio.blockedPaymentTotal)} tone={portfolio.blockedPaymentTotal > 0 ? "hold" : "clear"} />
          </div>
        </div>

        <div className="grid gap-4 p-4 2xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 overflow-x-auto border border-[#2f2d27] bg-[#11110f]">
            <div className="min-w-[660px]">
              <div className="grid grid-cols-[minmax(190px,1.25fr)_110px_120px_110px_130px] border-b border-[#2f2d27] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#69655c]">
                <span>{labels.columns.project}</span>
                <span>{labels.columns.progress}</span>
                <span>{labels.columns.budget}</span>
                <span>{labels.columns.audit}</span>
                <span>{labels.columns.milestone}</span>
              </div>
              {portfolio.items.length > 0 ? (
                <div className="divide-y divide-[#24231f]">
                  {portfolio.items.slice(0, 5).map((project) => (
                    <PortfolioRow key={project.id} project={project} labels={labels} />
                  ))}
                </div>
              ) : (
                <p className="px-4 py-8 text-sm text-[#8f8a7e]">{labels.empty}</p>
              )}
            </div>
          </div>

          <div className="border border-[#2f2d27] bg-[#11110f] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">{labels.nextMilestone}</p>
            {nextMilestone ? (
              <>
                <div className="mt-4">
                  <p className="truncate text-lg font-semibold text-[#f4f1e8]">{nextMilestone.milestone ?? labels.noMilestone}</p>
                  <p className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-[#8f8a7e]">{nextMilestone.code} · {formatUtcDate(nextMilestone.milestoneDate)}</p>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <MiniStatus label={labels.missingDocs} value={portfolio.missingDocumentCount} tone={portfolio.missingDocumentCount > 0 ? "watch" : "clear"} />
                  <MiniStatus label={labels.actionLabel} value={labels.actionKinds[nextMilestone.actionKind]} tone={nextMilestone.health} />
                </div>
                <div className="mt-4 h-2 bg-[#2a2a28]">
                  <div className={["h-full", barClass(nextMilestone.health)].join(" ")} style={{ width: `${Math.min(100, nextMilestone.progress)}%` }} />
                </div>
                <p className="mt-3 text-xs text-[#8f8a7e]">{formatDays(nextMilestone.milestoneDaysRemaining ?? nextMilestone.daysRemaining, labels)}</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <QuickLink href={`/app/projects/${nextMilestone.id}/overview`} label={labels.quickLinks.overview} />
                  <QuickLink href={`/app/projects/${nextMilestone.id}/resources/report`} label={labels.quickLinks.report} />
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-[#8f8a7e]">{labels.noMilestone}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function PortfolioRow({ project, labels }: { project: ProjectPortfolioItem; labels: PortfolioLabels }) {
  return (
    <div className="grid grid-cols-[minmax(190px,1.25fr)_110px_120px_110px_130px] items-center gap-0 px-3 py-3 text-sm hover:bg-[#181713]">
      <div className="min-w-0 pr-3">
        <div className="flex items-center gap-2">
          <span className={["size-2 shrink-0", dotClass(project.health)].join(" ")} />
          <Link href={`/app/projects/${project.id}/overview`} className="truncate font-semibold text-[#f4f1e8] hover:text-[#e8c678]">
            {project.name}
          </Link>
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-[#69655c]">{project.code}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]">
          <QuickInline href={`/app/projects/${project.id}/overview`} label={labels.quickLinks.overview} />
          <QuickInline href={`/app/projects/${project.id}/resources`} label={labels.quickLinks.resources} />
          <QuickInline href={`/app/projects/${project.id}/resources/report`} label={labels.quickLinks.report} />
          <QuickInline href={`/app/projects/${project.id}/tasks`} label={labels.quickLinks.tasks} />
        </div>
      </div>

      <div className="pr-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-[#f4f1e8]">{project.progress}%</span>
          <span className={["border px-1.5 py-0.5 text-[10px] font-semibold", badgeClass(project.health)].join(" ")}>{labels.health[project.health]}</span>
        </div>
        <div className="mt-2 h-1.5 bg-[#2a2a28]">
          <div className={["h-full", barClass(project.health)].join(" ")} style={{ width: `${Math.min(100, project.progress)}%` }} />
        </div>
      </div>

      <div className="font-mono text-xs text-[#c9c3b5]">
        <p>{formatMoney(project.actualTotal)}</p>
        <p className="mt-1 text-[#69655c]">{project.committedBurnPct}% committed</p>
      </div>

      <div className="font-mono text-xs">
        <p className={project.blockedPaymentTotal > 0 ? "text-[#ff9a8f]" : "text-[#9cccae]"}>{formatMoney(project.blockedPaymentTotal)}</p>
        <p className="mt-1 text-[#69655c]">{project.missingDocumentCount} docs</p>
      </div>

      <div className="min-w-0 text-xs">
        <p className="truncate text-[#c9c3b5]">{project.milestone ?? labels.noMilestone}</p>
        <p className="mt-1 font-mono text-[#69655c]">{formatDays(project.milestoneDaysRemaining ?? project.daysRemaining, labels)}</p>
      </div>
    </div>
  );
}

function PortfolioMetric({ label, value, tone = "clear" }: { label: string; value: string | number; tone?: ProjectPortfolioHealth }) {
  return (
    <div className="border border-[#2f2d27] bg-[#11110f] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#69655c]">{label}</p>
      <p className={["mt-1 font-mono text-lg", textClass(tone)].join(" ")}>{value}</p>
    </div>
  );
}

function MiniStatus({ label, value, tone = "clear" }: { label: string; value: string | number; tone?: ProjectPortfolioHealth }) {
  return (
    <div className="border border-[#2f2d27] bg-[#181713] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#69655c]">{label}</p>
      <p className={["mt-1 truncate text-sm font-semibold", textClass(tone)].join(" ")}>{value}</p>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="grid h-9 place-items-center border border-[#3f3c33] text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]">
      {label}
    </Link>
  );
}

function QuickInline({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="border border-[#34322b] bg-[#161511] px-2 py-1 text-[#8f8a7e] transition hover:border-[#d8b46a]/55 hover:text-[#e8c678]">
      {label}
    </Link>
  );
}

function formatDays(days: number, labels: PortfolioLabels) {
  if (days < 0) return formatTemplate(labels.overdueDays, { days: Math.abs(days) });
  if (days === 0) return labels.dueToday;
  return formatTemplate(labels.dueInDays, { days });
}

function formatMoney(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `$${Math.round(value / 1000)}K`;
  return `$${value.toLocaleString()}`;
}

function formatTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, String(value)), template);
}

function dotClass(tone: ProjectPortfolioHealth) {
  if (tone === "hold") return "bg-[#e24b4a]";
  if (tone === "watch") return "bg-[#ef9f27]";
  return "bg-[#1d9e75]";
}

function barClass(tone: ProjectPortfolioHealth) {
  if (tone === "hold") return "bg-[#e24b4a]";
  if (tone === "watch") return "bg-[#ef9f27]";
  return "bg-[#1d9e75]";
}

function badgeClass(tone: ProjectPortfolioHealth) {
  if (tone === "hold") return "border-[#6f2f2f] bg-[#2b1717] text-[#ff9a8f]";
  if (tone === "watch") return "border-[#6f5631] bg-[#211b12] text-[#e8c678]";
  return "border-[#294838] bg-[#13221b] text-[#9cccae]";
}

function textClass(tone: ProjectPortfolioHealth) {
  if (tone === "hold") return "text-[#ff9a8f]";
  if (tone === "watch") return "text-[#e8c678]";
  return "text-[#f4f1e8]";
}
