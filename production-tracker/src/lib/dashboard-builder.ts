import { listEntityTypes, listRecords, listRecordsAsync } from "@/lib/custom-data-store";

export type WidgetType =
  | "metric_card"
  | "bar_chart"
  | "line_chart"
  | "pie_chart"
  | "stacked_bar"
  | "heatmap"
  | "scatter"
  | "table"
  | "progress_bar"
  | "funnel"
  | "gauge"
  | "timeline"
  | "map"
  | "text";

export type DashboardFilter = {
  field: string;
  operator: "eq" | "neq" | "contains" | "gt" | "gte" | "lt" | "lte";
  value: unknown;
};

export type WidgetConfig = {
  id: string;
  type: WidgetType;
  title: string;
  dataSource: {
    entityTypeId: string;
    filters?: DashboardFilter[];
    groupBy?: string;
    aggregation?: {
      field: string;
      fn: "count" | "sum" | "avg" | "min" | "max";
    };
    sortBy?: string;
    sortDir?: "asc" | "desc";
    limit?: number;
  };
  style: {
    colorScheme: string;
    showLegend: boolean;
    showLabels: boolean;
  };
  layout: { x: number; y: number; w: number; h: number };
  refreshInterval?: number;
};

export type DashboardItem = {
  id: string;
  name: string;
  description: string | null;
  projectId: string | null;
  createdById: string;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
  widgets: DashboardWidgetItem[];
};

export type DashboardWidgetItem = {
  id: string;
  dashboardId: string;
  config: WidgetConfig;
  order: number;
  createdAt: string;
};

type DashboardState = {
  dashboards: Map<string, DashboardItem>;
  sequence: number;
};

const globalForDashboard = globalThis as typeof globalThis & {
  __productionTrackerDashboardState?: DashboardState;
};

export function listDashboards(projectId?: string | null) {
  const dashboards = Array.from(getState().dashboards.values());
  return projectId ? dashboards.filter((dashboard) => dashboard.projectId === projectId) : dashboards;
}

export function getDashboard(id: string) {
  return clone(getState().dashboards.get(id) ?? null);
}

export function createDashboard(input: { name: string; description?: string | null; projectId?: string | null; isShared?: boolean }) {
  const now = new Date().toISOString();
  const dashboard: DashboardItem = {
    id: `dashboard-${nextSequence()}`,
    name: input.name,
    description: input.description ?? null,
    projectId: input.projectId ?? null,
    createdById: "demo-admin",
    isShared: input.isShared ?? false,
    createdAt: now,
    updatedAt: now,
    widgets: [],
  };
  getState().dashboards.set(dashboard.id, dashboard);
  return clone(dashboard);
}

export function updateDashboard(id: string, input: Partial<Pick<DashboardItem, "name" | "description" | "projectId" | "isShared">>) {
  const dashboard = getState().dashboards.get(id);
  if (!dashboard) return null;
  Object.assign(dashboard, input, { updatedAt: new Date().toISOString() });
  return clone(dashboard);
}

export function deleteDashboard(id: string) {
  const dashboard = getState().dashboards.get(id);
  if (!dashboard) return null;
  getState().dashboards.delete(id);
  return clone(dashboard);
}

export function addDashboardWidget(dashboardId: string, input: Partial<WidgetConfig> & Pick<WidgetConfig, "type" | "title" | "dataSource">) {
  const dashboard = getState().dashboards.get(dashboardId);
  if (!dashboard) return null;
  const widget: DashboardWidgetItem = {
    id: `widget-${nextSequence()}`,
    dashboardId,
    order: dashboard.widgets.length,
    createdAt: new Date().toISOString(),
    config: {
      id: `widget-config-${nextSequence()}`,
      type: input.type,
      title: input.title,
      dataSource: input.dataSource,
      style: input.style ?? { colorScheme: "producer", showLegend: true, showLabels: true },
      layout: input.layout ?? { x: 0, y: dashboard.widgets.length * 4, w: 6, h: 4 },
      refreshInterval: input.refreshInterval ?? 0,
    },
  };
  dashboard.widgets.push(widget);
  dashboard.updatedAt = new Date().toISOString();
  return clone(widget);
}

export function updateDashboardWidget(dashboardId: string, widgetId: string, input: Partial<WidgetConfig>) {
  const dashboard = getState().dashboards.get(dashboardId);
  const widget = dashboard?.widgets.find((item) => item.id === widgetId);
  if (!dashboard || !widget) return null;
  widget.config = { ...widget.config, ...input, dataSource: input.dataSource ?? widget.config.dataSource, style: input.style ?? widget.config.style, layout: input.layout ?? widget.config.layout };
  dashboard.updatedAt = new Date().toISOString();
  return clone(widget);
}

export function deleteDashboardWidget(dashboardId: string, widgetId: string) {
  const dashboard = getState().dashboards.get(dashboardId);
  if (!dashboard) return null;
  const widget = dashboard.widgets.find((item) => item.id === widgetId);
  dashboard.widgets = dashboard.widgets.filter((item) => item.id !== widgetId).map((item, order) => ({ ...item, order }));
  dashboard.updatedAt = new Date().toISOString();
  return widget ? clone(widget) : null;
}

export function updateDashboardLayout(dashboardId: string, layouts: { widgetId: string; layout: WidgetConfig["layout"] }[]) {
  const dashboard = getState().dashboards.get(dashboardId);
  if (!dashboard) return null;
  const layoutMap = new Map(layouts.map((item) => [item.widgetId, item.layout]));
  dashboard.widgets = dashboard.widgets.map((widget) => ({
    ...widget,
    config: {
      ...widget.config,
      layout: layoutMap.get(widget.id) ?? widget.config.layout,
    },
  }));
  dashboard.updatedAt = new Date().toISOString();
  return clone(dashboard.widgets);
}

