import type { FieldDefinition } from "@/lib/field-types";

export type ParsedImport = {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
};

export type ImportValidationError = {
  row: number;
  field: string;
  message: string;
  value: unknown;
};

export type ImportValidationResult = {
  totalRows: number;
  validRows: number;
  errorRows: number;
  errors: ImportValidationError[];
};

type ImportField = Pick<FieldDefinition, "key" | "name" | "type" | "required">;

export function parseDelimitedText(input: string): ParsedImport {
  const delimiter = detectDelimiter(input);
  const rows = parseRows(input.trim(), delimiter).filter((row) => row.some((cell) => cell.trim()));
  const headers = (rows[0] ?? []).map((header) => header.trim());
  const bodyRows = rows.slice(1).map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index]?.trim() ?? ""])),
  );

  return {
    headers,
    rows: bodyRows,
    totalRows: bodyRows.length,
  };
}

export function autoMapHeaders(headers: string[], fields: readonly ImportField[]): Record<string, string> {
  return Object.fromEntries(
    headers.map((header) => {
      const normalizedHeader = normalizeName(header);
      const field = fields.find((item) => {
        const normalizedFieldName = normalizeName(item.name);
        const normalizedKey = normalizeName(item.key);
        return normalizedHeader === normalizedFieldName || normalizedHeader === normalizedKey || normalizedHeader.includes(normalizedFieldName) || normalizedFieldName.includes(normalizedHeader);
      });

      return [header, field?.key ?? ""];
    }),
  );
}

export function validateImportRows(
  rows: Record<string, string>[],
  mapping: Record<string, string>,
  fields: readonly ImportField[],
): ImportValidationResult {
  const errors: ImportValidationError[] = [];
  let validRows = 0;

  rows.forEach((row, rowIndex) => {
    let rowValid = true;

    Object.entries(mapping).forEach(([sourceColumn, fieldKey]) => {
      if (!fieldKey) return;

      const field = fields.find((item) => item.key === fieldKey);
      if (!field) return;

      const value = row[sourceColumn] ?? "";
      const empty = value.trim() === "";

      if (field.required && empty) {
        errors.push({ row: rowIndex + 2, field: field.key, message: "必填字段为空", value });
        rowValid = false;
      }

      if (isNumericType(field.type) && !empty && !Number.isFinite(Number(value.replace(/,/g, "")))) {
        errors.push({ row: rowIndex + 2, field: field.key, message: "非数字值", value });
        rowValid = false;
      }

      if ((field.type === "date" || field.type === "datetime") && !empty && Number.isNaN(Date.parse(value))) {
        errors.push({ row: rowIndex + 2, field: field.key, message: "无效日期格式", value });
        rowValid = false;
      }
    });

    if (rowValid) validRows += 1;
  });

  return {
    totalRows: rows.length,
    validRows,
    errorRows: rows.length - validRows,
    errors,
  };
}

export function buildImportedRecords(
  rows: Record<string, string>[],
  mapping: Record<string, string>,
  fields: readonly ImportField[],
): Record<string, unknown>[] {
  const validation = validateImportRows(rows, mapping, fields);
  const invalidRows = new Set(validation.errors.map((error) => error.row));

  return rows.flatMap((row, rowIndex) => {
    if (invalidRows.has(rowIndex + 2)) return [];

    const data: Record<string, unknown> = {};
    Object.entries(mapping).forEach(([sourceColumn, fieldKey]) => {
      if (!fieldKey) return;

      const field = fields.find((item) => item.key === fieldKey);
      if (!field) return;

      const rawValue = row[sourceColumn] ?? "";
      if (rawValue.trim() === "") return;

      data[field.key] = coerceImportValue(rawValue, field);
    });

    return [data];
  });
}

function parseRows(input: string, delimiter: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === delimiter && !quoted) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

function detectDelimiter(input: string) {
  const firstLine = input.split(/\r?\n/)[0] ?? "";
  const tabs = (firstLine.match(/\t/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  return tabs > commas ? "\t" : ",";
}

function normalizeName(value: string) {
  return value.toLowerCase().replace(/\([^)]*\)/g, "").replace(/[^a-z0-9\u4e00-\u9fa5]/g, "");
}

function isNumericType(type: string) {
  return ["number", "currency", "percentage", "score", "rating"].includes(type);
}

function coerceImportValue(value: string, field: ImportField) {
  if (isNumericType(field.type)) {
    return Number(value.replace(/,/g, ""));
  }

  if (field.type === "boolean") {
    return ["true", "1", "yes", "是"].includes(value.trim().toLowerCase());
  }

  return value;
}
