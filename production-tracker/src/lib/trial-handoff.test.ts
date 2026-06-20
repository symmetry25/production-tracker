import { describe, expect, it } from "vitest";

import { buildProductionReadinessReport } from "@/lib/production-readiness";
import { buildTrialHandoffPack } from "@/lib/trial-handoff";

describe("buildTrialHandoffPack", () => {
  it("keeps an external trial blocked when the environment still runs as local demo", () => {
    const readiness = buildProductionReadinessReport({
      env: {
        NODE_ENV: "development",
        AUTH_URL: "http://localhost:3100",
        NEXTAUTH_URL: "http://localhost:3100",
        USE_S3: "false",
      },
      generatedAt: new Date("2026-06-20T00:00:00.000Z"),
    });

    const pack = buildTrialHandoffPack({
      report: readiness,
      appUrl: "http://localhost:3100",
      generatedAt: new Date("2026-06-20T01:00:00.000Z"),
    });

    expect(pack.status).toBe("blocked");
    expect(pack.summary.canInviteExternalUsers).toBe(false);
    expect(pack.headline).toContain("阻断项");
    expect(pack.blockedItems.map((item) => item.id)).toEqual(expect.arrayContaining(["database", "auth-secret", "public-url"]));
    expect(pack.deploymentTracks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "data-foundation", status: "blocked" }),
        expect.objectContaining({ id: "access-security", status: "blocked" }),
      ]),
    );
  });

  it("creates a sendable trial brief when production essentials are ready", () => {
    const readiness = buildProductionReadinessReport({
      env: {
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://prod.example/db",
        AUTH_SECRET: "a-real-production-secret-with-enough-length",
        AUTH_URL: "https://tracker.example.com",
        NEXTAUTH_URL: "https://tracker.example.com",
        USE_S3: "true",
        AWS_REGION: "ap-southeast-1",
        S3_BUCKET_NAME: "production-tracker-media",
        AI_PROVIDER: "openai",
        OPENAI_API_KEY: "sk-test",
        GOOGLE_CLIENT_ID: "google-client",
        GOOGLE_CLIENT_SECRET: "google-secret",
        NOTIFICATIONS_ENABLED: "true",
        RESEND_API_KEY: "re_test",
        NOTIFICATION_FROM_EMAIL: "Production Tracker <notify@example.com>",
      },
      generatedAt: new Date("2026-06-20T00:00:00.000Z"),
    });

    const pack = buildTrialHandoffPack({
      report: readiness,
      appUrl: "https://tracker.example.com",
      generatedAt: new Date("2026-06-20T01:00:00.000Z"),
    });

    expect(pack.status).toBe("ready");
    expect(pack.summary.canInviteExternalUsers).toBe(true);
    expect(pack.blockedItems).toHaveLength(0);
    expect(pack.testerBrief.appUrl).toBe("https://tracker.example.com");
    expect(pack.testerBrief.demoAccounts).toContainEqual(
      expect.objectContaining({ email: "admin@studio.com", role: "制片/管理员" }),
    );
    expect(pack.trialChecklist.map((item) => item.route)).toEqual(
      expect.arrayContaining([
        "/app/projects",
        "/app/projects/demo-mkali-mission/overview",
        "/app/projects/demo-mkali-mission/resources",
        "/app/ai/recognize",
      ]),
    );
  });

  it("targets the current project in the trial checklist when a project id is provided", () => {
    const readiness = buildProductionReadinessReport({
      env: {
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://prod.example/db",
        AUTH_SECRET: "a-real-production-secret-with-enough-length",
        AUTH_URL: "https://tracker.example.com",
        NEXTAUTH_URL: "https://tracker.example.com",
        USE_S3: "true",
        AWS_REGION: "ap-southeast-1",
        S3_BUCKET_NAME: "production-tracker-media",
      },
      generatedAt: new Date("2026-06-20T00:00:00.000Z"),
    });

    const pack = buildTrialHandoffPack({
      report: readiness,
      appUrl: "https://tracker.example.com",
      projectId: "project with spaces",
      generatedAt: new Date("2026-06-20T01:00:00.000Z"),
    });

    expect(pack.trialChecklist.map((item) => item.route)).toEqual(
      expect.arrayContaining([
        "/app/projects/project%20with%20spaces/overview",
        "/app/projects/project%20with%20spaces/resources",
        "/app/projects/project%20with%20spaces/media",
      ]),
    );
  });
});
