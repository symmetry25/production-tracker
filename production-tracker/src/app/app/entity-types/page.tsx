import { EntityTypesIndex } from "@/components/extensions/entity-type-pages";
import { listEntityTypes } from "@/lib/custom-data-store";

export default function EntityTypesPage() {
  return <EntityTypesIndex entities={listEntityTypes()} />;
}
