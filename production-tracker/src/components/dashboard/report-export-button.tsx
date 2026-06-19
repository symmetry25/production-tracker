"use client";

import type { DashboardStats } from "@/lib/dashboard-data";
import { downloadCsv, downloadXlsx } from "@/lib/csv";

export function ReportExportButton({ stats, label }: { stats: DashboardStats; label: string }) {
  const rows = buildReportRows(stats);

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => downloadCsv(`production-report-${stats.project.code}.csv`, rows)}
        className="h-10 border border-[#3f3c33] px-3 text-xs text-[#aaa599] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
      >
        {label} CSV
      </button>
      <button
        type="button"
        onClick={() => downloadXlsx(`production-report-${stats.project.code}.xlsx`, rows, "Producer Report")}
        className="h-10 border-y border-r border-[#3f3c33] px-3 text-xs text-[#aaa599] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
      >
        XLSX
      </button>
    </div>
  );
}

function buildReportRows(stats: DashboardStats) {
  return [
    ["section", "metric", "value", "detail"],
    ["project", "name", stats.project.name, stats.project.code],
    ["project", "progress_pct", stats.project.progressPct, stats.project.milestone ?? ""],
    ["project", "days_remaining", stats.project.daysRemaining, stats.project.milestoneDate ?? ""],
    ["counts", "shots", stats.counts.shots, ""],
    ["counts", "assets", stats.counts.assets, ""],
    ["counts", "tasks", stats.counts.tasks, ""],
    ["counts", "versions", stats.counts.versions, ""],
    ["counts", "crew", stats.counts.crew, ""],
    ...stats.shotStatus.map((row) => ["shot_status", row.name, row.value, ""]),
    ...stats.versionStatus.map((row) => ["version_status", row.label, row.value, row.status]),
    ...stats.pctFinalByDept.map((row) => ["pct_final_by_dept", row.department, `${row.pctFinal}%`, `${row.final}/${row.total}`]),
    ...stats.crew.map((row) => ["crew", row.name, row.taskCount, `${row.department} · ${row.role} · load ${row.loadPct}%`]),
  ];
}
