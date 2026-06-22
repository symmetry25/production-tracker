import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ getPrisma: vi.fn() }));

import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

import { POST as createCalendarException } from "./calendar-exceptions/route";
import { POST as createProject } from "./projects/route";
import { POST as reassignTask } from "./tasks/[taskId]/reassign/route";
import { PATCH as updateTask } from "./tasks/[taskId]/route";
import { PATCH as updateVersionStatus } from "./versions/[versionId]/status/route";

const artistSession = { user: { id: "artist-1", role: "ARTIST" } };
const reviewerSession = { user: { id: "reviewer-1", role: "REVIEWER" } };
const producerSession = { user: { id: "producer-1", role: "PRODUCER", name: "Producer One", email: "producer@example.com" } };

describe("permission guarded routes", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(getPrisma).mockReset();
  });

  it("prevents artists from creating projects", async () => {
    vi.mocked(auth).mockResolvedValue(artistSession as never);

    const response = await createProject(
      new Request("http://app.test/api/projects", {
        method: "POST",
        body: JSON.stringify({
          name: "Artist Project",
          code: "ART",
          startDate: "2026-05-01",
          dueDate: "2026-06-01",
        }),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: "Only admins and producers can create projects." });
    expect(getPrisma).not.toHaveBeenCalled();
  });

  it("allows artists to update task progress fields", async () => {
    const update = vi.fn().mockResolvedValue({ id: "task-1", status: "IN_PROGRESS", timeLogged: 3 });
    vi.mocked(auth).mockResolvedValue(artistSession as never);
    vi.mocked(getPrisma).mockReturnValue({ task: { update } } as never);

    const response = await updateTask(
      new Request("http://app.test/api/tasks/task-1", {
        method: "PATCH",
        body: JSON.stringify({ status: "IN_PROGRESS", timeLogged: 3 }),
      }),
      { params: Promise.resolve({ taskId: "task-1" }) },
    );

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "task-1" },
        data: expect.objectContaining({ status: "IN_PROGRESS", timeLogged: 3 }),
      }),
    );
  });

  it("prevents artists from changing task budget fields", async () => {
    vi.mocked(auth).mockResolvedValue(artistSession as never);

    const response = await updateTask(
      new Request("http://app.test/api/tasks/task-1", {
        method: "PATCH",
        body: JSON.stringify({ estimatedCost: 24000 }),
      }),
      { params: Promise.resolve({ taskId: "task-1" }) },
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: "You can only update task status and logged time unless you are a producer or supervisor." });
    expect(getPrisma).not.toHaveBeenCalled();
  });

  it("prevents artists from approving review versions", async () => {
    vi.mocked(auth).mockResolvedValue(artistSession as never);

    const response = await updateVersionStatus(
      new Request("http://app.test/api/versions/version-1/status", {
        method: "PATCH",
        body: JSON.stringify({ status: "APPROVED" }),
      }),
      { params: Promise.resolve({ versionId: "version-1" }) },
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: "Only reviewers, supervisors, producers, and admins can update version status." });
  });

  it("prevents reviewers from changing schedule calendar exceptions", async () => {
    vi.mocked(auth).mockResolvedValue(reviewerSession as never);

    const response = await createCalendarException(
      new Request("http://app.test/api/calendar-exceptions", {
        method: "POST",
        body: JSON.stringify({
          date: "2026-06-01",
          type: "STUDIO_CLOSURE",
          hoursWorked: 0,
        }),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: "Only producers and supervisors can create calendar exceptions." });
    expect(getPrisma).not.toHaveBeenCalled();
  });

  it("reassigns a task in one transaction for producers", async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    const upsert = vi.fn().mockResolvedValue({
      id: "assignment-2",
      user: { name: "Artist Two", email: null, department: "DIT组" },
    });
    const findTask = vi.fn().mockResolvedValue({
      id: "task-1",
      name: "Backup cards",
      status: "IN_PROGRESS",
      startDate: new Date("2026-06-01"),
      dueDate: new Date("2026-06-05"),
      shot: { code: "RAID_0010", sequence: { code: "RAID" }, project: { id: "project-1", name: "Mkali", code: "MKALI" } },
      asset: null,
    });
    const findReviewer = vi.fn();
    const transaction = vi.fn(async (callback) =>
      callback({
        assignment: { deleteMany, upsert },
        task: { findUnique: findTask },
        user: { findUnique: findReviewer },
      }),
    );

    vi.mocked(auth).mockResolvedValue(producerSession as never);
    vi.mocked(getPrisma).mockReturnValue({ $transaction: transaction } as never);

    const response = await reassignTask(
      new Request("http://app.test/api/tasks/task-1/reassign", {
        method: "POST",
        body: JSON.stringify({ fromUserId: "artist-1", toUserId: "artist-2" }),
      }),
      { params: Promise.resolve({ taskId: "task-1" }) },
    );

    expect(response.status).toBe(200);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(deleteMany).toHaveBeenCalledWith({ where: { taskId: "task-1", userId: "artist-1" } });
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { taskId_userId: { taskId: "task-1", userId: "artist-2" } },
        create: expect.objectContaining({ taskId: "task-1", userId: "artist-2" }),
      }),
    );
  });
});
