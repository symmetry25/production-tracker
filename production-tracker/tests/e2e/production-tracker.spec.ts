import { expect, test } from "@playwright/test";

test.describe("production tracker smoke flow", () => {
  test("login, inspect core pages, and read reporting APIs", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill("admin@studio.com");
    await page.locator("#password").fill("admin123");
    await page.getByRole("button", { name: "进入生产后台" }).click();
    await expect(page).toHaveURL(/\/app(?:$|\?)/);
    await expect(page.getByRole("heading", { name: /Mkali's Mission 控制台/ })).toBeVisible();

    await page.goto("/app/projects");
    await expect(page.getByRole("link", { name: /Mkali's Mission/ })).toBeVisible();

    await page.goto("/app/projects/demo-mkali-mission/overview");
    await expect(page.getByRole("heading", { name: /Mkali's Mission · MKALI/ })).toBeVisible();
    await expect(page.getByText("Shot Status")).toBeVisible();
    await expect(page.getByText("Version Review Status")).toBeVisible();
    await expect(page.getByRole("button", { name: "下载报告" })).toBeVisible();

    await page.goto("/app/projects/demo-mkali-mission/shots");
    await expect(page.getByRole("heading", { name: "镜头流水线" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Export CSV" })).toBeVisible();

    await page.goto("/app/projects/demo-mkali-mission/tasks");
    await expect(page.getByRole("heading", { name: "任务表与甘特图" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Gantt" })).toBeVisible();
    await expect(page.getByText("8 tasks")).toBeVisible();
    await expect(page.getByText("Task Budget")).toBeVisible();

    await page.goto("/app/projects/demo-mkali-mission/other");
    await expect(page.getByRole("heading", { name: "项目工具与扩展" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Audit Readiness/ })).toBeVisible();

    await page.goto("/app/review/demo-version-rain-v003");
    await expect(page.locator("h1", { hasText: "VFX_0300_RainComp_v003" })).toBeVisible();
    await expect(page.getByText("Review Player")).toBeVisible();

    await page.goto("/app/resource-planning/DIT%E7%BB%84?start=2026-05-01&end=2026-06-30");
    await expect(page.getByRole("heading", { name: /DIT组 资源下钻/ })).toBeVisible();
    await expect(page.getByText("Studio 容量与工作量")).toBeVisible();
    await expect(page.getByText("Unassigned Workload")).toBeVisible();
    await expect(page.getByText(/部门容量明细|人员容量明细/)).toBeVisible();

    const report = await page.request.get("/api/reports/overview?projectId=demo-mkali-mission");
    expect(report.ok()).toBeTruthy();
    const reportBody = await report.json();
    expect(reportBody.data.counts.tasks).toBeGreaterThan(0);
  });
});
