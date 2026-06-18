import { notFound } from "next/navigation";

import { EntityTypeDetail } from "@/components/extensions/entity-type-pages";
import { getEntityTypeAsync } from "@/lib/custom-data-store";

export default async function EntityTypeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entity = await getEntityTypeAsync(id);
  if (!entity) notFound();
  return <EntityTypeDetail entity={entity} />;
}
