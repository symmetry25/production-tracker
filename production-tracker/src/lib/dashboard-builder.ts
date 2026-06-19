import { listEntityTypes, listRecords, listRecordsAsync } from "@/lib/custom-data-store";
import { getPrisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

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
  demoVersion?: number;
};

type DbDashboard = {
  id: string;
  name: string;
  description: string | null;
  projectId: string | null;
  createdById: string;
  isShared: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  widgets: DbDashboardWidget[];
};

type DbDashboardWidget = {
  id: string;
  dashboardId: string;
  config: unknown;
  order: number;
  createdAt: Date | string;
};

const globalForDashboard = globalThis as typeof globalThis & {
  __productionTrackerDashboardState?: DashboardState;
};

const demoDashboardId = "dashboard-producer-demo";
const demoDashboardVersion = 3;

export function listDashboards(projectId?: string | null) {
  const dashboards = Array.from(getState().dashboards.values());
  return projectId ? dashboards.filter((dashboard) => dashboard.projectId === projectId) : dashboards;
}

export async function listDashboardsAsync(projectId?: string | null) {
  if (!shouldUsePersistentStore()) return listDashboards(projectId);

  const dashboards = await getPrisma().dashboard.findMany({
    where: projectId ? { projectId } : undefined,
    include: dashboardInclude,
    orderBy: { updatedAt: "desc" },
  });
  return dashboards.map(dashboardFromDb);
}

export function getDashboard(id: string) {
  return clone(getState().dashboards.get(id) ?? null);
}

export async function getDashboardAsync(id: string) {
  if (!shouldUsePersistentStore()) return getDashboard(id);

  const dashboard = await getPrisma().dashboard.findUnique({
    where: { id },
    include: dashboardInclude,
  });
  return dashboard ? dashboardFromDb(dashboard) : null;
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

export async function createDashboardAsync(input: { name: string; description?: string | null; projectId?: string | null; isShared?: boolean }) {
  if (!shouldUsePersistentStore()) return createDashboard(input);

  const dashboard = await getPrisma().dashboard.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      projectId: input.projectId ?? null,
      createdById: "demo-admin",
      isShared: input.isShared ?? false,
    },
    include: dashboardInclude,
  });
  return dashboardFromDb(dashboard);
}

export function updateDashboard(id: string, input: Partial<Pick<DashboardItem, "name" | "description" | "projectId" | "isShared">>) {
  const dashboard = getState().dashboards.get(id);
  if (!dashboard) return null;
  Object.assign(dashboard, input, { updatedAt: new Date().toISOString() });
  return clone(dashboard);
}

export async function updateDashboardAsync(id: string, input: Partial<Pick<DashboardItem, "name" | "description" | "projectId" | "isShared">>) {
  if (!shouldUsePersistentStore()) return updateDashboard(id, input);

  const existing = await getDashboardAsync(id);
  if (!existing) return null;
  const dashboard = await getPrisma().dashboard.update({
    where: { id: existing.id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.projectId !== undefined ? { projectId: input.projectId } : {}),
      ...(input.isShared !== undefined ? { isShared: input.isShared } : {}),
    },
    include: dashboardInclude,
  });
  return dashboardFromDb(dashboard);
}

export function deleteDashboard(id: string) {
  const dashboard = getState().dashboards.get(id);
  if (!dashboard) return null;
  getState().dashboards.delete(id);
  return clone(dashboard);
}

