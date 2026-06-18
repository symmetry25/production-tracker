import { PageHeader } from "@/components/extensions/entity-type-pages";

export default function NewDashboardPage() {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="New dashboard" title="新建仪表盘" description="API 已支持 POST /api/dashboards 创建仪表盘。下一步可以把这里升级成表单：名称、项目、共享状态、初始模板。" />
      <div className="border border-[#34322b] bg-[#181713] p-5 font-mono text-xs leading-6 text-[#8f8a7e]">
        POST /api/dashboards {"{ name, description, projectId, isShared }"}
      </div>
    </div>
  );
}
