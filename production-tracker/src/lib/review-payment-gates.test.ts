import { describe, expect, it } from "vitest";

import { VersionStatus } from "@/generated/prisma/enums";
import { buildReviewPaymentGateSummary } from "@/lib/review-payment-gates";
import type { ReviewVersionItem } from "@/lib/review-data";

describe("buildReviewPaymentGateSummary", () => {
  it("prioritizes held supplier versions before ready-to-pay versions", () => {
    const summary = buildReviewPaymentGateSummary([
      makeVersion({
        id: "approved",
        name: "RAID_0010_CMP_v002",
        status: VersionStatus.APPROVED,
        gateStatus: "ready",
        createdAt: "2026-05-12T12:05:00.000Z",
        notes: 1,
      }),
      makeVersion({
        id: "pending",
        name: "VFX_0300_RainComp_v003",
        status: VersionStatus.PENDING_REVIEW,
        gateStatus: "hold",
        createdAt: "2026-06-08T16:40:00.000Z",
        notes: 2,
      }),
      makeVersion({
        id: "changes",
        name: "RAID_0030_LGT_v001",
        status: VersionStatus.CHANGES_REQUESTED,
        gateStatus: "hold",
        createdAt: "2026-05-15T21:35:00.000Z",
        notes: 1,
      }),
    ]);

    expect(summary.tone).toBe("hold");
    expect(summary.counts).toEqual({ total: 3, hold: 2, watch: 0, ready: 1, notes: 4 });
    expect(summary.action).toContain("2");
    expect(summary.action).toContain("暂缓付款");
    expect(summary.items.map((item) => item.id)).toEqual(["pending", "changes", "approved"]);
    expect(summary.items[0]).toEqual(
      expect.objectContaining({
        name: "VFX_0300_RainComp_v003",
        gateStatus: "hold",
        noteCount: 2,
        versionLabel: "v003",
      }),
    );
  });
});

function makeVersion({
  id,
  name,
  status,
  gateStatus,
  createdAt,
  notes,
}: {
  id: string;
  name: string;
  status: VersionStatus;
  gateStatus: "hold" | "watch" | "ready";
  createdAt: string;
  notes: number;
}): ReviewVersionItem {
  return {
    id,
    projectId: "demo-project",
    number: Number(name.match(/v(\d+)/i)?.[1] ?? 1),
    name,
    status,
    fileUrl: "/demo.mp4",
    fileType: "video/mp4",
    thumbnailUrl: null,
    description: null,
    frameCount: 240,
    fps: 24,
    createdAt,
    uploadedBy: { id: "uploader", name: "Vendor Producer", department: "VFX" },
    task: { id: `${id}-task`, name: "CMP", contextLabel: "RAID_0010", contextType: "shot" },
    paymentGate: {
      status: gateStatus,
      label: gateStatus === "ready" ? "可付款" : "暂缓付款",
      detail: gateStatus === "ready" ? "版本已通过，可进入付款审批。" : "版本未闭环，供应商付款暂缓。",
    },
    notes: Array.from({ length: notes }, (_, index) => ({
      id: `${id}-note-${index}`,
      content: "review note",
      createdAt,
      author: { id: "producer", name: "Producer", department: "制片组" },
    })),
  };
}
