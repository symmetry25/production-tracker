import { notFound } from "next/navigation";

import { DashboardView } from "@/components/dashboard-builder/dashboard-pages";
import { getDashboard, getWidgetData } from "@/lib/dashboard-builder";

export default async function DashboardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dashboard = getDashboard(id);
  if (!dashboard) notFound();
  const widgetData = Object.fromEntries(dashboard.widgets.map((widget) => [widget.id, getWidgetData(widget.config.dataSource)]));
  return <DashboardView dashboard={dashboard} widgetData={widgetData} />;
}
