import { notFound } from "next/navigation";

import { DashboardEditor } from "@/components/dashboard-builder/dashboard-pages";
import { getDashboard } from "@/lib/dashboard-builder";
import { listEntityTypes } from "@/lib/custom-data-store";

export default async function DashboardEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dashboard = getDashboard(id);
  if (!dashboard) notFound();
  return <DashboardEditor dashboard={dashboard} entities={listEntityTypes()} />;
}
