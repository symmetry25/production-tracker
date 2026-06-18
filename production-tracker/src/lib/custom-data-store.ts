import type { CustomRecord, IndustryTemplate } from "@/lib/custom-data";
import { getIndustryTemplates } from "@/lib/custom-data";
import type { FieldDefinition } from "@/lib/field-types";
import { applyFormulaFields } from "@/lib/formula";
import { autoMapHeaders, buildImportedRecords, parseDelimitedText, validateImportRows, type ImportValidationResult, type ParsedImport } from "@/lib/importer";

export type EntityTypeItem = IndustryTemplate & {
  slug: string;
  projectId: string | null;
  isTemplate: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type RecordFileItem = {
  id: string;
  recordId: string;
  filename: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
};

export type RecordNoteItem = {
  id: string;
  recordId: string;
  content: string;
  authorId: string;
  createdAt: string;
};

export type RecordDetail = CustomRecord & {
  files: RecordFileItem[];
  notes: RecordNoteItem[];
};

export type ImportPreview = {
  parsed: ParsedImport;
  mapping: Record<string, string>;
  validation: ImportValidationResult;
  importableRows: Record<string, unknown>[];
};

type ExtensionState = {
  entityTypes: Map<string, EntityTypeItem>;
  files: Map<string, RecordFileItem[]>;
  notes: Map<string, RecordNoteItem[]>;
  sequence: number;
};

type CreateEntityInput = {
  name: string;
  slug?: string;
  description?: string;
  industry?: EntityTypeItem["industry"];
  icon?: string;
  color?: string;
  projectId?: string | null;
  fields?: FieldDefinition[];
};

const createdAt = "2026-06-18T00:00:00.000Z";

const globalForStore = globalThis as typeof globalThis & {
  __productionTrackerExtensionState?: ExtensionState;
};

export function listTemplates(industry?: string | null) {
  const templates = getIndustryTemplates();
  return industry ? templates.filter((template) => template.industry === industry) : templates;
}

export function getTemplate(templateId: string) {
  return listTemplates().find((template) => template.id === templateId) ?? null;
}

export function listEntityTypes(filters: { projectId?: string | null; industry?: string | null } = {}) {
  const items = Array.from(getState().entityTypes.values());
  return items.filter((item) => {
    if (filters.projectId !== undefined && item.projectId !== filters.projectId) return false;
    if (filters.industry && item.industry !== filters.industry) return false;
    return true;
  });
}

export function getEntityType(idOrSlug: string) {
  const state = getState();
  return state.entityTypes.get(idOrSlug) ?? Array.from(state.entityTypes.values()).find((item) => item.slug === idOrSlug) ?? null;
}

export function createEntityType(input: CreateEntityInput) {
  const state = getState();
  const slug = uniqueSlug(input.slug ?? slugify(input.name), Array.from(state.entityTypes.values()).map((item) => item.slug));
  const now = new Date().toISOString();
  const entity: EntityTypeItem = {
    id: `entity-${slug}-${nextSequence()}`,
    slug,
    industry: input.industry ?? "generic",
    name: input.name,
    description: input.description ?? "自定义实体类型",
    icon: input.icon ?? "database",
    color: input.color ?? "#d8b46a",
    projectId: input.projectId ?? null,
    isTemplate: false,
    createdBy: "demo-admin",
    createdAt: now,
    updatedAt: now,
    fields: normalizeFieldOrder(input.fields ?? defaultFields()),
    records: [],
  };

  state.entityTypes.set(entity.id, entity);
  return clone(entity);
}

export function installTemplate(templateId: string, input: { projectId?: string | null; customName?: string | null } = {}) {
  const template = getTemplate(templateId);
  if (!template) return null;

  const state = getState();
  const slug = uniqueSlug(slugify(input.customName || template.name), Array.from(state.entityTypes.values()).map((item) => item.slug));
  const now = new Date().toISOString();
  const entity: EntityTypeItem = {
    ...clone(template),
    id: `entity-${slug}-${nextSequence()}`,
    slug,
    name: input.customName || template.name,
    projectId: input.projectId ?? null,
    isTemplate: false,
    createdBy: "demo-admin",
    createdAt: now,
    updatedAt: now,
  };

  state.entityTypes.set(entity.id, entity);
  return clone(entity);
}

export function updateEntityType(id: string, input: Partial<Omit<CreateEntityInput, "fields">>) {
  const state = getState();
  const entity = state.entityTypes.get(id);
  if (!entity) return null;

  const next: EntityTypeItem = {
    ...entity,
    name: input.name ?? entity.name,
    slug: input.slug ? uniqueSlug(slugify(input.slug), Array.from(state.entityTypes.values()).filter((item) => item.id !== id).map((item) => item.slug)) : entity.slug,
    description: input.description ?? entity.description,
    industry: input.industry ?? entity.industry,
    icon: input.icon ?? entity.icon,
    color: input.color ?? entity.color,
    projectId: input.projectId === undefined ? entity.projectId : input.projectId,
    updatedAt: new Date().toISOString(),
  };

  state.entityTypes.set(id, next);
  return clone(next);
}

export function deleteEntityType(id: string) {
  const state = getState();
  const entity = state.entityTypes.get(id);
  if (!entity) return null;
  state.entityTypes.delete(id);
  for (const record of entity.records) {
    state.files.delete(record.id);
    state.notes.delete(record.id);
  }
  return clone(entity);
}

export function addField(entityTypeId: string, field: Omit<FieldDefinition, "id" | "order"> & Partial<Pick<FieldDefinition, "id" | "order">>) {
  const state = getState();
  const entity = state.entityTypes.get(entityTypeId);
  if (!entity) return null;

  const nextField: FieldDefinition = {
    id: field.id ?? `field-${slugify(field.key)}-${nextSequence()}`,
    key: field.key,
    name: field.name,
    type: field.type,
    required: field.required ?? false,
    defaultValue: field.defaultValue,
    options: field.options,
    config: field.config,
    order: field.order ?? entity.fields.length,
    width: field.width,
    hidden: field.hidden,
    readOnly: field.readOnly,
  };
  entity.fields = normalizeFieldOrder([...entity.fields, nextField]);
  entity.records = entity.records.map((record) => ({ ...record, data: normalizeRecordData(entity, record.data, record.createdBy, record.id) }));
  entity.updatedAt = new Date().toISOString();
  return clone(nextField);
}

export function updateField(entityTypeId: string, fieldId: string, input: Partial<FieldDefinition>) {
  const entity = getState().entityTypes.get(entityTypeId);
  if (!entity) return null;

  const field = entity.fields.find((item) => item.id === fieldId);
  if (!field) return null;

  Object.assign(field, {
    ...input,
    id: field.id,
    key: input.key ?? field.key,
  });
  entity.fields = normalizeFieldOrder(entity.fields);
  entity.records = entity.records.map((record) => ({ ...record, data: normalizeRecordData(entity, record.data, record.createdBy, record.id) }));
  entity.updatedAt = new Date().toISOString();
  return clone(field);
}

export function deleteField(entityTypeId: string, fieldId: string) {
  const entity = getState().entityTypes.get(entityTypeId);
  if (!entity) return null;

  const field = entity.fields.find((item) => item.id === fieldId);
  if (!field) return null;

  entity.fields = normalizeFieldOrder(entity.fields.filter((item) => item.id !== fieldId));
  entity.records = entity.records.map((record) => {
    const nextData = { ...record.data };
    delete nextData[field.key];
    return { ...record, data: nextData };
  });
  entity.updatedAt = new Date().toISOString();
  return clone(field);
}

export function reorderFields(entityTypeId: string, fieldIds: string[]) {
  const entity = getState().entityTypes.get(entityTypeId);
  if (!entity) return null;

  const order = new Map(fieldIds.map((id, index) => [id, index]));
  entity.fields = normalizeFieldOrder(entity.fields.map((field) => ({ ...field, order: order.get(field.id) ?? field.order })));
  entity.updatedAt = new Date().toISOString();
  return clone(entity.fields);
}

export function listRecords(entityTypeId: string, filters: { q?: string | null; sort?: string | null; dir?: "asc" | "desc" | null; page?: number | null } = {}) {
  const entity = getEntityType(entityTypeId);
  if (!entity) return null;

  const query = filters.q?.trim().toLowerCase();
  let records = entity.records;
  if (query) {
    records = records.filter((record) => Object.values(record.data).some((value) => String(value ?? "").toLowerCase().includes(query)));
  }

  if (filters.sort) {
    const direction = filters.dir === "desc" ? -1 : 1;
    records = [...records].sort((a, b) => String(a.data[filters.sort ?? ""] ?? "").localeCompare(String(b.data[filters.sort ?? ""] ?? "")) * direction);
  }

  const page = Math.max(1, filters.page ?? 1);
  const pageSize = 100;
  return clone({ records: records.slice((page - 1) * pageSize, page * pageSize), total: records.length, page, pageSize });
}

export function getRecord(recordId: string): RecordDetail | null {
  const entity = findEntityByRecord(recordId);
  const record = entity?.records.find((item) => item.id === recordId);
  if (!record) return null;
  return clone({ ...record, files: getState().files.get(recordId) ?? [], notes: getState().notes.get(recordId) ?? [] });
}

export function createEntityRecord(entityTypeId: string, data: Record<string, unknown>, createdBy = "当前用户") {
  const state = getState();
  const entity = state.entityTypes.get(entityTypeId) ?? getEntityType(entityTypeId);
  if (!entity) return null;

  const id = `record-${slugify(entity.slug)}-${nextSequence()}`;
  const record: CustomRecord = {
    id,
    data: normalizeRecordData(entity, data, createdBy, id),
    createdAt: new Date().toISOString(),
    createdBy,
  };
  entity.records = [record, ...entity.records];
  entity.updatedAt = new Date().toISOString();
  state.entityTypes.set(entity.id, entity);
  return clone(record);
}

export function updateEntityRecord(recordId: string, data: Record<string, unknown>) {
  const entity = findEntityByRecord(recordId);
  if (!entity) return null;

  let updated: CustomRecord | null = null;
  entity.records = entity.records.map((record) => {
    if (record.id !== recordId) return record;
    updated = {
      ...record,
      data: normalizeRecordData(entity, { ...record.data, ...data }, record.createdBy, record.id),
    };
    return updated;
  });
  entity.updatedAt = new Date().toISOString();
  return updated ? clone(updated) : null;
}

export function deleteEntityRecord(recordId: string) {
  const state = getState();
  const entity = findEntityByRecord(recordId);
  if (!entity) return null;

  const record = entity.records.find((item) => item.id === recordId);
  entity.records = entity.records.filter((item) => item.id !== recordId);
  state.files.delete(recordId);
  state.notes.delete(recordId);
  entity.updatedAt = new Date().toISOString();
  return record ? clone(record) : null;
}

export function previewImport(entityTypeId: string, input: { sourceText: string; mapping?: Record<string, string> }): ImportPreview | null {
  const entity = getEntityType(entityTypeId);
  if (!entity) return null;

  const parsed = parseDelimitedText(input.sourceText);
  const importableFields = entity.fields.filter((field) => !field.readOnly && !field.hidden);
  const mapping = input.mapping ?? autoMapHeaders(parsed.headers, importableFields);
  const validation = validateImportRows(parsed.rows, mapping, importableFields);
  const importableRows = buildImportedRecords(parsed.rows, mapping, importableFields);
  return { parsed, mapping, validation, importableRows };
}

export function importRecords(entityTypeId: string, input: { sourceText: string; mapping?: Record<string, string>; createdBy?: string }) {
  const preview = previewImport(entityTypeId, input);
  if (!preview) return null;

  const inserted = preview.importableRows.map((row) => createEntityRecord(entityTypeId, row, input.createdBy ?? "导入向导")).filter(Boolean);
  return clone({
    total: preview.validation.totalRows,
    inserted: inserted.length,
    skipped: preview.validation.errorRows,
    errors: preview.validation.errors,
    records: inserted,
  });
}

export function addRecordFile(recordId: string, input: Omit<RecordFileItem, "id" | "recordId" | "uploadedAt">) {
  const record = getRecord(recordId);
  if (!record) return null;

  const file: RecordFileItem = {
    ...input,
    id: `file-${nextSequence()}`,
    recordId,
    uploadedAt: new Date().toISOString(),
  };
  const files = getState().files.get(recordId) ?? [];
  getState().files.set(recordId, [file, ...files]);
  return clone(file);
}

export function deleteRecordFile(recordId: string, fileId: string) {
  const files = getState().files.get(recordId) ?? [];
  const file = files.find((item) => item.id === fileId);
  if (!file) return null;
  getState().files.set(recordId, files.filter((item) => item.id !== fileId));
  return clone(file);
}

export function addRecordNote(recordId: string, input: { content: string; authorId: string }) {
  const record = getRecord(recordId);
  if (!record) return null;

  const note: RecordNoteItem = {
    id: `note-${nextSequence()}`,
    recordId,
    content: input.content,
    authorId: input.authorId,
    createdAt: new Date().toISOString(),
  };
  const notes = getState().notes.get(recordId) ?? [];
  getState().notes.set(recordId, [note, ...notes]);
  return clone(note);
}

export function deleteRecordNote(recordId: string, noteId: string) {
  const notes = getState().notes.get(recordId) ?? [];
  const note = notes.find((item) => item.id === noteId);
  if (!note) return null;
  getState().notes.set(recordId, notes.filter((item) => item.id !== noteId));
  return clone(note);
}

export function resetCustomDataStoreForTests() {
  globalForStore.__productionTrackerExtensionState = createState();
}

function getState() {
  globalForStore.__productionTrackerExtensionState ??= createState();
  return globalForStore.__productionTrackerExtensionState;
}

function createState(): ExtensionState {
  return {
    entityTypes: new Map(getIndustryTemplates().map((template) => [template.id, templateToEntity(template)])),
    files: new Map(),
    notes: new Map(),
    sequence: 1000,
  };
}

function templateToEntity(template: IndustryTemplate): EntityTypeItem {
  return {
    ...clone(template),
    slug: slugify(template.id),
    projectId: null,
    isTemplate: true,
    createdBy: "system",
    createdAt,
    updatedAt: createdAt,
  };
}

function normalizeRecordData(entity: EntityTypeItem, data: Record<string, unknown>, createdBy: string, recordId: string) {
  const nextData: Record<string, unknown> = {};

  for (const field of entity.fields) {
    const value = data[field.key] ?? field.defaultValue;
    if (field.type === "auto_number") {
      nextData[field.key] = value || buildAutoNumber(entity, field);
      continue;
    }
    if (field.type === "created_at") {
      nextData[field.key] = value || new Date().toISOString();
      continue;
    }
    if (field.type === "updated_at") {
      nextData[field.key] = new Date().toISOString();
      continue;
    }
    if (field.type === "created_by") {
      nextData[field.key] = value || createdBy;
      continue;
    }
    if (value !== undefined) {
      nextData[field.key] = normalizeFieldValue(value, field);
    }
  }

  for (const [key, value] of Object.entries(data)) {
    if (!(key in nextData)) nextData[key] = value;
  }

  const missing = entity.fields.find((field) => field.required && isEmpty(nextData[field.key]));
  if (missing) {
    throw new Error(`${missing.name} is required.`);
  }

  return applyFormulaFields({ ...nextData, id: recordId }, entity.fields);
}

function normalizeFieldValue(value: unknown, field: FieldDefinition) {
  if (["number", "currency", "percentage", "score", "rating"].includes(field.type)) {
    if (value === "") return undefined;
    const parsed = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : value;
  }

  if (field.type === "boolean") {
    return value === true || ["true", "1", "yes", "是"].includes(String(value).toLowerCase());
  }

  if (field.type === "multiselect") {
    return Array.isArray(value) ? value : String(value).split(",").map((item) => item.trim()).filter(Boolean);
  }

  return value;
}

function buildAutoNumber(entity: EntityTypeItem, field: FieldDefinition) {
  const prefix = field.config?.prefix ?? `${entity.slug.toUpperCase()}-`;
  const padding = field.config?.padding ?? 4;
  return `${prefix}${String(entity.records.length + 1).padStart(padding, "0")}`;
}

function findEntityByRecord(recordId: string) {
  return Array.from(getState().entityTypes.values()).find((entity) => entity.records.some((record) => record.id === recordId)) ?? null;
}

function defaultFields(): FieldDefinition[] {
  return [
    { id: "name", key: "name", name: "名称", type: "text", required: true, order: 0, width: 180 },
    { id: "status", key: "status", name: "状态", type: "status", required: false, order: 1, width: 130, options: ["pending", "active", "closed"].map((value) => ({ value, label: value })) },
    { id: "amount", key: "amount", name: "金额", type: "currency", required: false, order: 2, width: 140, config: { currency: "CNY", precision: 2 } },
  ];
}

function normalizeFieldOrder(fields: FieldDefinition[]) {
  return fields
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((field, order) => ({ ...field, order }));
}

function uniqueSlug(baseSlug: string, existingSlugs: string[]) {
  const base = slugify(baseSlug) || "entity";
  let candidate = base;
  let index = 2;
  while (existingSlugs.includes(candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }
  return candidate;
}

function slugify(value: string) {
  const ascii = value
    .trim()
    .toLowerCase()
    .replace(/[\u4e00-\u9fa5]/g, (char) => `u${char.charCodeAt(0).toString(16)}`)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ascii || "entity";
}

function nextSequence() {
  const state = getState();
  state.sequence += 1;
  return state.sequence;
}

function isEmpty(value: unknown) {
  return value === undefined || value === null || String(value).trim() === "";
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
