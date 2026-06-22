import { DashboardCreateForm } from "@/components/dashboard-builder/dashboard-create-form";
import { PageHeader } from "@/components/extensions/entity-type-pages";
import { listEntityTypesAsync } from "@/lib/custom-data-store";
import { getCurrentProjectId } from "@/lib/current-project";

export default async function NewDashboardPage() {
  const projectId = await getCurrentProjectId();
  const projectEntities = projectId ? await listEntityTypesAsync({ projectId }) : [];
  const entities = projectEntities.length ? projectEntities : await listEntityTypesAsync();

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="New dashboard" title="新建仪表盘" description="选择制片成本、供应商审计或空白画布，系统会根据当前项目的实体字段生成一套可继续拖拽编辑的初始 Widget。" />
      <DashboardCreateForm entities={entities} projectId={projectId} />
    </div>
  );
}
