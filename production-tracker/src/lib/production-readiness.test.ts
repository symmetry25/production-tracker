import { describe, expect, it } from "vitest";

import { buildProductionReadinessReport } from "@/lib/production-readiness";

describe("buildProductionReadinessReport", () => {
  it("marks a local demo environment as blocked for real external trials", () => {
    const report = buildProductionReadinessReport({
      env: {
        NODE_ENV: "development",
        AUTH_URL: "http://localhost:3100",
        NEXTAUTH_URL: "http://localhost:3100",
        USE_S3: "false",
      },
      generatedAt: new Date("2026-06-20T00:00:00.000Z"),
    });

    expect(report.mode).toBe("demo");
    expect(report.status).toBe("blocked");
    expect(report.blockedCount).toBeGreaterThanOrEqual(3);
    expect(report.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "database", status: "blocked" }),
        expect.objectContaining({ id: "auth-secret", status: "blocked" }),
        expect.objectContaining({ id: "public-url", status: "blocked" }),
        expect.objectContaining({ id: "storage", status: "warning" }),
      ]),
    );
  });

  it("marks a configured production environment as ready with optional warnings", () => {
    const report = buildProductionReadinessReport({
      env: {
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://prod.example/db",
        AUTH_SECRET: "a-real-production-secret-with-enough-length",
        AUTH_URL: "https://tracker.example.com",
        NEXTAUTH_URL: "https://tracker.example.com",
        USE_S3: "true",
        AWS_REGION: "ap-southeast-1",
        S3_BUCKET_NAME: "production-tracker-media",
        S3_PUBLIC_URL: "https://cdn.example.com",
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

    expect(report.mode).toBe("production");
    expect(report.status).toBe("ready");
    expect(report.blockedCount).toBe(0);
    expect(report.readyCount).toBeGreaterThan(report.warningCount);
    expect(report.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "database", status: "ready" }),
        expect.objectContaining({ id: "storage", status: "ready" }),
        expect.objectContaining({ id: "ai-provider", status: "ready" }),
        expect.objectContaining({ id: "notifications", status: "ready" }),
      ]),
    );
  });
});
