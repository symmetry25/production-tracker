import { describe, expect, it } from "vitest";

import { autoMapHeaders, buildImportedRecords, parseDelimitedText, validateImportRows } from "@/lib/importer";

const fields = [
  { id: "name", key: "name", name: "名称", type: "text", required: true, order: 0 },
  { id: "quantity", key: "quantity", name: "数量", type: "number", required: true, order: 1 },
  { id: "unit_cost", key: "unit_cost", name: "单价", type: "currency", required: false, order: 2 },
  { id: "status", key: "status", name: "状态", type: "status", required: false, order: 3 },
] as const;

describe("importer", () => {
  it("parses CSV text into headers and row objects", () => {
    const parsed = parseDelimitedText("名称,数量,单价\n雨戏耗材,12,95\n车辆,2,900");

    expect(parsed.headers).toEqual(["名称", "数量", "单价"]);
    expect(parsed.totalRows).toBe(2);
    expect(parsed.rows[0]).toEqual({ 名称: "雨戏耗材", 数量: "12", 单价: "95" });
  });

  it("automatically maps similar headers to field keys", () => {
    expect(autoMapHeaders(["名称", "数量", "单价(元)", "备注"], fields)).toEqual({
      名称: "name",
      数量: "quantity",
      "单价(元)": "unit_cost",
      备注: "",
    });
  });

  it("validates required fields and numeric fields", () => {
    const parsed = parseDelimitedText("名称,数量,单价\n雨戏耗材,12,95\n,3,20\n车辆,N/A,900");
    const mapping = autoMapHeaders(parsed.headers, fields);
    const result = validateImportRows(parsed.rows, mapping, fields);

    expect(result.totalRows).toBe(3);
    expect(result.validRows).toBe(1);
    expect(result.errorRows).toBe(2);
    expect(result.errors.map((error) => error.message)).toEqual(["必填字段为空", "非数字值"]);
  });

  it("builds normalized imported records for valid rows only", () => {
    const parsed = parseDelimitedText("名称,数量,单价\n雨戏耗材,12,95\n车辆,N/A,900");
    const mapping = autoMapHeaders(parsed.headers, fields);
    const records = buildImportedRecords(parsed.rows, mapping, fields);

    expect(records).toEqual([{ name: "雨戏耗材", quantity: 12, unit_cost: 95 }]);
  });
});
