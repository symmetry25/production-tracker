import { AiScansTable } from "@/components/ai/ai-pages";
import { PageHeader } from "@/components/extensions/entity-type-pages";
import { listAiScans } from "@/lib/ai-recognition";

export default function AiScansPage() {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="AI scans" title="AI 识别历史" description="这里保存每次识别的模式、置信度、原始 JSON 和关联实体/记录，用于审计追溯。" />
      <AiScansTable scans={listAiScans()} />
    </div>
  );
}
