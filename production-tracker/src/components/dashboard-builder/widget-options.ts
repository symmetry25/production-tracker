import type { WidgetConfig, WidgetType } from "@/lib/dashboard-builder";
import type { FieldDefinition } from "@/lib/field-types";

export type AggregationFn = NonNullable<WidgetConfig["dataSource"]["aggregation"]>["fn"];

export const chartTypes: { value: WidgetType; label: string; needsGroupBy: boolean }[] = [
  { value: "bar_chart", label: "柱状图", needsGroupBy: true },
  { value: "area_chart", label: "面积图", needsGroupBy: true },
  { value: "line_chart", label: "折线图", needsGroupBy: true },
  { value: "pie_chart", label: "环形图", needsGroupBy: true },
  { value: "radar_chart", label: "雷达图", needsGroupBy: true },
  { value: "progress_bar", label: "进度条", needsGroupBy: true },
  { value: "funnel", label: "漏斗图", needsGroupBy: true },
  { value: "table", label: "数据表", needsGroupBy: true },
  { value: "metric_card", label: "指标卡", needsGroupBy: false },
  { value: "gauge", label: "仪表盘", needsGroupBy: false },
];

export const aggregationOptions: { value: AggregationFn; label: string }[] = [
  { value: "sum", label: "合计" },
  { value: "avg", label: "平均" },
  { value: "count", label: "计数" },
  { value: "max", label: "最大" },
  { value: "min", label: "最小" },
];

export function getNumericFields(fields: FieldDefinition[]) {
  return fields.filter((field) => ["number", "currency", "percentage", "score", "rating", "formula"].includes(field.type));
}

export function getGroupFields(fields: FieldDefinition[]) {
  return fields.filter((field) => ["text", "select", "status", "user"].includes(field.type));
}

export function chartNeedsGroupBy(type: WidgetType) {
  return chartTypes.find((chartType) => chartType.value === type)?.needsGroupBy ?? true;
}
