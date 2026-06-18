import { notFound } from "next/navigation";

import { EntityTypeDetail } from "@/components/extensions/entity-type-pages";
import { getEntityType } from "@/lib/custom-data-store";

export default async function EntityTypeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entity = getEntityType(id);
  if (!entity) notFound();
  return <EntityTypeDetail entity={entity} />;
}
