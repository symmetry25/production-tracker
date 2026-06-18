import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ getPrisma: vi.fn() }));

import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { resetAiRecognitionForTests } from "@/lib/ai-recognition";
import { resetCustomDataStoreForTests } from "@/lib/custom-data-store";
import { resetDashboardsForTests } from "@/lib/dashboard-builder";
import { resetScoringForTests } from "@/lib/scoring";

import { POST as recognizeDocument } from "./ai/recognize/route";
import { GET as listRecognizedScans } from "./ai/scans/route";
import { DELETE as deleteWidget } from "./dashboards/[dashboardId]/widgets/[widgetId]/route";
import { POST as createWidget } from "./dashboards/[dashboardId]/widgets/route";
import { POST as readWidgetData } from "./dashboards/widget-data/route";
import { POST as createDashboard } from "./dashboards/route";
import { POST as addField } from "./entity-types/[id]/fields/route";
import { POST as previewImport } from "./entity-types/[id]/import/preview/route";
import { POST as createRecord } from "./entity-types/[id]/records/route";
import { POST as createEntityType } from "./entity-types/route";
import { DELETE as deleteRecord, PATCH as updateRecord } from "./records/[recordId]/route";
import { POST as updateUserScore } from "./scores/users/[userId]/route";
import { POST as installTemplate } from "./templates/[templateId]/install/route";
import { PATCH as updateUserSkills } from "./users/[userId]/skills/route";

const session = { user: { id: "demo-admin", name: "Admin User", role: "ADMIN" } };

