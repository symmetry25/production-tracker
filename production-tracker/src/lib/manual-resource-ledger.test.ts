import { describe, expect, it } from "vitest";

import { createManualLedgerEntry, mergeManualLedgerEntries } from "@/lib/manual-resource-ledger";
import type { ResourceLedgerEntry } from "@/lib/resource-ledger";

describe("manual resource ledger entries", () => {
  it("validates and normalizes manual ledger input", () => {
    const result = createManualLedgerEntry(
      {
        kind: "vendor",
        status: "watch",
        owner: "  摄影组  ",
        title: "  新增镜头押金复核  ",
        amount: "12,500",
        date: "2026-06-25",
        evidence: "报价单已上传，合同还未拆分押金",
        nextStep: "制片主任确认押金科目后再签约",
      },
      3,
    );

    expect(result).toEqual({
      ok: true,
      entry: {
        id: "manual-vendor-摄影组-3",
        kind: "vendor",
        status: "watch",
        owner: "摄影组",
        title: "新增镜头押金复核",
        amount: 12500,
        date: "2026-06-25",
        evidence: "报价单已上传，合同还未拆分押金",
        nextStep: "制片主任确认押金科目后再签约",
      },
    });
  });

  it("returns validation errors for incomplete manual input", () => {
    const result = createManualLedgerEntry({
      kind: "payment",
      status: "hold",
      owner: "",
      title: "",
      amount: "-10",
      date: "not-a-date",
      evidence: "",
      nextStep: "",
    });

    expect(result).toEqual({
      ok: false,
      errors: ["owner is required", "title is required", "valid date is required", "amount must be zero or greater", "evidence is required", "next step is required"],
    });
  });

  it("merges manual entries into the audit ledger and keeps decision order", () => {
    const existing: ResourceLedgerEntry[] = [
      {
        id: "auto-vendor",
        kind: "vendor",
        status: "watch",
        owner: "摄影组",
        title: "Camera Vendor",
        amount: 12000,
        date: "2026-06-20",
        evidence: "待复核",
        nextStep: "复核",
      },
    ];
    const manual: ResourceLedgerEntry[] = [
      {
        id: "manual-payment",
        kind: "payment",
        status: "hold",
        owner: "Hotel Vendor",
        title: "酒店尾款",
        amount: 5000,
        date: "2026-06-22",
        evidence: "缺发票",
        nextStep: "暂缓",
      },
    ];

    expect(mergeManualLedgerEntries(existing, manual).map((entry) => entry.id)).toEqual(["manual-payment", "auto-vendor"]);
  });
});
