import { describe, expect, it } from "vitest";

import type { ResourceBudgetData } from "@/lib/resource-data";
import { buildResourceAuditLedger, sortResourceLedgerEntries, type ResourceLedgerEntry } from "@/lib/resource-ledger";

describe("buildResourceAuditLedger", () => {
  it("creates an audit ledger from payments, vendors, documents and department exposure", () => {
    const data: ResourceBudgetData = {
      project: {
        id: "ledger-project",
        name: "Ledger Project",
        totalBudget: 1000,
        actualTotal: 600,
        committedTotal: 1100,
      },
      departments: [
        { id: "camera", name: "摄影组", budget: 400, committed: 460, actual: 430, risk: "over", color: "#c84c39" },
        { id: "dit", name: "DIT组", budget: 260, committed: 220, actual: 180, risk: "ok", color: "#4f7f9b" },
      ],
      people: [],
      vendors: [
        { id: "vendor-camera", name: "Camera Vendor", category: "equipment", owner: "摄影组", amount: 320, status: "review", progress: 48, auditFlag: "缺交付确认" },
      ],
      payments: [
        { id: "pay-camera", vendorId: "vendor-camera", vendorName: "Camera Vendor", label: "镜头包尾款", dueDate: "2026-06-20", amount: 120, status: "blocked", gate: "缺交付确认" },
      ],
      documents: [
        { id: "doc-camera", owner: "Camera Vendor", category: "器材", required: 5, received: 2, missing: ["签收", "发票", "升级说明"], severity: "over" },
      ],
      insights: [],
      fundFlow: [],
    };

    const ledger = buildResourceAuditLedger(data, "2026-06-18");

    expect(ledger.holdCount).toBe(3);
    expect(ledger.watchCount).toBe(1);
    expect(ledger.exposureAmount).toBe(180);
    expect(ledger.missingEvidenceCount).toBe(3);
    expect(ledger.nextOwner).toBe("Camera Vendor");
    expect(ledger.entries.map((entry) => entry.id)).toEqual([
      "payment-pay-camera",
      "document-doc-camera",
      "department-camera",
      "vendor-vendor-camera",
    ]);
    expect(ledger.entries[0]).toEqual(
      expect.objectContaining({
        kind: "payment",
        status: "hold",
        amount: 120,
        nextStep: "冻结付款，补齐材料后由制片主任复核",
      }),
    );
  });

  it("sorts with deterministic string comparison for SSR hydration", () => {
    const entries: ResourceLedgerEntry[] = [
      { id: "manual-car", date: "2026-06-18", kind: "document", owner: "车辆组", title: "车辆特拍材料", amount: null, status: "hold", evidence: "缺保险", nextStep: "复核" },
      { id: "manual-vfx", date: "2026-06-18", kind: "document", owner: "VFX", title: "VFX材料", amount: null, status: "hold", evidence: "缺版本单", nextStep: "复核" },
    ];

    expect([...entries].sort(sortResourceLedgerEntries).map((entry) => entry.id)).toEqual(["manual-vfx", "manual-car"]);
  });
});
