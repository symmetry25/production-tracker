import { notFound } from "next/navigation";

import { DashboardView } from "@/components/dashboard-builder/dashboard-pages";
import { getDashboardAsync, getWidgetDataAsync } from "@/lib/dashboard-builder";

export default async function DashboardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dashboard = await getDashboardAsync(id);
  if (!dashboard) notFound();
  const widgetData = Object.fromEntries(await Promise.all(dashboard.widgets.map(async (widget) => [widget.id, await getWidgetDataAsync(widget.config.dataSource)])));
  return <DashboardView dashboard={dashboard} widgetData={widgetData} />;
}
