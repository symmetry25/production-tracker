import { EntityTypesIndex, PageHeader, TemplateInstallCard } from "@/components/extensions/entity-type-pages";
import { listEntityTypes, listTemplates } from "@/lib/custom-data-store";

export default function NewEntityTypePage() {
  const templates = listTemplates();
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Create schema" title="新建实体类型" description="当前版本建议先从模板安装，再进入字段管理微调。API 已支持 POST /api/entity-types 创建完全自定义实体。" />
      <section className="border border-[#34322b] bg-[#181713] p-4">
        <p className="text-sm font-semibold">可安装模板</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => <TemplateInstallCard key={template.id} id={template.id} name={template.name} description={template.description} />)}
        </div>
      </section>
      <EntityTypesIndex entities={listEntityTypes()} />
    </div>
  );
}
