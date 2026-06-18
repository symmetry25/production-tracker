import { notFound } from "next/navigation";

import { DashboardEditor } from "@/components/dashboard-builder/dashboard-pages";
import { getDashboardAsync } from "@/lib/dashboard-builder";
import { listEntityTypesAsync } from "@/lib/custom-data-store";

export default async function DashboardEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dashboard = await getDashboardAsync(id);
  if (!dashboard) notFound();
  return <DashboardEditor dashboard={dashboard} entities={await listEntityTypesAsync()} />;
}
