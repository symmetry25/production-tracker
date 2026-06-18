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
  const selectedProvider = getProvider();
  const prompt = buildRecognitionPrompt(input.mode, input.fields);
  let provider = selectedProvider;
  let rawResult: Record<string, unknown>;
  let providerError: string | null = null;

  if (selectedProvider === "mock") {
    rawResult = mockResult(input.mode, input.fields ?? []);
  } else {
    try {
      rawResult = await recognizeWithProvider(selectedProvider, input, prompt);
    } catch (error) {
      provider = "mock";
      providerError = error instanceof Error ? error.message : "AI provider request failed.";
      rawResult = { ...mockResult(input.mode, input.fields ?? []), provider_error: providerError };
    }
  }

  const imageUrl = input.imageBase64 ? `inline:${input.imageType ?? "application/octet-stream"}` : "mock://sample-document";
  const note =
    provider === "mock"
      ? providerError
        ? `AI Provider 调用失败，已返回可测试的模拟识别结果：${providerError}`
        : "未配置 AI API Key，当前返回可测试的模拟识别结果。"
      : `${provider === "openai" ? "OpenAI" : "Anthropic"} 识别完成，结果已保存到扫描历史。`;

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
      prompt,
      result: rawResult,
      provider,
      note,
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
    prompt,
    result: rawResult,
    provider,
    note,
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
  if (process.env.AI_PROVIDER === "openai") return process.env.OPENAI_API_KEY ? "openai" : "mock";
  if (process.env.AI_PROVIDER === "anthropic") return process.env.ANTHROPIC_API_KEY ? "anthropic" : "mock";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "mock";
}

async function recognizeWithProvider(
  provider: Exclude<AiScanItem["provider"], "mock">,
  input: {
    imageBase64?: string;
    imageType?: string;
    mode: AiRecognitionMode;
    fields?: FieldDefinition[];
    entityTypeId?: string | null;
    recordId?: string | null;
  },
  prompt: string,
) {
  const text = provider === "openai" ? await callOpenAi(input, prompt) : await callAnthropic(input, prompt);
  const parsed = parseJsonResponse(text);
  if (!isPlainRecord(parsed)) {
    return { value: parsed, confidence: 0.75 };
  }
  return parsed;
}

async function callOpenAi(input: { imageBase64?: string; imageType?: string }, prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");

  const content: OpenAiContentBlock[] = [{ type: "input_text", text: prompt }];
  if (input.imageBase64) {
    if (input.imageType === "application/pdf") {
      content.unshift({
        type: "input_file",
        filename: "document.pdf",
        file_data: toDataUrl(input.imageType, input.imageBase64),
      });
    } else {
      content.unshift({
        type: "input_image",
        image_url: toDataUrl(input.imageType ?? "image/jpeg", input.imageBase64),
        detail: "auto",
      });
    }
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      input: [{ role: "user", content }],
      max_output_tokens: 2000,
      store: false,
    }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(readProviderError(body, "OpenAI recognition failed."));

  const text = extractOpenAiText(body);
  if (!text) throw new Error("OpenAI returned an empty recognition result.");
  return text;
}

async function callAnthropic(input: { imageBase64?: string; imageType?: string }, prompt: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured.");

  const content: AnthropicContentBlock[] = [];
  if (input.imageBase64) {
    if (input.imageType === "application/pdf") {
      content.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: input.imageBase64 },
      });
    } else {
      content.push({
        type: "image",
        source: { type: "base64", media_type: normalizeAnthropicImageType(input.imageType), data: input.imageBase64 },
      });
    }
  }
  content.push({ type: "text", text: prompt });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5",
      max_tokens: 2000,
      messages: [{ role: "user", content }],
    }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(readProviderError(body, "Anthropic recognition failed."));

  const text = extractAnthropicText(body);
  if (!text) throw new Error("Anthropic returned an empty recognition result.");
  return text;
}

type OpenAiContentBlock =
  | { type: "input_text"; text: string }
  | { type: "input_image"; image_url: string; detail: "auto" }
  | { type: "input_file"; filename: string; file_data: string };

type AnthropicContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
  | { type: "document"; source: { type: "base64"; media_type: "application/pdf"; data: string } };

function toDataUrl(mediaType: string, data: string) {
  return data.startsWith("data:") ? data : `data:${mediaType};base64,${data}`;
}

function normalizeAnthropicImageType(type: string | undefined) {
  if (type === "image/png" || type === "image/gif" || type === "image/webp") return type;
  return "image/jpeg";
}

function extractOpenAiText(body: unknown) {
  if (!isPlainRecord(body)) return "";
  if (typeof body.output_text === "string") return body.output_text;

  const output = Array.isArray(body.output) ? body.output : [];
  return output
    .flatMap((item) => (isPlainRecord(item) && Array.isArray(item.content) ? item.content : []))
    .map((content) => {
      if (!isPlainRecord(content)) return "";
      if (typeof content.text === "string") return content.text;
      if (typeof content.output_text === "string") return content.output_text;
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

function extractAnthropicText(body: unknown) {
  if (!isPlainRecord(body) || !Array.isArray(body.content)) return "";
  return body.content
    .map((content) => (isPlainRecord(content) && content.type === "text" && typeof content.text === "string" ? content.text : ""))
    .filter(Boolean)
    .join("\n");
}

function parseJsonResponse(text: string) {
  const clean = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(clean) as unknown;
  } catch {
    const jsonSlice = extractJsonSlice(clean);
    if (!jsonSlice) throw new Error("识别结果解析失败。");
    return JSON.parse(jsonSlice) as unknown;
  }
}

function extractJsonSlice(text: string) {
  const objectStart = text.indexOf("{");
  const objectEnd = text.lastIndexOf("}");
  if (objectStart >= 0 && objectEnd > objectStart) return text.slice(objectStart, objectEnd + 1);

  const arrayStart = text.indexOf("[");
  const arrayEnd = text.lastIndexOf("]");
  if (arrayStart >= 0 && arrayEnd > arrayStart) return text.slice(arrayStart, arrayEnd + 1);

  return null;
}

function readProviderError(body: unknown, fallback: string) {
  if (!isPlainRecord(body)) return fallback;
  const error = body.error;
  if (isPlainRecord(error) && typeof error.message === "string") return error.message;
  if (typeof body.message === "string") return body.message;
  return fallback;
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
