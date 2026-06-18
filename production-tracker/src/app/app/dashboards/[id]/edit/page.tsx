import { notFound } from "next/navigation";

import { DashboardEditor } from "@/components/dashboard-builder/dashboard-pages";
import { getDashboardAsync, getWidgetDataAsync } from "@/lib/dashboard-builder";
import { listEntityTypesAsync } from "@/lib/custom-data-store";

export default async function DashboardEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dashboard = await getDashboardAsync(id);
  if (!dashboard) notFound();
  const [entities, widgetData] = await Promise.all([
    listEntityTypesAsync(),
    Promise.all(dashboard.widgets.map(async (widget) => [widget.id, await getWidgetDataAsync(widget.config.dataSource)] as const)),
  ]);
  return <DashboardEditor dashboard={dashboard} entities={entities} widgetData={Object.fromEntries(widgetData)} />;
}
