import { EntityTypesIndex, PageHeader } from "@/components/extensions/entity-type-pages";
import { listEntityTypes, listTemplates } from "@/lib/custom-data-store";

export default function NewEntityTypePage() {
  const templates = listTemplates();
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Create schema" title="新建实体类型" description="当前版本建议先从模板安装，再进入字段管理微调。API 已支持 POST /api/entity-types 创建完全自定义实体。" />
      <section className="border border-[#34322b] bg-[#181713] p-4">
        <p className="text-sm font-semibold">可安装模板</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <div key={template.id} className="border border-[#2f2c25] bg-[#11110f] p-3">
              <p className="font-semibold text-[#f4f1e8]">{template.name}</p>
              <p className="mt-2 text-xs leading-5 text-[#8f8a7e]">{template.description}</p>
              <p className="mt-3 font-mono text-[11px] text-[#e8c678]">POST /api/templates/{template.id}/install</p>
            </div>
          ))}
        </div>
      </section>
      <EntityTypesIndex entities={listEntityTypes()} />
    </div>
  );
}