describe("extension API routes", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue(session as never);
    vi.mocked(getPrisma).mockReset();
    process.env.DATABASE_URL = "";
    resetCustomDataStoreForTests();
    resetAiRecognitionForTests();
    resetDashboardsForTests();
    resetScoringForTests();
  });

  afterEach(() => {
    process.env.DATABASE_URL = originalDatabaseUrl;
  });

  it("installs an industry template as a project entity type", async () => {
    const response = await installTemplate(
      new Request("http://app.test/api/templates/retail-inventory/install", {
        method: "POST",
        body: JSON.stringify({ projectId: "demo-mkali-mission", customName: "剧组库存" }),
      }),
      { params: Promise.resolve({ templateId: "retail-inventory" }) },
    );

    await expect(response.json()).resolves.toMatchObject({
      data: {
        name: "剧组库存",
        projectId: "demo-mkali-mission",
        isTemplate: false,
      },
      error: null,
    });
  });

  it("persists new entity types through Prisma when a database is configured", async () => {
    process.env.DATABASE_URL = "postgresql://unit.test/db";
    vi.mocked(getPrisma).mockReturnValue({
      entityType: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({
          id: "entity-db-1",
          name: "数据库采购单",
          slug: "db-purchase-order",
          description: "数据库持久化测试",
          icon: "database",
          color: "#d8b46a",
          projectId: null,
          isTemplate: false,
          industry: "generic",
          createdBy: "demo-admin",
          createdAt: new Date("2026-06-18T00:00:00.000Z"),
          fields: [
            {
              id: "field-name",
              key: "name",
              name: "名称",
              type: "text",
              required: true,
              defaultValue: null,
              options: null,
              config: null,
              order: 0,
              width: 180,
              hidden: false,
              readOnly: false,
            },
          ],
          records: [],
        }),
      },
    } as never);

    const response = await createEntityType(
      new Request("http://app.test/api/entity-types", {
        method: "POST",
        body: JSON.stringify({ name: "数据库采购单", slug: "db-purchase-order", description: "数据库持久化测试" }),
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      data: {
        id: "entity-db-1",
        name: "数据库采购单",
        slug: "db-purchase-order",
        fields: [{ key: "name", name: "名称" }],
      },
      error: null,
    });
    expect(getPrisma).toHaveBeenCalled();
  });

  it("persists dashboards through Prisma when a database is configured", async () => {
    process.env.DATABASE_URL = "postgresql://unit.test/db";
    vi.mocked(getPrisma).mockReturnValue({
      dashboard: {
        create: vi.fn().mockResolvedValue({
          id: "dashboard-db-1",
          name: "数据库看板",
          description: "落库后的制片看板",
          projectId: "demo-mkali-mission",
          createdById: "demo-admin",
          isShared: true,
          createdAt: new Date("2026-06-18T00:00:00.000Z"),
          updatedAt: new Date("2026-06-18T00:00:00.000Z"),
          widgets: [],
        }),
      },
    } as never);

    const response = await createDashboard(
      new Request("http://app.test/api/dashboards", {
        method: "POST",
        body: JSON.stringify({ name: "数据库看板", description: "落库后的制片看板", projectId: "demo-mkali-mission", isShared: true }),
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      data: {
        id: "dashboard-db-1",
        name: "数据库看板",
        projectId: "demo-mkali-mission",
        isShared: true,
        widgets: [],
      },
      error: null,
    });
    expect(getPrisma).toHaveBeenCalled();
  });

  it("creates records and applies formula fields", async () => {
    const response = await createRecord(
      new Request("http://app.test/api/entity-types/retail-purchase-order/records", {
        method: "POST",
        body: JSON.stringify({ data: { po_number: "PO-2000", supplier: "测试器材", unit_cost: 1500, quantity: 3, status: "pending" } }),
      }),
      { params: Promise.resolve({ id: "retail-purchase-order" }) },
    );

    await expect(response.json()).resolves.toMatchObject({
      data: {
        data: {
          po_number: "PO-2000",
          total_amount: 4500,
        },
      },
      error: null,
    });
  });

  it("adds fields and exposes the new schema member", async () => {
    const response = await addField(
      new Request("http://app.test/api/entity-types/retail-purchase-order/fields", {
        method: "POST",
        body: JSON.stringify({ name: "审计备注", key: "audit_note", type: "text", required: false, width: 180 }),
      }),
      { params: Promise.resolve({ id: "retail-purchase-order" }) },
    );

    await expect(response.json()).resolves.toMatchObject({
      data: {
        name: "审计备注",
        key: "audit_note",
        type: "text",
      },
      error: null,
    });
  });

  it("updates and deletes dynamic records through the record endpoint", async () => {
    const createResponse = await createRecord(
      new Request("http://app.test/api/entity-types/retail-purchase-order/records", {
        method: "POST",
        body: JSON.stringify({ data: { po_number: "PO-2002", supplier: "更新供应商", unit_cost: 200, quantity: 2, status: "pending" } }),
      }),
      { params: Promise.resolve({ id: "retail-purchase-order" }) },
    );
    const created = await createResponse.json();
    const recordId = created.data.id;

    const updateResponse = await updateRecord(
      new Request(`http://app.test/api/records/${recordId}`, {
        method: "PATCH",
        body: JSON.stringify({ data: { status: "approved" } }),
      }),
      { params: Promise.resolve({ recordId }) },
    );

    await expect(updateResponse.json()).resolves.toMatchObject({
      data: {
        id: recordId,
        data: {
          status: "approved",
        },
      },
      error: null,
    });

    const deleteResponse = await deleteRecord(new Request(`http://app.test/api/records/${recordId}`, { method: "DELETE" }), { params: Promise.resolve({ recordId }) });

    await expect(deleteResponse.json()).resolves.toMatchObject({
      data: {
        id: recordId,
      },
      error: null,
    });
  });

  it("previews import mappings and reports invalid numeric rows", async () => {
    const response = await previewImport(
      new Request("http://app.test/api/entity-types/retail-purchase-order/import/preview", {
        method: "POST",
        body: JSON.stringify({ sourceText: "采购单号,供应商,单价,数量\nPO-1,好供应商,100,2\nPO-2,坏供应商,N/A,1" }),
      }),
      { params: Promise.resolve({ id: "retail-purchase-order" }) },
    );

    await expect(response.json()).resolves.toMatchObject({
      data: {
        validation: {
          totalRows: 2,
          validRows: 1,
          errorRows: 1,
          errors: [{ row: 3, field: "unit_cost", message: "非数字值" }],
        },
      },
      error: null,
    });
  });

  it("returns mock AI recognition result when provider keys are not configured", async () => {
    const response = await recognizeDocument(
      new Request("http://app.test/api/ai/recognize", {
        method: "POST",
        body: JSON.stringify({ mode: "invoice", entityTypeId: "retail-purchase-order" }),
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      data: {
        provider: "mock",
        result: {
          invoice_number: "INV-2026-0618",
        },
      },
      error: null,
    });
  });

  it("persists and lists AI scan history through Prisma when a database is configured", async () => {
    process.env.DATABASE_URL = "postgresql://unit.test/db";
    vi.mocked(getPrisma).mockReturnValue({
      aiScan: {
        create: vi.fn().mockResolvedValue({
          id: "scan-db-1",
          recordId: null,
          entityTypeId: "retail-purchase-order",
          mode: "invoice",
          imageUrl: "mock://sample-document",
          rawResult: { invoice_number: "INV-2026-0618", confidence: 0.91, __provider: "mock" },
          appliedData: null,
          confidence: 0.91,
          createdAt: new Date("2026-06-18T00:00:00.000Z"),
        }),
        findMany: vi.fn().mockResolvedValue([
          {
            id: "scan-db-1",
            recordId: null,
            entityTypeId: "retail-purchase-order",
            mode: "invoice",
            imageUrl: "mock://sample-document",
            rawResult: { invoice_number: "INV-2026-0618", confidence: 0.91, __provider: "mock" },
            appliedData: null,
            confidence: 0.91,
            createdAt: new Date("2026-06-18T00:00:00.000Z"),
          },
        ]),
      },
      entityType: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    } as never);

    const recognizeResponse = await recognizeDocument(
      new Request("http://app.test/api/ai/recognize", {
        method: "POST",
        body: JSON.stringify({ mode: "invoice", entityTypeId: "retail-purchase-order" }),
      }),
    );

    await expect(recognizeResponse.json()).resolves.toMatchObject({
      data: {
        scan: {
          id: "scan-db-1",
          entityTypeId: "retail-purchase-order",
          provider: "mock",
          rawResult: { invoice_number: "INV-2026-0618" },
        },
      },
      error: null,
    });

    const scansResponse = await listRecognizedScans(new Request("http://app.test/api/ai/scans?entityTypeId=retail-purchase-order"));

    await expect(scansResponse.json()).resolves.toMatchObject({
      data: [
        {
          id: "scan-db-1",
          entityTypeId: "retail-purchase-order",
          provider: "mock",
          rawResult: { invoice_number: "INV-2026-0618" },
        },
      ],
      error: null,
    });
    expect(getPrisma).toHaveBeenCalled();
  });

  it("aggregates widget data from dynamic entity records", async () => {
    await createRecord(
      new Request("http://app.test/api/entity-types/retail-purchase-order/records", {
        method: "POST",
        body: JSON.stringify({ data: { po_number: "PO-2001", supplier: "测试器材", unit_cost: 100, quantity: 5 } }),
      }),
      { params: Promise.resolve({ id: "retail-purchase-order" }) },
    );

    const response = await readWidgetData(
      new Request("http://app.test/api/dashboards/widget-data", {
        method: "POST",
        body: JSON.stringify({
          entityTypeId: "retail-purchase-order",
          groupBy: "supplier",
          aggregation: { field: "total_amount", fn: "sum" },
          sortDir: "desc",
        }),
      }),
    );

    const body = await response.json();
    expect(body.error).toBeNull();
    expect(body.data.rows).toEqual(expect.arrayContaining([expect.objectContaining({ name: "测试器材", value: 500 })]));
  });

  it("creates and deletes dashboard widgets", async () => {
    const createResponse = await createWidget(
      new Request("http://app.test/api/dashboards/dashboard-producer-demo/widgets", {
        method: "POST",
        body: JSON.stringify({
          type: "bar_chart",
          title: "供应商审计图",
          dataSource: {
            entityTypeId: "retail-purchase-order",
            groupBy: "supplier",
            aggregation: { field: "total_amount", fn: "sum" },
            sortDir: "desc",
          },
        }),
      }),
      { params: Promise.resolve({ dashboardId: "dashboard-producer-demo" }) },
    );
    const created = await createResponse.json();
    expect(created.error).toBeNull();
    expect(created.data.config.title).toBe("供应商审计图");

    const deleteResponse = await deleteWidget(new Request(`http://app.test/api/dashboards/dashboard-producer-demo/widgets/${created.data.id}`, { method: "DELETE" }), {
      params: Promise.resolve({ dashboardId: "dashboard-producer-demo", widgetId: created.data.id }),
    });

    await expect(deleteResponse.json()).resolves.toMatchObject({
      data: {
        id: created.data.id,
      },
      error: null,
    });
  });

  it("updates a user score and returns the new scorecard", async () => {
    const response = await updateUserScore(
      new Request("http://app.test/api/scores/users/demo-user-vfx", {
        method: "POST",
        body: JSON.stringify({ dimensionId: "dim-tech", score: 96, period: "2026-Q2", comment: "关键镜头救火表现稳定" }),
      }),
      { params: Promise.resolve({ userId: "demo-user-vfx" }) },
    );

    await expect(response.json()).resolves.toMatchObject({
      data: {
        userId: "demo-user-vfx",
        dimensionId: "dim-tech",
        score: 96,
      },
      error: null,
    });
  });

  it("updates a user's skill level", async () => {
    const response = await updateUserSkills(
      new Request("http://app.test/api/users/demo-user-vfx/skills", {
        method: "PATCH",
        body: JSON.stringify({ skills: [{ skillId: "skill-nuke", level: 5, verifiedBy: "demo-user-producer" }] }),
      }),
      { params: Promise.resolve({ userId: "demo-user-vfx" }) },
    );

    await expect(response.json()).resolves.toMatchObject({
      data: [
        {
          userId: "demo-user-vfx",
          skillId: "skill-nuke",
          level: 5,
          verifiedBy: "demo-user-producer",
        },
      ],
      error: null,
    });
  });
});
