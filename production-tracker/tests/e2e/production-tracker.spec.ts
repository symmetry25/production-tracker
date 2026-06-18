import { expect, test } from "@playwright/test";

test.describe("production tracker smoke flow", () => {
  test("login, inspect core pages, and read reporting APIs", async ({ page }) => {
    test.setTimeout(60_000);

    await page.goto("/login");
    await page.locator("#email").fill("admin@studio.com");
    await page.locator("#password").fill("admin123");
    await page.getByRole("button", { name: "进入生产后台" }).click();
    await expect(page).toHaveURL(/\/app(?:$|\?)/);
    await expect(page.getByRole("heading", { name: /Mkali's Mission 控制台/ })).toBeVisible();

    await page.goto("/app/projects");
    await expect(page.getByRole("link", { name: /Mkali's Mission/ })).toBeVisible();

    await page.goto("/app/custom-data");
    await expect(page.getByRole("heading", { name: "通用录入与行业模板" })).toBeVisible();
    await expect(page.getByText("Industry Templates")).toBeVisible();
    await expect(page.getByRole("button", { name: /采购单/ })).toBeVisible();
    await expect(page.getByText("合计金额")).toBeVisible();
    await page.getByRole("button", { name: "打开导入向导" }).click();
    await page.getByRole("button", { name: "解析并自动映射" }).click();
    await expect(page.getByText("字段映射", { exact: true })).toBeVisible();
    await expect(page.getByText(/行 3: unit_cost - 非数字值/)).toBeVisible();
    await page.getByRole("button", { name: "仅导入有效行 (1)" }).click();
    await expect(page.getByText("已导入 1 条有效记录")).toBeVisible();

    await page.goto("/app/entity-types");
    await expect(page.getByRole("heading", { name: "实体类型与通用数据表" })).toBeVisible();
    await expect(page.getByRole("link", { name: /采购单/ })).toBeVisible();

    await page.goto("/app/entity-types/new");
    await page.getByRole("button", { name: "安装模板" }).first().click();
    await expect(page.getByText("已安装")).toBeVisible();

    await page.goto("/app/entity-types/retail-purchase-order");
    await expect(page.getByText("快速新增记录")).toBeVisible();
    await page.getByRole("button", { name: "保存记录" }).click();
    await expect(page.getByText("记录已保存，页面数据已刷新。")).toBeVisible();
    await page.getByRole("button", { name: "标记状态" }).first().click();
    await expect(page.getByText("记录已更新")).toBeVisible();
    await page.getByRole("button", { name: "删除记录" }).first().click();
    await expect(page.getByText("已删除")).toBeVisible();

    await page.goto("/app/entity-types/retail-purchase-order/settings");
    await expect(page.getByRole("heading", { name: "采购单 字段管理" })).toBeVisible();
    await page.getByLabel("字段名").fill("审计备注");
    await page.getByLabel("字段 Key").fill(`audit_note_${Date.now().toString().slice(-5)}`);
    await page.getByRole("button", { name: "添加字段" }).click();
    await expect(page.getByText("字段已添加")).toBeVisible();
    await expect(page.getByText("审计备注").first()).toBeVisible();

    await page.goto("/app/entity-types/retail-purchase-order/import");
    await expect(page.getByRole("heading", { name: "采购单 导入向导" })).toBeVisible();
    await expect(page.getByText(/行 3: unit_cost - 非数字值/)).toBeVisible();
    await page.getByRole("button", { name: "仅导入有效行" }).click();
    await expect(page.getByText(/已导入 1 条，跳过 1 条/)).toBeVisible();

    await page.goto("/app/dashboards/dashboard-producer-demo");
    await expect(page.getByRole("heading", { name: "制片数据驾驶舱" })).toBeVisible();
    await expect(page.getByText("供应商支出排行")).toBeVisible();

    await page.goto("/app/dashboards/dashboard-producer-demo/edit");
    await expect(page.getByText("添加 Widget")).toBeVisible();
    await page.getByRole("button", { name: "添加" }).click();
    await expect(page.getByText("Widget 已添加。")).toBeVisible();
    await page.getByRole("button", { name: "删除 Widget" }).first().click();
    await expect(page.getByText("Widget 已删除")).toBeVisible();

    await page.goto("/app/ai/recognize");
    await expect(page.getByRole("heading", { name: "AI 单据识别工作台" })).toBeVisible();
    await expect(page.getByText("INV-2026-0618")).toBeVisible();
    await page.getByRole("button", { name: "开始识别" }).click();
    await expect(page.getByText("invoice_number")).toBeVisible();
    await page.getByRole("button", { name: "应用为记录" }).click();
    await expect(page.getByText("识别结果已写入采购单记录。")).toBeVisible();

    await page.goto("/app/users/demo-user-vfx/scorecard");
    await expect(page.getByRole("heading", { name: "Nora Li 评分卡" })).toBeVisible();
    await expect(page.getByText("团队排行榜")).toBeVisible();
    await page.getByRole("button", { name: "更新评分" }).click();
    await expect(page.getByText("已更新")).toBeVisible();

    await page.goto("/app/users/demo-user-vfx/skills");
    await expect(page.getByRole("heading", { name: "Nora Li 技能矩阵" })).toBeVisible();
    await page.getByRole("button", { name: "更新技能" }).click();
    await expect(page.getByText("技能已更新")).toBeVisible();

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
    await expect(page.getByText("Screening Queue")).toBeVisible();
    await expect(page.getByRole("button", { name: "Next cut" })).toBeVisible();
    await expect(page.getByText("2 cuts ready")).toBeVisible();
    await expect(page.getByText("Review Player")).toBeVisible();
    await page.getByRole("button", { name: "Compare" }).click();
    await expect(page.getByText("Screening Room Compare")).toBeVisible();
    await expect(page.getByText("Version A")).toBeVisible();
    await expect(page.getByText("Version B")).toBeVisible();

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
