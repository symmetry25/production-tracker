import { describe, expect, it, vi } from "vitest";

import { bootstrapProjectWorkspace } from "@/lib/project-bootstrap";

describe("project bootstrap", () => {
  it("creates a usable starter production workspace", async () => {
    const prisma = {
      user: {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ id: "reviewer-1" })
          .mockResolvedValueOnce({ id: "artist-1" }),
      },
      phase: { create: vi.fn().mockResolvedValue({}) },
      sequence: { create: vi.fn().mockResolvedValue({ id: "sequence-main" }) },
      shot: {
        create: vi
          .fn()
          .mockResolvedValueOnce({ id: "shot-1" })
          .mockResolvedValueOnce({ id: "shot-2" })
          .mockResolvedValueOnce({ id: "shot-3" }),
      },
      asset: {
        create: vi
          .fn()
          .mockResolvedValueOnce({ id: "asset-1" })
          .mockResolvedValueOnce({ id: "asset-2" })
          .mockResolvedValueOnce({ id: "asset-3" }),
      },
      task: { create: vi.fn().mockResolvedValue({}) },
      workOrder: { create: vi.fn().mockResolvedValue({}) },
    };

    await bootstrapProjectWorkspace(prisma as never, {
      id: "project-1",
      startDate: new Date("2026-05-01T00:00:00.000Z"),
      dueDate: new Date("2026-06-30T00:00:00.000Z"),
    });

    expect(prisma.phase.create).toHaveBeenCalledTimes(3);
    expect(prisma.sequence.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ projectId: "project-1", code: "MAIN" }),
      }),
    );
    expect(prisma.shot.create).toHaveBeenCalledTimes(3);
    expect(prisma.asset.create).toHaveBeenCalledTimes(3);
    expect(prisma.task.create).toHaveBeenCalledTimes(24);
    expect(prisma.task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "LAY",
          assignments: { create: { userId: "artist-1", reviewerId: "reviewer-1" } },
        }),
      }),
    );
    expect(prisma.workOrder.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ projectId: "project-1", title: "Kickoff package / 项目启动包" }),
      }),
    );
  });
});
