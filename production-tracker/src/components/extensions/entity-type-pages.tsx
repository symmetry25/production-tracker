import Link from "next/link";

import type { EntityTypeItem, ImportPreview } from "@/lib/custom-data-store";
import type { FieldDefinition } from "@/lib/field-types";

export function EntityTypesIndex({ entities }: { entities: EntityTypeItem[] }) {
  const totalRecords = entities.reduce((sum, entity) => sum + entity.records.length, 0);
  const totalFields = entities.reduce((sum, entity) => sum + entity.fields.length, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Dynamic schema"
        title="实体类型与通用数据表"
        description="把采购单、库存、工单、CRM、镜头追踪等行业模板变成可配置实体。字段、记录、导入和仪表盘都会跟随实体定义。"
        action={<Link href="/app/entity-types/new" className="h-9 border border-[#d8b46a]/55 bg-[#d8b46a]/10 px-4 py-2 text-xs font-semibold text-[#e8c678]">新建实体</Link>}
      />
      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Entity Types" value={entities.length} />
        <Metric label="Records" value={totalRecords} />
        <Metric label="Fields" value={totalFields} />
      </div>
      <section className="border border-[#34322b] bg-[#181713]">
        <div className="grid grid-cols-[1.2fr_120px_120px_1fr_160px] border-b border-[#2a2a28] bg-[#1e1e1c] px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-[#6e6e69]">
          <span>名称</span>
          <span>行业</span>
          <span>记录</span>
          <span>说明</span>
          <span>操作</span>
        </div>
        {entities.map((entity) => (
          <div key={entity.id} className="grid grid-cols-[1.2fr_120px_120px_1fr_160px] items-center border-b border-[#2a2a28] px-4 py-3 text-sm last:border-b-0">
            <span className="flex min-w-0 items-center gap-3">
              <span className="h-8 w-1 shrink-0" style={{ backgroundColor: entity.color }} />
              <span className="min-w-0">
                <Link href={`/app/entity-types/${entity.id}`} className="block truncate font-semibold text-[#f4f1e8] hover:text-[#e8c678]">{entity.name}</Link>
                <span className="mt-1 block truncate font-mono text-[11px] text-[#7f7a70]">{entity.slug}</span>
              </span>
            </span>
            <span className="text-[#c9c3b5]">{entity.industry}</span>
            <span className="font-mono text-[#e8c678]">{entity.records.length}</span>
            <span className="truncate text-[#8f8a7e]">{entity.description}</span>
            <span className="flex gap-2 text-xs">
              <Link className="text-[#83d6ae] hover:text-[#b7f0cd]" href={`/app/entity-types/${entity.id}/import`}>导入</Link>
              <Link className="text-[#d8b46a] hover:text-[#e8c678]" href={`/app/entity-types/${entity.id}/settings`}>字段</Link>
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}

export function EntityTypeDetail({ entity }: { entity: EntityTypeItem }) {
  const visibleFields = entity.fields.filter((field) => !field.hidden).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Dynamic table"
        title={entity.name}
        description={entity.description}
        action={
          <div className="flex gap-2">
            <Link href={`/api/entity-types/${entity.id}/export`} className="h-9 border border-[#3f3c33] px-4 py-2 text-xs text-[#c9c3b5] hover:border-[#d8b46a]">导出 Excel</Link>
            <Link href={`/app/entity-types/${entity.id}/import`} className="h-9 border border-[#d8b46a]/55 bg-[#d8b46a]/10 px-4 py-2 text-xs font-semibold text-[#e8c678]">导入数据</Link>
          </div>
        }
      />
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Records" value={entity.records.length} />
        <Metric label="Fields" value={entity.fields.length} />
        <Metric label="Required" value={entity.fields.filter((field) => field.required).length} />
        <Metric label="Formula" value={entity.fields.filter((field) => field.type === "formula").length} />
      </div>
      <div className="overflow-auto border border-[#34322b] bg-[#181713]">
        <table className="min-w-[1040px] w-full border-collapse text-left text-xs">
          <thead className="bg-[#1e1e1c] text-[11px] uppercase tracking-[0.12em] text-[#6e6e69]">
            <tr>
              {visibleFields.map((field) => (
                <th key={field.key} className="border-b border-r border-[#2a2a28] px-3 py-2 last:border-r-0">{field.name}</th>
              ))}
              <th className="border-b border-[#2a2a28] px-3 py-2">创建人</th>
            </tr>
          </thead>
          <tbody>
            {entity.records.map((record) => (
              <tr key={record.id} className="border-b border-[#2a2a28] hover:bg-[#1f1e1a]">
                {visibleFields.map((field) => (
                  <td key={field.key} className="border-r border-[#2a2a28] px-3 py-2 last:border-r-0">{formatCell(record.data[field.key], field)}</td>
                ))}
                <td className="px-3 py-2 text-[#8f8a7e]">{record.createdBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function EntitySettings({ entity }: { entity: EntityTypeItem }) {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Schema settings" title={`${entity.name} 字段管理`} description="字段顺序、字段类型、必填、只读、公式和表格宽度都会决定录入端与可视化端如何理解数据。" />
      <section className="border border-[#34322b] bg-[#181713]">
        <div className="grid grid-cols-[80px_1fr_160px_120px_1fr] border-b border-[#2a2a28] bg-[#1e1e1c] px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-[#6e6e69]">
          <span>Order</span>
          <span>字段</span>
          <span>类型</span>
          <span>规则</span>
          <span>配置</span>
        </div>
        {entity.fields.map((field) => (
          <div key={field.id} className="grid grid-cols-[80px_1fr_160px_120px_1fr] border-b border-[#2a2a28] px-4 py-3 text-sm last:border-b-0">
            <span className="font-mono text-[#8f8a7e]">{field.order + 1}</span>
            <span>
              <span className="font-semibold text-[#f4f1e8]">{field.name}</span>
              <span className="ml-2 font-mono text-[11px] text-[#7f7a70]">{field.key}</span>
            </span>
            <span className="text-[#e8c678]">{field.type}</span>
            <span className="text-[#c9c3b5]">{[field.required ? "必填" : null, field.readOnly ? "只读" : null, field.hidden ? "隐藏" : null].filter(Boolean).join(" / ") || "--"}</span>
            <span className="truncate font-mono text-xs text-[#8f8a7e]">{field.config ? JSON.stringify(field.config) : "--"}</span>
          </div>
        ))}
      </section>
    </div>
  );
}

export function EntityImportPageView({ entity, preview }: { entity: EntityTypeItem; preview: ImportPreview }) {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Excel import" title={`${entity.name} 导入向导`} description="支持 CSV、TSV、从 Excel 复制的表格文本，以及 API multipart Excel 文件上传。这里展示默认样例的字段映射和预检结果。" />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="border border-[#34322b] bg-[#181713]">
          <div className="border-b border-[#2a2a28] px-4 py-3">
            <p className="text-sm font-semibold">字段映射预检</p>
          </div>
          <div className="grid grid-cols-[1fr_1fr_100px] border-b border-[#2a2a28] bg-[#1e1e1c] px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-[#6e6e69]">
            <span>Excel 列</span>
            <span>系统字段</span>
            <span>状态</span>
          </div>
          {preview.parsed.headers.map((header) => (
            <div key={header} className="grid grid-cols-[1fr_1fr_100px] border-b border-[#2a2a28] px-4 py-3 text-sm">
              <span className="text-[#f4f1e8]">{header}</span>
              <span className="font-mono text-[#e8c678]">{preview.mapping[header] || "忽略"}</span>
              <span className={preview.mapping[header] ? "text-[#83d6ae]" : "text-[#8f8a7e]"}>{preview.mapping[header] ? "匹配" : "跳过"}</span>
            </div>
          ))}
        </section>
        <aside className="space-y-3">
          <Metric label="Total Rows" value={preview.validation.totalRows} />
          <Metric label="Valid Rows" value={preview.validation.validRows} />
          <Metric label="Error Rows" value={preview.validation.errorRows} />
          <div className="border border-[#34322b] bg-[#181713] p-4">
            <p className="text-sm font-semibold">错误详情</p>
            <div className="mt-3 space-y-2 text-xs text-[#ff9c8c]">
              {preview.validation.errors.length ? preview.validation.errors.map((error) => <p key={`${error.row}-${error.field}`}>行 {error.row}: {error.field} - {error.message}</p>) : <p className="text-[#83d6ae]">预检通过。</p>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string | null; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        {description ? <p className="mt-2 max-w-4xl text-sm leading-6 text-[#aaa599]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-[#34322b] bg-[#181713] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">{label}</p>
      <p className="mt-2 font-mono text-2xl text-[#f4f1e8]">{typeof value === "number" ? value.toLocaleString("zh-CN") : value}</p>
    </div>
  );
}

function formatCell(value: unknown, field: FieldDefinition) {
  if (value === undefined || value === null || value === "") return <span className="text-[#5f5b52]">--</span>;
  if (field.type === "currency") return <span className="font-mono text-[#e8c678]">¥{Number(value).toLocaleString("zh-CN")}</span>;
  if (field.type === "percentage") return <span className="font-mono text-[#e8c678]">{Number(value).toLocaleString("zh-CN")}%</span>;
  if (field.type === "score" || field.type === "rating") return <span className="font-mono text-[#83d6ae]">{String(value)}</span>;
  return <span className="text-[#c9c3b5]">{String(value)}</span>;
}
