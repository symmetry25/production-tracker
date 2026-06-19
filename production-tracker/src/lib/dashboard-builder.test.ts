import { describe, expect, it } from "vitest";

import { getDashboard, resetDashboardsForTests } from "@/lib/dashboard-builder";
import { chartTypes } from "@/components/dashboard-builder/widget-options";

describe("dashboard builder chart library", () => {
  it("exposes area and radar chart widgets in the demo dashboard and add-widget options", () => {
    resetDashboardsForTests();

    const dashboard = getDashboard("dashboard-producer-demo");

    expect(dashboard?.widgets.map((widget) => widget.config.type)).toEqual(expect.arrayContaining(["area_chart", "radar_chart"]));
    expect(chartTypes.map((chart) => chart.value)).toEqual(expect.arrayContaining(["area_chart", "radar_chart"]));
  });
});
