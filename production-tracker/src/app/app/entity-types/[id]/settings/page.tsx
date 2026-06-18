import { notFound } from "next/navigation";

import { EntitySettings } from "@/components/extensions/entity-type-pages";
import { getEntityTypeAsync } from "@/lib/custom-data-store";

export default async function EntitySettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entity = await getEntityTypeAsync(id);
  if (!entity) notFound();
  return <EntitySettings entity={entity} />;
}
