import type { FieldDefinition } from "@/lib/field-types";
import { getPrisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type AiRecognitionMode = "invoice" | "table" | "document" | "card" | "custom";

export type AiScanItem = {
  id: string;
  recordId: string | null;
  entityTypeId: string | null;
  mode: AiRecognitionMode;
  imageUrl: string;
  rawResult: Record<string, unknown>;
  appliedData: Record<string, unknown> | null;
  confidence: number;
  provider: "mock" | "anthropic" | "openai";
  createdAt: string;
};

type AiState = {
  scans: AiScanItem[];
  sequence: number;
};

type DbAiScan = {
  id: string;
  recordId: string | null;
  entityTypeId: string | null;
  mode: string;
  imageUrl: string;
  rawResult: unknown;
  appliedData: unknown;
  confidence: number | null;
  createdAt: Date | string;
};

const globalForAi = globalThis as typeof globalThis & {
  __productionTrackerAiState?: AiState;
};

export function buildRecognitionPrompt(mode: AiRecognitionMode, fields: FieldDefinition[] = []) {
  const base = "你是一个数据提取专家。请从图片、PDF或粘贴文本中提取结构化信息，只返回 JSON。";
  const promptByMode: Record<AiRecognitionMode, string> = {
    invoice: `${base} 提取发票号、日期、销售方、购买方、金额、税额、总额、条目列表和备注。`,
    table: `${base} 识别表格行列结构，返回 headers、rows、totalRows、confidence。`,
    document: `${base} 判断单据类型，并提取单据编号、日期、来往方、条目、总金额、审批人和备注。`,
    card: `${base} 提取姓名、职位、公司、部门、电话、邮箱、地址、网站和微信。`,
    custom: `${base} 按当前实体字段提取：${fields.map((field) => `${field.key}=${field.name}(${field.type})`).join("；")}`,
  };
  return promptByMode[mode];
}

export async function recognizeDocument(input: {
  imageBase64?: string;
  imageType?: string;
  mode: AiRecognitionMode;
  fields?: FieldDefinition[];
  entityTypeId?: string | null;
  recordId?: string | null;
}) {
  const provider = getProvider();
  const rawResult = mockResult(input.mode, input.fields ?? []);
  const imageUrl = input.imageBase64 ? `inline:${input.imageType ?? "application/octet-stream"}` : "mock://sample-document";

  if (shouldUsePersistentStore()) {
    const scan = await createAiScanAsync({
      recordId: input.recordId ?? null,
      entityTypeId: input.entityTypeId ?? null,
      mode: input.mode,
      imageUrl,
      rawResult: { ...rawResult, __provider: provider },
      appliedData: null,
      confidence: Number(rawResult.confidence ?? 0.88),
    });
    return {
      scan,
      prompt: buildRecognitionPrompt(input.mode, input.fields),
      result: rawResult,
      provider,
      note: provider === "mock" ? "未配置 AI API Key，当前返回可测试的模拟识别结果。" : "接口已按 AI Provider 形态返回，生产环境可在此接入真实模型调用。",
    };
  }

  const scan: AiScanItem = {
    id: `scan-${nextSequence()}`,
    recordId: input.recordId ?? null,
    entityTypeId: input.entityTypeId ?? null,
    mode: input.mode,
    imageUrl,
    rawResult,
    appliedData: null,
    confidence: Number(rawResult.confidence ?? 0.88),
    provider,
    createdAt: new Date().toISOString(),
  };
  getState().scans.unshift(scan);

  return {
    scan,
    prompt: buildRecognitionPrompt(input.mode, input.fields),
    result: rawResult,
    provider,
    note: provider === "mock" ? "未配置 AI API Key，当前返回可测试的模拟识别结果。" : "接口已按 AI Provider 形态返回，生产环境可在此接入真实模型调用。",
  };
}

export function listAiScans(filters: { recordId?: string | null; entityTypeId?: string | null } = {}) {
  return getState().scans.filter((scan) => {
    if (filters.recordId && scan.recordId !== filters.recordId) return false;
    if (filters.entityTypeId && scan.entityTypeId !== filters.entityTypeId) return false;
    return true;
  });
}

export async function listAiScansAsync(filters: { recordId?: string | null; entityTypeId?: string | null } = {}) {
  if (!shouldUsePersistentStore()) return listAiScans(filters);

  const scans = await getPrisma().aiScan.findMany({
    where: {
      ...(filters.recordId ? { recordId: filters.recordId } : {}),
      ...(filters.entityTypeId ? { entityTypeId: filters.entityTypeId } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return scans.map(scanFromDb);
}

export function resetAiRecognitionForTests() {
  globalForAi.__productionTrackerAiState = createState();
}

async function createAiScanAsync(input: {
  recordId: string | null;
  entityTypeId: string | null;
  mode: AiRecognitionMode;
  imageUrl: string;
  rawResult: Record<string, unknown>;
  appliedData: Record<string, unknown> | null;
  confidence: number;
}) {
  const scan = await getPrisma().aiScan.create({
    data: {
      recordId: input.recordId,
      entityTypeId: input.entityTypeId,
      mode: input.mode,
      imageUrl: input.imageUrl,
      rawResult: toPrismaJson(input.rawResult),
      appliedData: input.appliedData ? toPrismaJson(input.appliedData) : undefined,
      confidence: input.confidence,
    },
  });
  return scanFromDb(scan);
}

function scanFromDb(scan: DbAiScan): AiScanItem {
  const rawResult = isPlainRecord(scan.rawResult) ? { ...scan.rawResult } : {};
  const provider = normalizeProvider(rawResult.__provider);
  delete rawResult.__provider;
  return {
    id: scan.id,
    recordId: scan.recordId,
    entityTypeId: scan.entityTypeId,
    mode: normalizeMode(scan.mode),
    imageUrl: scan.imageUrl,
    rawResult,
    appliedData: isPlainRecord(scan.appliedData) ? scan.appliedData : null,
    confidence: scan.confidence ?? Number(rawResult.confidence ?? 0),
    provider,
    createdAt: toIsoString(scan.createdAt),
  };
}

function normalizeMode(mode: string): AiRecognitionMode {
  if (mode === "invoice" || mode === "table" || mode === "document" || mode === "card" || mode === "custom") return mode;
  return "document";
}

function normalizeProvider(provider: unknown): AiScanItem["provider"] {
  if (provider === "openai" || provider === "anthropic" || provider === "mock") return provider;
  return getProvider();
}

function shouldUsePersistentStore() {
  return Boolean(process.env.DATABASE_URL);
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function mockResult(mode: AiRecognitionMode, fields: FieldDefinition[]) {
  if (mode === "invoice") {
    return {
      invoice_number: "INV-2026-0618",
      invoice_date: "2026-06-18",
      seller_name: "Northlight Camera Rental",
      buyer_name: "Mkali Production",
      subtotal: 38000,
      tax_rate: 9,
      tax_amount: 3420,
      total: 41420,
      confidence: 0.91,
      items: [{ name: "Lens package balance", quantity: 1, unit: "项", unit_price: 38000, amount: 38000 }],
    };
  }

  if (mode === "table") {
    return {
      headers: ["名称", "数量", "金额"],
      rows: [["酒店团房", 12, 54000], ["车辆追加", 2, 26000]],
      totalRows: 2,
      confidence: 0.86,
    };
  }

  if (mode === "card") {
    return {
      name: "Iris Wang",
      title: "Producer",
      company: "CineCloud Studio",
      phone: ["+65 8888 1000"],
      email: ["iris@example.com"],
      confidence: 0.9,
    };
  }

  if (mode === "custom" && fields.length) {
    return {
      confidence: 0.84,
      ...Object.fromEntries(fields.filter((field) => !field.readOnly).slice(0, 8).map((field) => [field.key, sampleValueForField(field)])),
    };
  }

  return {
    document_type: "采购单",
    document_number: "PO-2026-0618",
    date: "2026-06-18",
    parties: { from: "Glow Rigging & Generator", to: "Mkali Production" },
    total_amount: 26000,
    approver: "林一凡",
    notes: "发电车追加费用需要科目拆分后付款。",
    confidence: 0.88,
  };
}

function sampleValueForField(field: FieldDefinition) {
  if (["number", "currency", "percentage", "score", "rating"].includes(field.type)) return field.type === "percentage" ? 42 : 1200;
  if (field.type === "date") return "2026-06-18";
  if (field.type === "boolean") return true;
  if (field.type === "select" || field.type === "status") return field.options?.[0]?.value ?? "pending";
  return `${field.name}识别值`;
}

function getProvider(): AiScanItem["provider"] {
  if (process.env.AI_PROVIDER === "openai" && process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "mock";
}

function getState() {
  globalForAi.__productionTrackerAiState ??= createState();
  return globalForAi.__productionTrackerAiState;
}

function createState(): AiState {
  return {
    sequence: 100,
    scans: [
      {
        id: "scan-demo-invoice",
        recordId: null,
        entityTypeId: "retail-purchase-order",
        mode: "invoice",
        imageUrl: "mock://invoice",
        rawResult: mockResult("invoice", []),
        appliedData: null,
        confidence: 0.91,
        provider: "mock",
        createdAt: "2026-06-18T00:00:00.000Z",
      },
    ],
  };
}

function nextSequence() {
  const state = getState();
  state.sequence += 1;
  return state.sequence;
}
