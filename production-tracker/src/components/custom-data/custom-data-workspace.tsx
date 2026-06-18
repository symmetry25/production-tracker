"use client";

import { useMemo, useState } from "react";

import type { CustomRecord, IndustryTemplate } from "@/lib/custom-data";
import type { FieldDefinition } from "@/lib/field-types";
import { applyFormulaFields } from "@/lib/formula";

type EntryMode = "form" | "spreadsheet" | "quick";

const emptyRecords: CustomRecord[] = [];

export function CustomDataWorkspace({ templates }: { templates: IndustryTemplate[] }) {
  const [activeTemplateId, setActiveTemplateId] = useState(templates[0]?.id ?? "");
  const [entryMode, setEntryMode] = useState<EntryMode>("spreadsheet");
  const [recordsByTemplate, setRecordsByTemplate] = useState<Record<string, CustomRecord[]>>(() =>
    Object.fromEntries(templates.map((template) => [template.id, template.records])),
  );
  const activeTemplate = templates.find((template) => template.id === activeTemplateId) ?? templates[0];
  const records = recordsByTemplate[activeTemplate.id] ?? emptyRecords;
  const visibleFields = useMemo(() => activeTemplate.fields.filter((field) => !field.hidden).sort((a, b) => a.order - b.order), [activeTemplate]);
  const editableFields = visibleFields.filter((field) => !field.readOnly && !["created_at", "updated_at", "created_by"].includes(field.type));
  const totals = useMemo(() => buildColumnTotals(records, visibleFields), [records, visibleFields]);

  function createRecord(data: Record<string, unknown>) {
    const nextRecord: CustomRecord = {
      id: `local-${Date.now()}`,
      data: applyFormulaFields(data, activeTemplate.fields),
      createdAt: new Date().toISOString(),
      createdBy: "当前用户",
    };

    setRecordsByTemplate((current) => ({
      ...current,
      [activeTemplate.id]: [nextRecord, ...(current[activeTemplate.id] ?? [])],
    }));
  }

  function updateCell(recordId: string, fieldKey: string, value: unknown) {
    setRecordsByTemplate((current) => ({
      ...current,
      [activeTemplate.id]: (current[activeTemplate.id] ?? []).map((record) => {
        if (record.id !== recordId) return record;
        const nextData = applyFormulaFields({ ...record.data, [fieldKey]: normalizeInputValue(value, activeTemplate.fields.find((field) => field.key === fieldKey)) }, activeTemplate.fields);
        return { ...record, data: nextData };
      }),
    }));
  }

  return (
    <div className="space-y-5">
      <section className="border border-[#34322b] bg-[#181713]">
        <div className="grid gap-0 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <TemplateRail templates={templates} activeId={activeTemplate.id} onSelect={setActiveTemplateId} />

          <div className="min-w-0 border-t border-[#34322b] xl:border-l xl:border-t-0">
            <div className="flex flex-col gap-4 border-b border-[#34322b] px-5 py-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">Universal Data Entry</p>
                <h2 className="mt-2 truncate text-2xl font-semibold text-[#f4f1e8]">{activeTemplate.name}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#aaa599]">{activeTemplate.description}</p>
              </div>
              <SegmentedMode value={entryMode} onChange={setEntryMode} />
            </div>

            <QuickEntry fields={editableFields.slice(0, 4)} onSubmit={createRecord} mode={entryMode} />

            <div className="p-4">
              {entryMode === "form" ? (
                <FormEntry fields={editableFields} onSubmit={createRecord} />
              ) : (
                <SpreadsheetEntry fields={visibleFields} records={records} totals={totals} onUpdate={updateCell} />
              )}
            </div>
          </div>

          <ContextPanel template={activeTemplate} records={records} />
        </div>
      </section>
    </div>
  );
}

function TemplateRail({ templates, activeId, onSelect }: { templates: IndustryTemplate[]; activeId: string; onSelect: (id: string) => void }) {
  return (
    <aside className="border-b border-[#34322b] bg-[#151410] xl:border-b-0">
      <div className="border-b border-[#34322b] px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7f7a70]">Industry Templates</p>
        <p className="mt-2 text-xs leading-5 text-[#aaa599]">一键切换行业模板，字段、表格和录入控件会跟着改变。</p>
      </div>
      <div className="max-h-[720px] overflow-auto p-3">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            className={[
              "mb-2 block w-full border px-3 py-3 text-left transition",
              activeId === template.id ? "border-[#d8b46a] bg-[#22201c]" : "border-[#2f2d27] bg-[#11110f] hover:border-[#5a564e]",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-sm font-semibold text-[#f4f1e8]">{template.name}</span>
              <span className="rounded-sm px-2 py-1 text-[10px] font-semibold uppercase" style={{ backgroundColor: `${template.color}22`, color: template.color }}>
                {template.industry}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#8f8a7e]">{template.description}</p>
          </button>
        ))}
      </div>
    </aside>
  );
}

