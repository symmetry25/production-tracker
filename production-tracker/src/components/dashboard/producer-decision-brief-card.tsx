import Link from "next/link";

import type { Dictionary } from "@/lib/i18n";
import type { ProducerDecisionBrief, ProducerDecisionBriefItem } from "@/lib/producer-decision-brief";

type Labels = Dictionary["pages"]["overview"]["decisionBrief"];

export function ProducerDecisionBriefCard({
  brief,
  labels,
}: {
  brief: ProducerDecisionBrief;
  labels: Labels;
}) {
  return (
    <section className="border border-[#34322b] bg-[#151410]">
      <div className="grid xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="border-b border-[#34322b] p-5 xl:border-b-0 xl:border-r">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">{labels.eyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold text-[#f4f1e8]">{labels.title}</h2>
          <p className="mt-3 text-sm leading-6 text-[#aaa599]">{labels.description}</p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <BriefMetric label={labels.hold} value={brief.holdCount} tone={brief.holdCount > 0 ? "hold" : "clear"} />
            <BriefMetric label={labels.watch} value={brief.watchCount} tone={brief.watchCount > 0 ? "watch" : "clear"} />
          </div>
        </div>

        <div className="min-w-0 p-4">
          {brief.items.length > 0 ? (
            <div className="grid gap-3 2xl:grid-cols-2">
              {brief.items.map((item, index) => (
                <DecisionItem key={item.id} item={item} index={index} labels={labels} />
              ))}
            </div>
          ) : (
            <p className="border border-[#2f2d27] bg-[#11110f] p-5 text-sm text-[#8f8a7e]">{labels.empty}</p>
          )}
        </div>
      </div>
    </section>
  );
}

function DecisionItem({
  item,
  index,
  labels,
}: {
  item: ProducerDecisionBriefItem;
  index: number;
  labels: Labels;
}) {
  return (
    <Link href={item.href} className="grid min-h-28 grid-cols-[42px_minmax(0,1fr)_auto] gap-3 border border-[#2f2d27] bg-[#11110f] p-3 transition hover:border-[#d8b46a]/55 hover:bg-[#181713]">
      <div className={["grid size-10 place-items-center border font-mono text-sm", badgeClass(item.tone)].join(" ")}>
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={["border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]", badgeClass(item.tone)].join(" ")}>
            {labels.kindLabels[item.kind]}
          </span>
          <span className={["text-[10px] font-semibold uppercase tracking-[0.14em]", textClass(item.tone)].join(" ")}>{labels.toneLabels[item.tone]}</span>
        </div>
        <p className="mt-2 truncate text-sm font-semibold text-[#f4f1e8]">{item.title}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#9f9b8f]">{item.detail}</p>
      </div>
      <div className="flex min-w-16 flex-col items-end justify-between gap-3">
        <span className="font-mono text-xs text-[#8f8a7e]">{item.meta}</span>
        <span className="text-xs font-semibold text-[#e8c678]">{labels.open}</span>
      </div>
    </Link>
  );
}

function BriefMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: ProducerDecisionBriefItem["tone"];
}) {
  return (
    <div className="border border-[#2f2d27] bg-[#11110f] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#69655c]">{label}</p>
      <p className={["mt-1 font-mono text-lg", textClass(tone)].join(" ")}>{value}</p>
    </div>
  );
}

function badgeClass(tone: ProducerDecisionBriefItem["tone"]) {
  if (tone === "hold") return "border-[#6f2f2f] bg-[#2b1717] text-[#ff9a8f]";
  if (tone === "watch") return "border-[#6f5631] bg-[#211b12] text-[#e8c678]";
  return "border-[#294838] bg-[#13221b] text-[#9cccae]";
}

function textClass(tone: ProducerDecisionBriefItem["tone"]) {
  if (tone === "hold") return "text-[#ff9a8f]";
  if (tone === "watch") return "text-[#e8c678]";
  return "text-[#9cccae]";
}
