export type TaskAssignmentNotificationInput = {
  task: {
    id: string;
    name: string;
    status: string;
    startDate: Date | string | null;
    dueDate: Date | string | null;
    contextLabel: string;
  };
  project: {
    id: string;
    name: string;
    code: string;
  } | null;
  assignee: {
    name: string;
    email: string | null;
    department: string | null;
  };
  reviewer?: {
    name: string;
    email: string | null;
  } | null;
  assignedBy?: {
    name?: string | null;
    email?: string | null;
  } | null;
};

export type NotificationResult =
  | { status: "sent"; id: string | null }
  | { status: "skipped"; reason: "disabled" | "missing-config" | "missing-recipient" }
  | { status: "failed"; error: string };

export async function sendTaskAssignmentNotification(input: TaskAssignmentNotificationInput): Promise<NotificationResult> {
  if (process.env.NOTIFICATIONS_ENABLED === "false") {
    return { status: "skipped", reason: "disabled" };
  }

  if (!input.assignee.email) {
    return { status: "skipped", reason: "missing-recipient" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFICATION_FROM_EMAIL;

  if (!apiKey || !from) {
    return { status: "skipped", reason: "missing-config" };
  }

  const appUrl = getAppUrl();
  const taskUrl = input.project
    ? `${appUrl}/app/projects/${encodeURIComponent(input.project.id)}/tasks?task=${encodeURIComponent(input.task.id)}`
    : `${appUrl}/app/my-tasks`;
  const projectLabel = input.project ? `${input.project.name} (${input.project.code})` : "Production Tracker";
  const dateLabel = formatDateRange(input.task.startDate, input.task.dueDate);
  const reviewerLine = input.reviewer ? `<p><strong>Reviewer</strong>: ${escapeHtml(input.reviewer.name)}</p>` : "";
  const assignedByLine = input.assignedBy?.name || input.assignedBy?.email
    ? `<p><strong>Assigned by</strong>: ${escapeHtml(input.assignedBy.name ?? input.assignedBy.email ?? "")}</p>`
    : "";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "production-tracker/0.1",
    },
    body: JSON.stringify({
      from,
      to: [input.assignee.email],
      subject: `New assignment: ${input.task.name}`,
      text: [
        `New assignment: ${input.task.name}`,
        `Project: ${projectLabel}`,
        `Context: ${input.task.contextLabel}`,
        `Status: ${input.task.status}`,
        `Schedule: ${dateLabel}`,
        input.reviewer ? `Reviewer: ${input.reviewer.name}` : null,
        input.assignedBy?.name || input.assignedBy?.email ? `Assigned by: ${input.assignedBy.name ?? input.assignedBy.email}` : null,
        `Open task: ${taskUrl}`,
      ].filter(Boolean).join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#171713">
          <p style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#8a6d2f">Production Tracker</p>
          <h1 style="font-size:22px;margin:0 0 16px">New assignment: ${escapeHtml(input.task.name)}</h1>
          <p><strong>Project</strong>: ${escapeHtml(projectLabel)}</p>
          <p><strong>Context</strong>: ${escapeHtml(input.task.contextLabel)}</p>
          <p><strong>Status</strong>: ${escapeHtml(input.task.status)}</p>
          <p><strong>Schedule</strong>: ${escapeHtml(dateLabel)}</p>
          ${reviewerLine}
          ${assignedByLine}
          <p style="margin-top:20px"><a href="${escapeAttribute(taskUrl)}" style="color:#185fa5">Open task</a></p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    return { status: "failed", error: errorText || `Resend returned ${response.status}` };
  }

  const payload = await response.json().catch(() => null);
  return { status: "sent", id: readEmailId(payload) };
}

function getAppUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3100";
  return raw.replace(/\/+$/, "");
}

function formatDateRange(startDate: Date | string | null, dueDate: Date | string | null) {
  const start = formatDate(startDate);
  const due = formatDate(dueDate);

  if (start && due) return `${start} - ${due}`;
  if (start) return `From ${start}`;
  if (due) return `Due ${due}`;
  return "Not scheduled";
}

function formatDate(value: Date | string | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function readEmailId(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const candidate = "id" in payload ? payload.id : "data" in payload && payload.data && typeof payload.data === "object" && "id" in payload.data ? payload.data.id : null;
  return typeof candidate === "string" ? candidate : null;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => htmlEntities[char] ?? char);
}

function escapeAttribute(value: string) {
  return escapeHtml(value);
}

const htmlEntities: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;",
};