function SegmentedMode({ value, onChange }: { value: EntryMode; onChange: (mode: EntryMode) => void }) {
  const modes: { value: EntryMode; label: string }[] = [
    { value: "spreadsheet", label: "Spreadsheet" },
    { value: "form", label: "Form" },
    { value: "quick", label: "Quick" },
  ];

  return (
    <div className="flex h-10 shrink-0 border border-[#34322b] bg-[#11110f] p-1">
      {modes.map((mode) => (
        <button
          key={mode.value}
          type="button"
          onClick={() => onChange(mode.value)}
          className={[
            "px-3 text-xs font-semibold transition",
            value === mode.value ? "bg-[#d8b46a] text-[#171713]" : "text-[#aaa599] hover:text-[#f4f1e8]",
          ].join(" ")}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}

function QuickEntry({ fields, onSubmit, mode }: { fields: FieldDefinition[]; onSubmit: (data: Record<string, unknown>) => void; mode: EntryMode }) {
  const [draft, setDraft] = useState<Record<string, unknown>>({});

  return (
    <form
      className={["border-b border-[#34322b] bg-[#14130f] p-3", mode === "form" ? "hidden" : ""].join(" ")}
      onSubmit={(event) => {
        event.preventDefault();
        if (!fields.some((field) => String(draft[field.key] ?? "").trim())) return;
        onSubmit(draft);
        setDraft({});
      }}
    >
      <div className="grid gap-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_120px]">
        {fields.map((field) => (
          <FieldInput key={field.key} field={field} value={draft[field.key] ?? ""} onChange={(value) => setDraft((current) => ({ ...current, [field.key]: value }))} compact />
        ))}
        <button type="submit" className="h-10 bg-[#d8b46a] px-4 text-xs font-semibold text-[#171713] transition hover:bg-[#e8c678]">
          + 添加
        </button>
      </div>
    </form>
  );
}

function FormEntry({ fields, onSubmit }: { fields: FieldDefinition[]; onSubmit: (data: Record<string, unknown>) => void }) {
  const [draft, setDraft] = useState<Record<string, unknown>>({});

  return (
    <form
      className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(draft);
        setDraft({});
      }}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {fields.map((field) => (
          <FieldInput key={field.key} field={field} value={draft[field.key] ?? ""} onChange={(value) => setDraft((current) => ({ ...current, [field.key]: value }))} />
        ))}
      </div>
      <aside className="border border-[#34322b] bg-[#11110f] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d8b46a]">Context</p>
        <p className="mt-3 text-sm leading-6 text-[#aaa599]">这里预留给 AI 识别、历史记录、关联条目。识别结果后续会直接填充左侧表单。</p>
        <button type="submit" className="mt-5 h-10 w-full bg-[#d8b46a] text-sm font-semibold text-[#171713]">
          保存记录
        </button>
      </aside>
    </form>
  );
}

function SpreadsheetEntry({
  fields,
  records,
  totals,
  onUpdate,
}: {
  fields: FieldDefinition[];
  records: CustomRecord[];
  totals: Record<string, string>;
  onUpdate: (recordId: string, fieldKey: string, value: unknown) => void;
}) {
  return (
    <div className="overflow-auto border border-[#34322b]">
      <table className="min-w-[1080px] w-full border-collapse text-left text-xs">
        <thead className="bg-[#1f1e1a] text-[11px] uppercase tracking-[0.12em] text-[#7f7a70]">
          <tr>
            {fields.map((field) => (
              <th key={field.key} className="border-b border-r border-[#34322b] px-3 py-2 last:border-r-0" style={{ width: field.width }}>
                {field.name}
              </th>
            ))}
            <th className="border-b border-[#34322b] px-3 py-2">创建人</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-b border-[#2a2a28] hover:bg-[#1d1c18]">
              {fields.map((field) => (
                <td key={field.key} className="border-r border-[#2a2a28] px-3 py-2 last:border-r-0">
                  {field.readOnly ? (
                    <span className="font-mono text-[#d8b46a]">{formatFieldValue(record.data[field.key], field)}</span>
                  ) : (
                    <CellEditor field={field} value={record.data[field.key] ?? ""} onChange={(value) => onUpdate(record.id, field.key, value)} />
                  )}
                </td>
              ))}
              <td className="px-3 py-2 text-[#8f8a7e]">{record.createdBy}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-[#11110f] font-mono text-[#d8b46a]">
          <tr>
            {fields.map((field) => (
              <td key={field.key} className="border-r border-[#2a2a28] px-3 py-2">
                {totals[field.key] ?? ""}
              </td>
            ))}
            <td className="px-3 py-2 text-[#7f7a70]">合计行</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function ContextPanel({ template, records }: { template: IndustryTemplate; records: CustomRecord[] }) {
  const numericFields = template.fields.filter((field) => ["number", "currency", "percentage", "score", "formula"].includes(field.type));
  const requiredFields = template.fields.filter((field) => field.required);

  return (
    <aside className="border-t border-[#34322b] bg-[#151410] xl:border-l xl:border-t-0">
      <div className="border-b border-[#34322b] px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d8b46a]">Input Extensions</p>
        <h3 className="mt-2 text-lg font-semibold">Excel · AI · Schema</h3>
      </div>
      <div className="space-y-3 p-4">
        <PanelCard title="Excel 导入" detail="下一步接入字段映射、预检报告和错误行下载。" action="打开导入向导" />
        <PanelCard title="AI 识别" detail="发票、手写表格、合同和名片识别会按当前字段模板回填。" action="上传识别材料" />
        <PanelCard title="动态 Schema" detail={`${template.fields.length} 个字段 · ${requiredFields.length} 个必填 · ${numericFields.length} 个可聚合字段`} action="管理字段" />
      </div>
      <div className="border-t border-[#34322b] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">records</p>
        <p className="mt-2 font-mono text-3xl text-[#f4f1e8]">{records.length}</p>
        <p className="mt-2 text-xs leading-5 text-[#aaa599]">这套结构未来可以落到 EntityType / FieldDef / EntityRecord 数据库模型。</p>
      </div>
    </aside>
  );
}

function PanelCard({ title, detail, action }: { title: string; detail: string; action: string }) {
  return (
    <div className="border border-[#34322b] bg-[#11110f] p-3">
      <p className="text-sm font-semibold text-[#f4f1e8]">{title}</p>
      <p className="mt-2 text-xs leading-5 text-[#8f8a7e]">{detail}</p>
      <button type="button" className="mt-3 h-8 border border-[#3f3c33] px-3 text-xs text-[#aaa599]">
        {action}
      </button>
    </div>
  );
}

function FieldInput({ field, value, onChange, compact = false }: { field: FieldDefinition; value: unknown; onChange: (value: unknown) => void; compact?: boolean }) {
  return (
    <label className="block">
      {!compact ? <span className="mb-1 block text-xs text-[#aaa599]">{field.name}{field.required ? " *" : ""}</span> : null}
      <CellEditor field={field} value={value} onChange={onChange} placeholder={field.name} />
    </label>
  );
}

function CellEditor({ field, value, onChange, placeholder }: { field: FieldDefinition; value: unknown; onChange: (value: unknown) => void; placeholder?: string }) {
  const baseClass = "h-9 w-full border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#f4f1e8] outline-none focus:border-[#d8b46a]";

  if (field.type === "select" || field.type === "status") {
    return (
      <select value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} className={baseClass}>
        <option value="">--</option>
        {(field.options ?? []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "date" || field.type === "datetime") {
    return <input type={field.type === "datetime" ? "datetime-local" : "date"} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} className={baseClass} />;
  }

  if (["number", "currency", "percentage", "score", "rating"].includes(field.type)) {
    return <input type="number" value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={baseClass} />;
  }

  return <input type="text" value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={baseClass} />;
}

function buildColumnTotals(records: CustomRecord[], fields: FieldDefinition[]) {
  return Object.fromEntries(
    fields
      .filter((field) => ["number", "currency", "percentage", "score", "formula"].includes(field.type))
      .map((field) => {
        const sum = records.reduce((total, record) => total + Number(record.data[field.key] ?? 0), 0);
        return [field.key, formatFieldValue(sum, field)];
      }),
  );
}

function normalizeInputValue(value: unknown, field?: FieldDefinition) {
  if (!field) return value;
  if (["number", "currency", "percentage", "score", "rating"].includes(field.type)) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return value;
}

function formatFieldValue(value: unknown, field: FieldDefinition) {
  if (value === undefined || value === null || value === "") return "--";
  if (field.type === "currency") return `¥${Number(value).toLocaleString("zh-CN", { maximumFractionDigits: 2 })}`;
  if (field.type === "percentage") return `${Number(value).toLocaleString("zh-CN", { maximumFractionDigits: 1 })}%`;
  if (field.type === "formula") return Number(value).toLocaleString("zh-CN", { maximumFractionDigits: 2 });
  return String(value);
}
