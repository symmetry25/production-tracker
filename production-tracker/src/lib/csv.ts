import * as XLSX from "xlsx";

type TableCell = string | number | null | undefined;

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
