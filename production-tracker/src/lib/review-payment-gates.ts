import type { VersionStatus } from "@/generated/prisma/enums";
import type { ReviewVersionItem } from "@/lib/review-data";

export type ReviewPaymentGateTone = "hold" | "watch" | "ready" | "empty";

export type ReviewPaymentGateSummaryItem = {
  id: string;
  name: string;
  contextLabel: string;
  taskName: string;
  status: VersionStatus;
  gateStatus: "hold" | "watch" | "ready";
  gateLabel: string;
  gateDetail: string;
  uploadedBy: string;
  uploadedDepartment: string | null;
  thumbnailUrl: string | null;
  frameCount: number | null;
  fps: number | null;
  noteCount: number;
  createdAt: string;
  versionLabel: string;
};

export type ReviewPaymentGateSummary = {
  tone: ReviewPaymentGateTone;
  action: string;
  counts: {
    total: number;
    hold: number;
    watch: number;
    ready: number;
    notes: number;
  };
  items: ReviewPaymentGateSummaryItem[];
};

export function buildReviewPaymentGateSummary(versions: ReviewVersionItem[]): ReviewPaymentGateSummary {
  const items = versions
    .map((version): ReviewPaymentGateSummaryItem => ({
      id: version.id,
      name: version.name,
      contextLabel: version.task.contextLabel,
      taskName: version.task.name,
      status: version.status,
      gateStatus: version.paymentGate.status,
      gateLabel: version.paymentGate.label,
      gateDetail: version.paymentGate.detail,
      uploadedBy: version.uploadedBy.name,
      uploadedDepartment: version.uploadedBy.department,
      thumbnailUrl: version.thumbnailUrl,
      frameCount: version.frameCount,
      fps: version.fps,
      noteCount: version.notes.length,
      createdAt: version.createdAt,
      versionLabel: `v${String(version.number).padStart(3, "0")}`,
    }))
    .sort((left, right) => paymentGateRank(left.gateStatus) - paymentGateRank(right.gateStatus) || new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

  const counts = items.reduce(
    (summary, item) => ({
      total: summary.total + 1,
      hold: summary.hold + (item.gateStatus === "hold" ? 1 : 0),
      watch: summary.watch + (item.gateStatus === "watch" ? 1 : 0),
      ready: summary.ready + (item.gateStatus === "ready" ? 1 : 0),
      notes: summary.notes + item.noteCount,
    }),
    { total: 0, hold: 0, watch: 0, ready: 0, notes: 0 },
  );

  return {
    tone: getSummaryTone(counts),
    action: buildSummaryAction(counts),
    counts,
    items,
  };
}

function paymentGateRank(status: "hold" | "watch" | "ready") {
  if (status === "hold") return 0;
  if (status === "watch") return 1;
  return 2;
}

function getSummaryTone(counts: ReviewPaymentGateSummary["counts"]): ReviewPaymentGateTone {
  if (counts.hold > 0) return "hold";
  if (counts.watch > 0) return "watch";
  if (counts.ready > 0) return "ready";
  return "empty";
}

function buildSummaryAction(counts: ReviewPaymentGateSummary["counts"]) {
  if (counts.hold > 0) return `先处理 ${counts.hold} 个暂缓付款版本`;
  if (counts.watch > 0) return `确认 ${counts.watch} 个排队观察版本`;
  if (counts.ready > 0) return `推进 ${counts.ready} 个可付款版本`;
  return "暂无供应商付款关口";
}