export async function deleteDashboardAsync(id: string) {
  if (!shouldUsePersistentStore()) return deleteDashboard(id);

  const existing = await getDashboardAsync(id);
  if (!existing) return null;
  const dashboard = await getPrisma().dashboard.delete({
    where: { id: existing.id },
    include: dashboardInclude,
  });
  return dashboardFromDb(dashboard);
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

export async function addDashboardWidgetAsync(dashboardId: string, input: Partial<WidgetConfig> & Pick<WidgetConfig, "type" | "title" | "dataSource">) {
  if (!shouldUsePersistentStore()) return addDashboardWidget(dashboardId, input);

  const dashboard = await getDashboardAsync(dashboardId);
  if (!dashboard) return null;
  const widgetId = `widget-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const config: WidgetConfig = {
    id: input.id ?? `${widgetId}-config`,
    type: input.type,
    title: input.title,
    dataSource: input.dataSource,
    style: input.style ?? { colorScheme: "producer", showLegend: true, showLabels: true },
    layout: input.layout ?? { x: 0, y: dashboard.widgets.length * 4, w: 6, h: 4 },
    refreshInterval: input.refreshInterval ?? 0,
  };
  const widget = await getPrisma().dashboardWidget.create({
    data: {
      id: widgetId,
      dashboardId: dashboard.id,
      order: dashboard.widgets.length,
      config: toPrismaJson(config),
    },
  });
  await touchDashboard(dashboard.id);
  return widgetFromDb(widget);
}

export function updateDashboardWidget(dashboardId: string, widgetId: string, input: Partial<WidgetConfig>) {
  const dashboard = getState().dashboards.get(dashboardId);
  const widget = dashboard?.widgets.find((item) => item.id === widgetId);
  if (!dashboard || !widget) return null;
  widget.config = { ...widget.config, ...input, dataSource: input.dataSource ?? widget.config.dataSource, style: input.style ?? widget.config.style, layout: input.layout ?? widget.config.layout };
  dashboard.updatedAt = new Date().toISOString();
  return clone(widget);
}

export async function updateDashboardWidgetAsync(dashboardId: string, widgetId: string, input: Partial<WidgetConfig>) {
  if (!shouldUsePersistentStore()) return updateDashboardWidget(dashboardId, widgetId, input);

  const widget = await getPrisma().dashboardWidget.findFirst({ where: { id: widgetId, dashboardId } });
  if (!widget) return null;
  const currentConfig = widgetConfigFromDb(widget.config, widget);
  const updated = await getPrisma().dashboardWidget.update({
    where: { id: widgetId },
    data: {
      config: toPrismaJson({
        ...currentConfig,
        ...input,
        dataSource: input.dataSource ?? currentConfig.dataSource,
        style: input.style ?? currentConfig.style,
        layout: input.layout ?? currentConfig.layout,
      }),
    },
  });
  await touchDashboard(dashboardId);
  return widgetFromDb(updated);
}

export function deleteDashboardWidget(dashboardId: string, widgetId: string) {
  const dashboard = getState().dashboards.get(dashboardId);
  if (!dashboard) return null;
  const widget = dashboard.widgets.find((item) => item.id === widgetId);
  dashboard.widgets = dashboard.widgets.filter((item) => item.id !== widgetId).map((item, order) => ({ ...item, order }));
  dashboard.updatedAt = new Date().toISOString();
  return widget ? clone(widget) : null;
}

export async function deleteDashboardWidgetAsync(dashboardId: string, widgetId: string) {
  if (!shouldUsePersistentStore()) return deleteDashboardWidget(dashboardId, widgetId);

  const widget = await getPrisma().dashboardWidget.findFirst({ where: { id: widgetId, dashboardId } });
  if (!widget) return null;
  const deleted = await getPrisma().dashboardWidget.delete({ where: { id: widgetId } });
  const remaining = await getPrisma().dashboardWidget.findMany({ where: { dashboardId }, orderBy: { order: "asc" } });
  await Promise.all(remaining.map((item, order) => getPrisma().dashboardWidget.update({ where: { id: item.id }, data: { order } })));
  await touchDashboard(dashboardId);
  return widgetFromDb(deleted);
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

export async function updateDashboardLayoutAsync(dashboardId: string, layouts: { widgetId: string; layout: WidgetConfig["layout"] }[]) {
  if (!shouldUsePersistentStore()) return updateDashboardLayout(dashboardId, layouts);

  const dashboard = await getDashboardAsync(dashboardId);
  if (!dashboard) return null;
  const layoutMap = new Map(layouts.map((item) => [item.widgetId, item.layout]));
  await Promise.all(dashboard.widgets.map((widget) => {
    const layout = layoutMap.get(widget.id);
    if (!layout) return Promise.resolve(widget);
    return getPrisma().dashboardWidget.update({
      where: { id: widget.id },
      data: { config: toPrismaJson({ ...widget.config, layout }) },
    });
  }));
  await touchDashboard(dashboard.id);
  const updated = await getDashboardAsync(dashboard.id);
  return updated?.widgets ?? null;
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

const dashboardInclude = {
  widgets: { orderBy: { order: "asc" } },
} as const;

function shouldUsePersistentStore() {
  return Boolean(process.env.DATABASE_URL);
}

function dashboardFromDb(dashboard: DbDashboard): DashboardItem {
  return {
    id: dashboard.id,
    name: dashboard.name,
    description: dashboard.description,
    projectId: dashboard.projectId,
    createdById: dashboard.createdById,
    isShared: dashboard.isShared,
    createdAt: toIsoString(dashboard.createdAt),
    updatedAt: toIsoString(dashboard.updatedAt),
    widgets: dashboard.widgets.map(widgetFromDb),
  };
}

function widgetFromDb(widget: DbDashboardWidget): DashboardWidgetItem {
  return {
    id: widget.id,
    dashboardId: widget.dashboardId,
    config: widgetConfigFromDb(widget.config, widget),
    order: widget.order,
    createdAt: toIsoString(widget.createdAt),
  };
}

function widgetConfigFromDb(config: unknown, widget: DbDashboardWidget): WidgetConfig {
  const raw = isPlainRecord(config) ? config : {};
  return {
    id: typeof raw.id === "string" ? raw.id : `${widget.id}-config`,
    type: normalizeWidgetType(raw.type),
    title: typeof raw.title === "string" ? raw.title : "未命名组件",
    dataSource: normalizeDataSource(raw.dataSource),
    style: normalizeWidgetStyle(raw.style),
    layout: normalizeWidgetLayout(raw.layout, widget.order),
    refreshInterval: typeof raw.refreshInterval === "number" ? raw.refreshInterval : 0,
  };
}

function normalizeWidgetType(value: unknown): WidgetType {
  const allowed: WidgetType[] = ["metric_card", "bar_chart", "line_chart", "pie_chart", "stacked_bar", "heatmap", "scatter", "table", "progress_bar", "funnel", "gauge", "timeline", "map", "text"];
  return allowed.includes(value as WidgetType) ? value as WidgetType : "table";
}

function normalizeDataSource(value: unknown): WidgetConfig["dataSource"] {
  const raw = isPlainRecord(value) ? value : {};
  const aggregation = isPlainRecord(raw.aggregation) && typeof raw.aggregation.field === "string" && isAggregationFn(raw.aggregation.fn)
    ? { field: raw.aggregation.field, fn: raw.aggregation.fn }
    : undefined;
  return {
    entityTypeId: typeof raw.entityTypeId === "string" ? raw.entityTypeId : "",
    filters: Array.isArray(raw.filters) ? raw.filters as DashboardFilter[] : undefined,
    groupBy: typeof raw.groupBy === "string" ? raw.groupBy : undefined,
    aggregation,
    sortBy: typeof raw.sortBy === "string" ? raw.sortBy : undefined,
    sortDir: raw.sortDir === "asc" ? "asc" : raw.sortDir === "desc" ? "desc" : undefined,
    limit: typeof raw.limit === "number" ? raw.limit : undefined,
  };
}

function normalizeWidgetStyle(value: unknown): WidgetConfig["style"] {
  const raw = isPlainRecord(value) ? value : {};
  return {
    colorScheme: typeof raw.colorScheme === "string" ? raw.colorScheme : "producer",
    showLegend: typeof raw.showLegend === "boolean" ? raw.showLegend : true,
    showLabels: typeof raw.showLabels === "boolean" ? raw.showLabels : true,
  };
}

function normalizeWidgetLayout(value: unknown, order: number): WidgetConfig["layout"] {
  const raw = isPlainRecord(value) ? value : {};
  return {
    x: typeof raw.x === "number" ? raw.x : (order % 2) * 6,
    y: typeof raw.y === "number" ? raw.y : Math.floor(order / 2) * 4,
    w: typeof raw.w === "number" ? raw.w : 6,
    h: typeof raw.h === "number" ? raw.h : 4,
  };
}

function isAggregationFn(value: unknown): value is NonNullable<WidgetConfig["dataSource"]["aggregation"]>["fn"] {
  return value === "count" || value === "sum" || value === "avg" || value === "min" || value === "max";
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function touchDashboard(dashboardId: string) {
  await getPrisma().dashboard.update({ where: { id: dashboardId }, data: { updatedAt: new Date() } });
}

function getState() {
  globalForDashboard.__productionTrackerDashboardState ??= createState();
  const state = globalForDashboard.__productionTrackerDashboardState;
  if (state.demoVersion !== demoDashboardVersion) upgradeDemoDashboard(state);
  return state;
}

function createState(): DashboardState {
  return { sequence: 200, demoVersion: demoDashboardVersion, dashboards: new Map([[demoDashboardId, createDemoDashboard()]]) };
}

function createDemoDashboard(): DashboardItem {
  const entities = listEntityTypes();
  const purchase = entities.find((entity) => entity.id === "retail-purchase-order") ?? entities[0];
  const inventory = entities.find((entity) => entity.id === "retail-inventory") ?? purchase;
  const now = "2026-06-18T00:00:00.000Z";
  return {
    id: demoDashboardId,
    name: "制片数据驾驶舱",
    description: "预算、供应商、库存和进度的通用可视化样板。",
    projectId: "demo-mkali-mission",
    createdById: "demo-admin",
    isShared: true,
    createdAt: now,
    updatedAt: now,
    widgets: [
      seedWidget("widget-spend", demoDashboardId, 0, "metric_card", "采购金额合计", purchase.id, { field: "total_amount", fn: "sum" }, undefined),
      seedWidget("widget-vendors", demoDashboardId, 1, "bar_chart", "供应商支出排行", purchase.id, { field: "total_amount", fn: "sum" }, "supplier"),
      seedWidget("widget-inventory", demoDashboardId, 2, "pie_chart", "库存分类金额", inventory.id, { field: "inventory_value", fn: "sum" }, "category"),
      seedWidget("widget-spend-trend", demoDashboardId, 3, "line_chart", "供应商金额曲线", purchase.id, { field: "total_amount", fn: "sum" }, "supplier"),
      seedWidget("widget-vendor-progress", demoDashboardId, 4, "progress_bar", "供应商预算进度", purchase.id, { field: "total_amount", fn: "sum" }, "supplier"),
      seedWidget("widget-inventory-funnel", demoDashboardId, 5, "funnel", "库存金额漏斗", inventory.id, { field: "inventory_value", fn: "sum" }, "category"),
      seedWidget("widget-spend-gauge", demoDashboardId, 6, "gauge", "最大供应商占比", purchase.id, { field: "total_amount", fn: "sum" }, "supplier"),
      seedWidget("widget-vendor-table", demoDashboardId, 7, "table", "供应商支出明细", purchase.id, { field: "total_amount", fn: "sum" }, "supplier"),
    ],
  };
}

function upgradeDemoDashboard(state: DashboardState) {
  const nextDemo = createDemoDashboard();
  const currentDemo = state.dashboards.get(demoDashboardId);
  if (!currentDemo) {
    state.dashboards.set(demoDashboardId, nextDemo);
  } else {
    const existingWidgetIds = new Set(currentDemo.widgets.map((widget) => widget.id));
    const missingWidgets = nextDemo.widgets.filter((widget) => !existingWidgetIds.has(widget.id));
    if (missingWidgets.length) {
      currentDemo.widgets.push(...missingWidgets.map((widget, index) => ({ ...widget, order: currentDemo.widgets.length + index })));
      currentDemo.updatedAt = nextDemo.updatedAt;
    }
  }
  state.demoVersion = demoDashboardVersion;
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