export function getWidgetData(dataSource: WidgetConfig["dataSource"]) {
  const recordsResult = listRecords(dataSource.entityTypeId);
  if (!recordsResult) {
    return { rows: [], total: 0 };
  }

  return aggregateWidgetRows(recordsResult.records, dataSource);
}

export async function getWidgetDataAsync(dataSource: WidgetConfig["dataSource"]) {
  const recordsResult = await listRecordsAsync(dataSource.entityTypeId);
  if (!recordsResult) {
    return { rows: [], total: 0 };
  }

  return aggregateWidgetRows(recordsResult.records, dataSource);
}

function aggregateWidgetRows(records: { data: Record<string, unknown> }[], dataSource: WidgetConfig["dataSource"]) {
  const rows = records.filter((record) => matchesFilters(record.data, dataSource.filters ?? []));
  const aggregation = dataSource.aggregation;

  if (dataSource.groupBy && aggregation) {
    const grouped = new Map<string, number[]>();
    for (const record of rows) {
      const key = String(record.data[dataSource.groupBy] ?? "未填写");
      const value = aggregation.fn === "count" ? 1 : Number(record.data[aggregation.field] ?? 0);
      const list = grouped.get(key) ?? [];
      if (Number.isFinite(value)) list.push(value);
      grouped.set(key, list);
    }

    return {
      rows: Array.from(grouped.entries())
        .map(([name, values]) => ({ name, value: aggregate(values, aggregation.fn) }))
        .sort((a, b) => (dataSource.sortDir === "asc" ? a.value - b.value : b.value - a.value))
        .slice(0, dataSource.limit ?? 12),
      total: rows.length,
    };
  }

  if (aggregation) {
    const values = rows.map((record) => (aggregation.fn === "count" ? 1 : Number(record.data[aggregation.field] ?? 0))).filter(Number.isFinite);
    return { rows: [{ name: aggregation.fn, value: aggregate(values, aggregation.fn) }], total: rows.length };
  }

  return { rows: rows.slice(0, dataSource.limit ?? 100), total: rows.length };
}

export function resetDashboardsForTests() {
  globalForDashboard.__productionTrackerDashboardState = createState();
}

function getState() {
  globalForDashboard.__productionTrackerDashboardState ??= createState();
  return globalForDashboard.__productionTrackerDashboardState;
}

function createState(): DashboardState {
  const entities = listEntityTypes();
  const purchase = entities.find((entity) => entity.id === "retail-purchase-order") ?? entities[0];
  const inventory = entities.find((entity) => entity.id === "retail-inventory") ?? purchase;
  const now = "2026-06-18T00:00:00.000Z";
  const dashboard: DashboardItem = {
    id: "dashboard-producer-demo",
    name: "制片数据驾驶舱",
    description: "预算、供应商、库存和进度的通用可视化样板。",
    projectId: "demo-mkali-mission",
    createdById: "demo-admin",
    isShared: true,
    createdAt: now,
    updatedAt: now,
    widgets: [
      seedWidget("widget-spend", "dashboard-producer-demo", 0, "metric_card", "采购金额合计", purchase.id, { field: "total_amount", fn: "sum" }, undefined),
      seedWidget("widget-vendors", "dashboard-producer-demo", 1, "bar_chart", "供应商支出排行", purchase.id, { field: "total_amount", fn: "sum" }, "supplier"),
      seedWidget("widget-inventory", "dashboard-producer-demo", 2, "pie_chart", "库存分类金额", inventory.id, { field: "inventory_value", fn: "sum" }, "category"),
    ],
  };
  return { sequence: 200, dashboards: new Map([[dashboard.id, dashboard]]) };
}

function seedWidget(
  id: string,
  dashboardId: string,
  order: number,
  type: WidgetType,
  title: string,
  entityTypeId: string,
  aggregation: WidgetConfig["dataSource"]["aggregation"],
  groupBy: string | undefined,
): DashboardWidgetItem {
  return {
    id,
    dashboardId,
    order,
    createdAt: "2026-06-18T00:00:00.000Z",
    config: {
      id: `${id}-config`,
      type,
      title,
      dataSource: { entityTypeId, aggregation, groupBy, sortDir: "desc", limit: 8 },
      style: { colorScheme: "producer", showLegend: true, showLabels: true },
      layout: { x: (order % 2) * 6, y: Math.floor(order / 2) * 4, w: 6, h: 4 },
      refreshInterval: 0,
    },
  };
}

function matchesFilters(data: Record<string, unknown>, filters: DashboardFilter[]) {
  return filters.every((filter) => {
    const actual = data[filter.field];
    if (filter.operator === "eq") return actual === filter.value;
    if (filter.operator === "neq") return actual !== filter.value;
    if (filter.operator === "contains") return String(actual ?? "").toLowerCase().includes(String(filter.value ?? "").toLowerCase());
    const left = Number(actual);
    const right = Number(filter.value);
    if (!Number.isFinite(left) || !Number.isFinite(right)) return false;
    if (filter.operator === "gt") return left > right;
    if (filter.operator === "gte") return left >= right;
    if (filter.operator === "lt") return left < right;
    return left <= right;
  });
}

function aggregate(values: number[], fn: NonNullable<WidgetConfig["dataSource"]["aggregation"]>["fn"]) {
  if (fn === "count") return values.length;
  if (!values.length) return 0;
  if (fn === "sum") return values.reduce((sum, value) => sum + value, 0);
  if (fn === "avg") return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  if (fn === "min") return Math.min(...values);
  return Math.max(...values);
}

function nextSequence() {
  const state = getState();
  state.sequence += 1;
  return state.sequence;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
