import { DashboardsIndex } from "@/components/dashboard-builder/dashboard-pages";
import { listDashboards } from "@/lib/dashboard-builder";

export default function DashboardsPage() {
  return <DashboardsIndex dashboards={listDashboards()} />;
}
