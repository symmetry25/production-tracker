import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ getPrisma: vi.fn() }));

import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

import { POST as createCalendarException } from "./calendar-exceptions/route";
import { POST as createProject } from "./projects/route";
import { PATCH as updateTask } from "./tasks/[taskId]/route";
import { PATCH as updateVersionStatus } from "./versions/[versionId]/status/route";

const artistSession = { user: { id: "artist-1", role: "ARTIST" } };
const reviewerSession = { user: { id: "reviewer-1", role: "REVIEWER" } };

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
});
