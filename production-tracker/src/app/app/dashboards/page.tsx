import { DashboardsIndex } from "@/components/dashboard-builder/dashboard-pages";
import { listDashboardsAsync } from "@/lib/dashboard-builder";

export default async function DashboardsPage() {
  return <DashboardsIndex dashboards={await listDashboardsAsync()} />;
}
