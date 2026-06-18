import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

import { auth } from "@/auth";
import { resetAiRecognitionForTests } from "@/lib/ai-recognition";
import { resetCustomDataStoreForTests } from "@/lib/custom-data-store";
import { resetDashboardsForTests } from "@/lib/dashboard-builder";
import { resetScoringForTests } from "@/lib/scoring";

import { POST as recognizeDocument } from "./ai/recognize/route";
import { POST as readWidgetData } from "./dashboards/widget-data/route";
import { POST as previewImport } from "./entity-types/[id]/import/preview/route";
import { POST as createRecord } from "./entity-types/[id]/records/route";
import { POST as updateUserScore } from "./scores/users/[userId]/route";
import { POST as installTemplate } from "./templates/[templateId]/install/route";

const session = { user: { id: "demo-admin", name: "Admin User", role: "ADMIN" } };

describe("extension API routes", () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue(session as never);
    resetCustomDataStoreForTests();
    resetAiRecognitionForTests();
    resetDashboardsForTests();
    resetScoringForTests();
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
});
