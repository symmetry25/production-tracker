import { EntityTypesIndex } from "@/components/extensions/entity-type-pages";
import { listEntityTypesAsync } from "@/lib/custom-data-store";

export default async function EntityTypesPage() {
  return <EntityTypesIndex entities={await listEntityTypesAsync()} />;
}
