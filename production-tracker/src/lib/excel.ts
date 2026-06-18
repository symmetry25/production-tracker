import * as XLSX from "xlsx";

import type { CustomRecord } from "@/lib/custom-data";
import type { FieldDefinition } from "@/lib/field-types";
import type { ParsedImport } from "@/lib/importer";

export function parseWorkbook(buffer: ArrayBuffer): ParsedImport {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = firstSheetName ? workbook.Sheets[firstSheetName] : null;
  const rows = worksheet ? (XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: "" }) as string[][]) : [];
  const headers = (rows[0] ?? []).map((header) => String(header).trim());
  const bodyRows = rows.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, String(row[index] ?? "").trim()])));

  return {
    headers,
    rows: bodyRows,
    totalRows: bodyRows.length,
  };
}

export function buildWorkbookBuffer(records: CustomRecord[], fields: FieldDefinition[]) {
  const visibleFields = fields.filter((field) => !field.hidden);
  const headers = visibleFields.map((field) => field.name);
  const rows = records.map((record) => visibleFields.map((field) => formatExportValue(record.data[field.key], field)));
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  worksheet["!cols"] = visibleFields.map((field) => ({ wch: Math.max(12, Math.min(36, field.width ? Math.round(field.width / 8) : field.name.length * 2)) }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

function formatExportValue(value: unknown, field: FieldDefinition) {
  if (value === undefined || value === null) return "";
  if (field.type === "boolean") return value ? "是" : "否";
  if (field.type === "multiselect" && Array.isArray(value)) return value.join(", ");
  if ((field.type === "date" || field.type === "datetime") && value) return String(value).slice(0, 10);
  return value;
}
