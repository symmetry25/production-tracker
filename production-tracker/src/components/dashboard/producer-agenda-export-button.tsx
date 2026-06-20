"use client";

import type { DashboardStats } from "@/lib/dashboard-data";
import { downloadCsv, downloadXlsx } from "@/lib/csv";
import type { OverviewResourcePulse } from "@/lib/overview-resource-pulse";
import { buildProducerAgendaRows } from "@/lib/producer-agenda-export";
import type { ProducerDecisionBrief } from "@/lib/producer-decision-brief";
import type { ScheduleSuggestionSummary } from "@/lib/schedule-suggestions";

export function ProducerAgendaExportButton({
  stats,
  resourcePulse,
  decisionBrief,
  scheduleSummary,
  label,
}: {
  stats: DashboardStats;
  resourcePulse: OverviewResourcePulse;
  decisionBrief: ProducerDecisionBrief;
  scheduleSummary: ScheduleSuggestionSummary;
  label: string;
}) {
  const rows = buildProducerAgendaRows({ stats, resourcePulse, decisionBrief, scheduleSummary });
  const filename = `producer-agenda-${stats.project.code}`;

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => downloadCsv(`${filename}.csv`, rows)}
        className="h-10 border border-[#3f3c33] px-3 text-xs text-[#aaa599] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
      >
        {label} CSV
      </button>
      <button
        type="button"
        onClick={() => downloadXlsx(`${filename}.xlsx`, rows, "Producer Agenda")}
        className="h-10 border-y border-r border-[#3f3c33] px-3 text-xs text-[#aaa599] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
      >
        XLSX
      </button>
    </div>
  );
}
