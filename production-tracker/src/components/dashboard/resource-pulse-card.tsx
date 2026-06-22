import Link from "next/link";

import type { Dictionary } from "@/lib/i18n";
import type { OverviewResourcePulse, OverviewResourcePulseGrade, OverviewResourcePulseSignal } from "@/lib/overview-resource-pulse";

type Labels = Dictionary["pages"]["overview"]["resourcePulse"];

export function ResourcePulseCard({
  pulse,
  labels,
}: {
  pulse: OverviewResourcePulse;
  labels: Labels;
}) {
  return (
    <section className="border border-[#34322b] bg-[#151410]">
      <div className="grid xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
        <div className="border-b border-[#34322b] p-5 xl:border-b-0 xl:border-r">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">{labels.eyebrow}</p>
              <h2 className="mt-3 text-2xl font-semibold text-[#f4f1e8]">{labels.title}</h2>
            </div>
            <span className={["shrink-0 border px-3 py-2 text-xs font-semibold", badgeClass(pulse.grade)].join(" ")}>
              {labels.grade[pulse.grade]}
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#aaa599]">{labels.description}</p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Metric label={labels.auditReadiness} value={`${pulse.auditReadinessPct}%`} tone={pulse.auditReadinessPct < 70 ? "hold" : pulse.auditReadinessPct < 88 ? "watch" : "clear"} />
            <Metric label={labels.blockedPayments} value={formatMoney(pulse.blockedPaymentTotal)} tone={pulse.blockedPaymentTotal > 0 ? "hold" : "clear"} />
            <Metric label={labels.reserve} value={formatMoney(pulse.reserve)} tone={pulse.reserve < 0 ? "hold" : pulse.committedBurnPct > 88 ? "watch" : "clear"} />
            <Metric label={labels.primaryRisk} value={pulse.primaryRiskLabel} tone={pulse.grade} />
          </div>
        </div>

        <div className="grid gap-4 p-4 2xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="border border-[#2f2d27] bg-[#11110f] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#69655c]">{labels.gradeLabel}</p>
                <p className={["mt-2 text-xl font-semibold", textClass(pulse.grade)].join(" ")}>{labels.grade[pulse.grade]}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-2xl text-[#f4f1e8]">{pulse.budgetBurnPct}%</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#69655c]">{labels.actualCost}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <BudgetRail label={labels.totalBudget} value={formatMoney(pulse.totalBudget)} pct={100} tone="clear" />
              <BudgetRail label={labels.actualCost} value={formatMoney(pulse.actualTotal)} pct={pulse.budgetBurnPct} tone={pulse.budgetBurnPct > 85 ? "watch" : "clear"} />
              <BudgetRail label={labels.committedCost} value={formatMoney(pulse.committedTotal)} pct={pulse.committedBurnPct} tone={pulse.committedBurnPct > 100 ? "hold" : pulse.committedBurnPct > 88 ? "watch" : "clear"} />
            </div>

            <div className="mt-5 border-t border-[#2f2d27] pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#69655c]">{labels.recommendation}</p>
              <p className="mt-2 text-sm leading-6 text-[#c9c3b5]">{pulse.recommendation}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={pulse.actionHref} className="h-9 border border-[#d8b46a]/45 bg-[#d8b46a]/10 px-3 py-2 text-xs font-semibold text-[#e8c678] transition hover:border-[#d8b46a]">
                {labels.openReport}
              </Link>
              <Link href={`/app/projects/${pulse.projectId}/resources`} className="h-9 border border-[#3f3c33] px-3 py-2 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]">
                {labels.openResources}
              </Link>
            </div>
          </div>

          <div className="border border-[#2f2d27] bg-[#11110f] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">{labels.signalsTitle}</p>
            <div className="mt-4 space-y-2">
              {pulse.signals.length > 0 ? (
                pulse.signals.slice(0, 5).map((signal) => <SignalRow key={signal.id} signal={signal} labels={labels} />)
              ) : (
                <p className="text-sm leading-6 text-[#8f8a7e]">{pulse.recommendation}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, tone = "clear" }: { label: string; value: string | number; tone?: OverviewResourcePulseGrade }) {
  return (
    <div className="border border-[#2f2d27] bg-[#11110f] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#69655c]">{label}</p>
      <p className={["mt-2 truncate font-mono text-2xl font-semibold tracking-[-0.03em]", textClass(tone)].join(" ")}>{value}</p>
    </div>
  );
}

function BudgetRail({
  label,
  value,
  pct,
  tone,
}: {
  label: string;
  value: string;
  pct: number;
  tone: OverviewResourcePulseGrade;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-[#8f8a7e]">{label}</span>
        <span className="font-mono text-[#f4f1e8]">{value}</span>
      </div>
      <div className="mt-2 h-2 bg-[#2a2a28]">
        <div className={["h-full", barClass(tone)].join(" ")} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
      </div>
    </div>
  );
}

function SignalRow({ signal, labels }: { signal: OverviewResourcePulseSignal; labels: Labels }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border border-[#2f2d27] bg-[#181713] px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-[#f4f1e8]">{labels.signalLabels[signal.kind]}</p>
        <p className={["mt-1 text-[10px] uppercase tracking-[0.14em]", textClass(signal.tone)].join(" ")}>{labels.signalTone[signal.tone]}</p>
      </div>
      <span className="font-mono text-sm text-[#c9c3b5]">{signal.kind === "blocked-payment" || signal.kind === "cash-reserve" ? formatMoney(signal.value) : signal.value}</span>
    </div>
  );
}

function formatMoney(value: number) {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `${sign}$${Math.round(abs / 1000)}K`;
  return `${sign}$${abs.toLocaleString()}`;
}

function badgeClass(tone: OverviewResourcePulseGrade) {
  if (tone === "hold") return "border-[#6f2f2f] bg-[#2b1717] text-[#ff9a8f]";
  if (tone === "watch") return "border-[#6f5631] bg-[#211b12] text-[#e8c678]";
  return "border-[#294838] bg-[#13221b] text-[#9cccae]";
}

function textClass(tone: OverviewResourcePulseGrade) {
  if (tone === "hold") return "text-[#ff9a8f]";
  if (tone === "watch") return "text-[#e8c678]";
  return "text-[#f4f1e8]";
}

function barClass(tone: OverviewResourcePulseGrade) {
  if (tone === "hold") return "bg-[#e24b4a]";
  if (tone === "watch") return "bg-[#ef9f27]";
  return "bg-[#1d9e75]";
}
