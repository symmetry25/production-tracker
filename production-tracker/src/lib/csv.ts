import * as XLSX from "xlsx";

export type TableCell = string | number | null | undefined;

export type WorkbookSheet = {
  name: string;
  rows: TableCell[][];
};

export function toCsv(rows: TableCell[][]) {
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

export function downloadCsv(filename: string, rows: TableCell[][]) {
  const blob = new Blob([`\uFEFF${toCsv(rows)}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadXlsx(filename: string, rows: TableCell[][], sheetName = "Data") {
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet["!cols"] = inferColumnWidths(rows);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31) || "Data");

  const data = XLSX.write(workbook, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadWorkbookXlsx(filename: string, sheets: WorkbookSheet[]) {
  const workbook = XLSX.utils.book_new();
  const usedNames = new Set<string>();
  const safeSheets = sheets.length ? sheets : [{ name: "Data", rows: [["No data"]] }];

  for (const sheet of safeSheets) {
    const worksheet = XLSX.utils.aoa_to_sheet(sheet.rows);
    worksheet["!cols"] = inferColumnWidths(sheet.rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, uniqueSheetName(sheet.name, usedNames));
  }

  const data = XLSX.write(workbook, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value: TableCell) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function inferColumnWidths(rows: TableCell[][]) {
  const maxColumns = Math.max(...rows.map((row) => row.length), 0);

  return Array.from({ length: maxColumns }, (_, columnIndex) => {
    const maxLength = rows.reduce((max, row) => {
      const value = row[columnIndex];
      return Math.max(max, value === null || value === undefined ? 0 : String(value).length);
    }, 10);

    return { wch: Math.max(10, Math.min(42, maxLength + 2)) };
  });
}

function uniqueSheetName(name: string, usedNames: Set<string>) {
  const normalized = (name || "Data").replaceAll(/[\\/?*[\]:]/g, " ").trim() || "Data";
  let sheetName = normalized.slice(0, 31);
  let index = 2;

  while (usedNames.has(sheetName)) {
    const suffix = ` ${index}`;
    sheetName = `${normalized.slice(0, 31 - suffix.length)}${suffix}`;
    index += 1;
  }

  usedNames.add(sheetName);
  return sheetName;
}
