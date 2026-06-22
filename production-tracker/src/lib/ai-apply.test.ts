import { describe, expect, it } from "vitest";

import { buildRecognizedRecords } from "@/lib/ai-apply";

describe("buildRecognizedRecords", () => {
  it("turns an invoice recognition result into a purchase-order record", () => {
    const records = buildRecognizedRecords({
      invoice_number: "INV-2026-0618",
      invoice_date: "2026-06-18",
      seller_name: "Northlight Camera Rental",
      total: 41420,
      confidence: 0.91,
      items: [{ name: "Lens package balance", quantity: 2, unit_price: 19000, amount: 38000 }],
    });

    expect(records).toEqual([
      {
        po_number: "INV-2026-0618",
        supplier: "Northlight Camera Rental",
        order_date: "2026-06-18",
        expected_date: "2026-06-25",
        unit_cost: 19000,
        quantity: 2,
        status: "pending",
        vendor_score: 91,
      },
    ]);
  });

  it("turns recognized table rows into one record per row", () => {
    const records = buildRecognizedRecords({
      headers: ["名称", "数量", "金额"],
      rows: [["酒店团房", 12, 54000], ["车辆追加", 2, 26000]],
      confidence: 0.86,
    });

    expect(records).toEqual([
      expect.objectContaining({ po_number: "AI-0001", supplier: "酒店团房", quantity: 12, unit_cost: 4500, vendor_score: 86 }),
      expect.objectContaining({ po_number: "AI-0002", supplier: "车辆追加", quantity: 2, unit_cost: 13000, vendor_score: 86 }),
    ]);
  });

  it("flattens batch recognition results and keeps source names", () => {
    const records = buildRecognizedRecords([
      { name: "invoice-a.jpg", result: { invoice_number: "A-1", seller_name: "A Vendor", total: 1200, confidence: 0.8 } },
      { name: "invoice-b.jpg", result: { result: { invoice_number: "B-1", seller_name: "B Vendor", total: 2400, confidence: 0.7 } } },
    ]);

    expect(records).toEqual([
      expect.objectContaining({ po_number: "A-1", supplier: "A Vendor", source_document: "invoice-a.jpg" }),
      expect.objectContaining({ po_number: "B-1", supplier: "B Vendor", source_document: "invoice-b.jpg" }),
    ]);
  });
});
