import { afterEach, describe, expect, it, vi } from "vitest";

import { sendTaskAssignmentNotification } from "@/lib/notifications";

const baseInput = {
  task: {
    id: "task-1",
    name: "Comp final polish",
    status: "IN_PROGRESS",
    startDate: "2026-05-01T00:00:00.000Z",
    dueDate: "2026-05-10T00:00:00.000Z",
    contextLabel: "SQ010 / SH010",
  },
  project: {
    id: "project-1",
    name: "Mkali Mission",
    code: "MKA",
  },
  assignee: {
    name: "Artist One",
    email: "artist@example.com",
    department: "Comp",
  },
  reviewer: {
    name: "Reviewer One",
    email: "reviewer@example.com",
  },
  assignedBy: {
    name: "Producer One",
    email: "producer@example.com",
  },
};

describe("assignment notifications", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("skips email delivery when Resend is not configured", async () => {
    process.env.RESEND_API_KEY = "";
    process.env.NOTIFICATION_FROM_EMAIL = "";

    const result = await sendTaskAssignmentNotification(baseInput);

    expect(result).toEqual({ status: "skipped", reason: "missing-config" });
  });

  it("skips email delivery when the assignee has no email", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.NOTIFICATION_FROM_EMAIL = "Production Tracker <notifications@example.com>";

    const result = await sendTaskAssignmentNotification({
      ...baseInput,
      assignee: { ...baseInput.assignee, email: null },
    });

    expect(result).toEqual({ status: "skipped", reason: "missing-recipient" });
  });

  it("sends assignment email through the Resend API", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.NOTIFICATION_FROM_EMAIL = "Production Tracker <notifications@example.com>";
    process.env.NEXT_PUBLIC_APP_URL = "https://tracker.example.com";
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "email-1" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendTaskAssignmentNotification(baseInput);

    expect(result).toEqual({ status: "sent", id: "email-1" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer re_test",
          "Content-Type": "application/json",
        }),
      }),
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      from: "Production Tracker <notifications@example.com>",
      to: ["artist@example.com"],
      subject: "New assignment: Comp final polish",
      text: expect.stringContaining("https://tracker.example.com/app/projects/project-1/tasks?task=task-1"),
    });
  });
});
