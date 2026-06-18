import { afterEach, describe, expect, it, vi } from "vitest";

import type { TaskTableItem } from "@/lib/task-data";
import { buildScheduleSuggestions, buildScheduleSuggestionsWithAi } from "@/lib/schedule-suggestions";

const baseTask: TaskTableItem = {
  id: "task-base",
  name: "Base task",
  status: "WAITING_TO_START",
  priority: 1,
  startDate: "2026-06-01T00:00:00.000Z",
  dueDate: "2026-06-20T00:00:00.000Z",
  duration: 2,
  timeLogged: 0,
  estimatedCost: 500,
  calculatedCost: 0,
  overBudget: false,
  context: { kind: "shot", id: "shot-1", label: "SH010", secondary: "SEQ" },
  assignees: [{ id: "u1", name: "Artist", department: "Comp", role: "ARTIST" }],
  reviewerIds: [],
  predecessors: [],
  successors: [],
  versionCount: 0,
  noteCount: 0,
};

describe("schedule suggestions", () => {
  const originalOpenAiKey = process.env.OPENAI_API_KEY;
  const originalAiProvider = process.env.AI_PROVIDER;
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalOpenAiKey;
    process.env.AI_PROVIDER = originalAiProvider;
    globalThis.fetch = originalFetch;
  });

  it("prioritizes overdue and over-budget schedule risks", () => {
    const summary = buildScheduleSuggestions({
      projectId: "demo",
      now: new Date("2026-06-18T00:00:00.000Z"),
      tasks: [
        {
          ...baseTask,
          id: "late",
          name: "Late comp",
          status: "IN_PROGRESS",
          dueDate: "2026-06-14T00:00:00.000Z",
          timeLogged: 18,
          calculatedCost: 1800,
          estimatedCost: 500,
          overBudget: true,
        },
        {
          ...baseTask,
          id: "no-owner",
          name: "No owner",
          priority: 2,
          assignees: [],
        },
      ],
    });

    expect(summary.healthScore).toBeLessThan(80);
    expect(summary.criticalCount).toBeGreaterThanOrEqual(2);
    expect(summary.totalBudgetRisk).toBe(1300);
    expect(summary.suggestions.map((item) => item.kind)).toEqual(expect.arrayContaining(["overdue", "over_budget", "missing_owner"]));
    expect(summary.suggestions[0]?.severity).toBe("critical");
  });

  it("does not flag dependency gaps when predecessors are complete", () => {
    const summary = buildScheduleSuggestions({
      projectId: "demo",
      now: new Date("2026-06-18T00:00:00.000Z"),
      tasks: [
        {
          ...baseTask,
          id: "predecessor",
          name: "Approved predecessor",
          status: "APPROVED",
        },
        {
          ...baseTask,
          id: "ready",
          name: "Ready shot",
          status: "READY_TO_START",
          predecessors: [{ id: "dep-1", type: "FS", lagDays: 0, taskId: "predecessor", taskName: "Approved predecessor", contextLabel: "SH010" }],
        },
      ],
    });

    expect(summary.suggestions.map((item) => item.kind)).not.toContain("dependency_gap");
  });

  it("uses AI only to enhance the scheduling narrative", async () => {
    process.env.OPENAI_API_KEY = "test-openai-key";
    process.env.AI_PROVIDER = "openai";
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ output_text: "今天先处理逾期任务，冻结超预算工时，并把无人负责的高优先级任务补 owner。" }), { status: 200 }));

    const summary = await buildScheduleSuggestionsWithAi({
      projectId: "demo",
      now: new Date("2026-06-18T00:00:00.000Z"),
      tasks: [
        {
          ...baseTask,
          id: "late",
          name: "Late comp",
          status: "IN_PROGRESS",
          dueDate: "2026-06-14T00:00:00.000Z",
        },
      ],
    });

    expect(summary.provider).toBe("openai");
    expect(summary.suggestions[0]?.kind).toBe("overdue");
    expect(summary.narrative).toContain("今天先处理逾期任务");
    expect(globalThis.fetch).toHaveBeenCalledWith("https://api.openai.com/v1/responses", expect.objectContaining({ method: "POST" }));
  });
});
