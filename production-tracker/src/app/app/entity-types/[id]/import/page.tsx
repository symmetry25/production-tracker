import { notFound } from "next/navigation";

import { EntityImportPageView } from "@/components/extensions/entity-type-pages";
import { getEntityType, previewImport } from "@/lib/custom-data-store";

const sampleText = "采购单号,供应商,单价,数量,状态\nPO-0099,测试供应商,1200,2,pending\nPO-0100,错误供应商,N/A,1,pending";

export default async function EntityImportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entity = getEntityType(id);
  const preview = previewImport(id, { sourceText: sampleText });
  if (!entity || !preview) notFound();
  return <EntityImportPageView entity={entity} preview={preview} />;
}
