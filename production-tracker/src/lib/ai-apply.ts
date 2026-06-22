export type RecognizedRecord = {
  po_number: string;
  supplier: string;
  order_date: string;
  expected_date: string;
  unit_cost: number;
  quantity: number;
  status: "pending";
  vendor_score: number;
  source_document?: string;
};

type RecognizedInput = Record<string, unknown> | BatchLike[] | null | undefined;

type BatchLike = {
  name?: string;
  result?: unknown;
};

const fallbackOrderDate = "2026-06-18";
const fallbackExpectedDate = "2026-06-25";

export function buildRecognizedRecords(input: RecognizedInput): RecognizedRecord[] {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input.flatMap((item) => buildRecognizedRecordsWithSource(unwrapResult(item.result), item.name));
  }

  return buildRecognizedRecordsWithSource(input);
}

function buildRecognizedRecordsWithSource(result: Record<string, unknown>, sourceDocument?: string): RecognizedRecord[] {
  if (Array.isArray(result.rows)) {
    return result.rows.flatMap((row, index) => recordFromTableRow(row, result, index, sourceDocument));
  }

  return [recordFromInvoice(result, sourceDocument)];
}

function recordFromInvoice(result: Record<string, unknown>, sourceDocument?: string): RecognizedRecord {
  const firstItem = Array.isArray(result.items) && isRecord(result.items[0]) ? result.items[0] : null;
  const quantity = readNumber(firstItem?.quantity, 1);
  const total = readNumber(result.total ?? result.total_amount ?? firstItem?.amount, 0);
  const unitCost = readNumber(firstItem?.unit_price ?? firstItem?.unit_cost, quantity > 0 && total > 0 ? total / quantity : total || 1);

  return {
    po_number: readString(result.invoice_number ?? result.document_number, `AI-${Date.now().toString().slice(-5)}`),
    supplier: readString(result.seller_name ?? result.supplier ?? result.vendor ?? getNestedParty(result, "from"), "AI识别供应商"),
    order_date: readString(result.invoice_date ?? result.date ?? result.order_date, fallbackOrderDate),
    expected_date: readString(result.expected_date, fallbackExpectedDate),
    unit_cost: roundMoney(unitCost),
    quantity,
    status: "pending",
    vendor_score: confidenceToScore(result.confidence),
    ...(sourceDocument ? { source_document: sourceDocument } : {}),
  };
}

function recordFromTableRow(row: unknown, result: Record<string, unknown>, index: number, sourceDocument?: string): RecognizedRecord[] {
  const record = normalizeTableRow(row, result.headers);
  if (!record) return [];

  const name = readString(record.name ?? record.名称 ?? record.supplier ?? record.供应商, `AI识别条目 ${index + 1}`);
  const quantity = readNumber(record.quantity ?? record.数量, 1);
  const amount = readNumber(record.amount ?? record.金额 ?? record.total ?? record.总额, 0);
  const unitCost = readNumber(record.unit_cost ?? record.单价, quantity > 0 && amount > 0 ? amount / quantity : amount || 1);

  return [
    {
      po_number: readString(record.po_number ?? record.单号, `AI-${String(index + 1).padStart(4, "0")}`),
      supplier: name,
      order_date: readString(record.order_date ?? record.日期, fallbackOrderDate),
      expected_date: readString(record.expected_date ?? record.预计到货, fallbackExpectedDate),
      unit_cost: roundMoney(unitCost),
      quantity,
      status: "pending",
      vendor_score: confidenceToScore(result.confidence),
      ...(sourceDocument ? { source_document: sourceDocument } : {}),
    },
  ];
}

function normalizeTableRow(row: unknown, headers: unknown): Record<string, unknown> | null {
  if (isRecord(row)) return row;

  if (Array.isArray(row)) {
    const headerList = Array.isArray(headers) ? headers.map((item) => String(item)) : [];
    return Object.fromEntries(row.map((value, index) => [headerList[index] ?? `column_${index + 1}`, value]));
  }

  return null;
}

function unwrapResult(result: unknown): Record<string, unknown> {
  if (!isRecord(result)) return {};
  if (isRecord(result.result)) return result.result;
  return result;
}

function getNestedParty(result: Record<string, unknown>, key: string) {
  const parties = result.parties;
  return isRecord(parties) ? parties[key] : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown, fallback: string) {
  const text = typeof value === "string" ? value.trim() : value === undefined || value === null ? "" : String(value).trim();
  return text || fallback;
}

function readNumber(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = Number(value.replace(/,/g, ""));
    if (Number.isFinite(normalized)) return normalized;
  }
  return fallback;
}

function confidenceToScore(value: unknown) {
  const confidence = readNumber(value, 0.85);
  return Math.max(0, Math.min(100, Math.round(confidence > 1 ? confidence : confidence * 100)));
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
