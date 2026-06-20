export type ReadinessStatus = "ready" | "warning" | "blocked";
export type ReadinessMode = "demo" | "trial" | "production";
export type ReadinessCategory = "data" | "security" | "files" | "ai" | "integrations" | "operations";

export type ProductionReadinessCheck = {
  id: string;
  category: ReadinessCategory;
  title: string;
  status: ReadinessStatus;
  detail: string;
  action: string;
};

export type ProductionReadinessReport = {
  generatedAt: string;
  mode: ReadinessMode;
  status: ReadinessStatus;
  readyCount: number;
  warningCount: number;
  blockedCount: number;
  score: number;
  checks: ProductionReadinessCheck[];
};

type BuildProductionReadinessInput = {
  env?: Record<string, string | undefined>;
  generatedAt?: Date;
};

export function buildProductionReadinessReport(input: BuildProductionReadinessInput = {}): ProductionReadinessReport {
  const env = input.env ?? process.env;
  const generatedAt = input.generatedAt ?? new Date();
  const checks = [
    databaseCheck(env),
    authSecretCheck(env),
    publicUrlCheck(env),
    storageCheck(env),
    aiProviderCheck(env),
    oauthCheck(env),
    notificationsCheck(env),
    environmentModeCheck(env),
  ];
  const readyCount = checks.filter((check) => check.status === "ready").length;
  const warningCount = checks.filter((check) => check.status === "warning").length;
  const blockedCount = checks.filter((check) => check.status === "blocked").length;

  return {
    generatedAt: generatedAt.toISOString(),
    mode: resolveMode(env),
    status: blockedCount > 0 ? "blocked" : warningCount > 0 ? "warning" : "ready",
    readyCount,
    warningCount,
    blockedCount,
    score: Math.round((readyCount / checks.length) * 100),
    checks,
  };
}

function databaseCheck(env: Record<string, string | undefined>): ProductionReadinessCheck {
  if (hasValue(env.DATABASE_URL)) {
    return {
      id: "database",
      category: "data",
      title: "PostgreSQL 数据库",
      status: "ready",
      detail: "DATABASE_URL 已配置，写操作可以落库。",
      action: "上线前执行迁移和 seed，并确认备份策略。",
    };
  }

  return {
    id: "database",
    category: "data",
    title: "PostgreSQL 数据库",
    status: "blocked",
    detail: "当前没有 DATABASE_URL，系统会进入演示数据模式。",
    action: "连接 Neon、Supabase、Railway 或自建 PostgreSQL，并运行 db:migrate 与 db:seed。",
  };
}

function authSecretCheck(env: Record<string, string | undefined>): ProductionReadinessCheck {
  const secret = env.AUTH_SECRET ?? env.NEXTAUTH_SECRET;

  if (isStrongSecret(secret)) {
    return {
      id: "auth-secret",
      category: "security",
      title: "认证密钥",
      status: "ready",
      detail: "AUTH_SECRET/NEXTAUTH_SECRET 已配置为可用于生产的长度。",
      action: "保存在部署平台环境变量中，不要提交到仓库。",
    };
  }

  return {
    id: "auth-secret",
    category: "security",
    title: "认证密钥",
    status: "blocked",
    detail: "缺少强随机认证密钥，生产环境登录会有安全风险。",
    action: "生成 32 位以上随机 AUTH_SECRET，并同步 NEXTAUTH_SECRET。",
  };
}

function publicUrlCheck(env: Record<string, string | undefined>): ProductionReadinessCheck {
  const url = env.AUTH_URL ?? env.NEXTAUTH_URL ?? env.NEXT_PUBLIC_APP_URL;

  if (url && /^https:\/\/[^/]+/i.test(url) && !isLocalUrl(url)) {
    return {
      id: "public-url",
      category: "security",
      title: "公开访问域名",
      status: "ready",
      detail: "公开 HTTPS 域名已配置，登录回调和分享链接可用于外部试用。",
      action: "确认 AUTH_URL、NEXTAUTH_URL、NEXT_PUBLIC_APP_URL 都指向同一个正式域名。",
    };
  }

  return {
    id: "public-url",
    category: "security",
    title: "公开访问域名",
    status: "blocked",
    detail: url ? `当前地址仍是 ${url}，不适合发给外部用户。` : "缺少 AUTH_URL/NEXTAUTH_URL/NEXT_PUBLIC_APP_URL。",
    action: "部署到 Netlify/Vercel 后配置 HTTPS 域名，并更新认证回调地址。",
  };
}

function storageCheck(env: Record<string, string | undefined>): ProductionReadinessCheck {
  if (env.USE_S3 === "true") {
    const missing = ["AWS_REGION", "S3_BUCKET_NAME"].filter((key) => !hasValue(env[key]));

    if (missing.length === 0) {
      return {
        id: "storage",
        category: "files",
        title: "上传文件存储",
        status: "ready",
        detail: "S3 存储已启用，版本文件和附件不会丢在临时容器里。",
        action: "确认桶权限、CDN 域名、对象生命周期和备份策略。",
      };
    }

    return {
      id: "storage",
      category: "files",
      title: "上传文件存储",
      status: "blocked",
      detail: `USE_S3=true，但缺少 ${missing.join(", ")}。`,
      action: "补齐 AWS_REGION、S3_BUCKET_NAME，并按需配置 S3_PUBLIC_URL。",
    };
  }

  return {
    id: "storage",
    category: "files",
    title: "上传文件存储",
    status: "warning",
    detail: "当前使用本地 public/uploads，适合本机演示，不适合多人生产。",
    action: "上线前启用 S3 或其他对象存储。",
  };
}

function aiProviderCheck(env: Record<string, string | undefined>): ProductionReadinessCheck {
  const provider = env.AI_PROVIDER;
  const openAiReady = hasValue(env.OPENAI_API_KEY);
  const anthropicReady = hasValue(env.ANTHROPIC_API_KEY);

  if ((provider === "openai" && openAiReady) || (provider === "anthropic" && anthropicReady) || (!provider && (openAiReady || anthropicReady))) {
    return {
      id: "ai-provider",
      category: "ai",
      title: "AI 识别与排期建议",
      status: "ready",
      detail: "AI provider key 已配置，单据识别和排期说明可以使用真实模型。",
      action: "给测试账号设置低额度 API key，并监控调用成本。",
    };
  }

  return {
    id: "ai-provider",
    category: "ai",
    title: "AI 识别与排期建议",
    status: "warning",
    detail: "当前会使用 mock/rules 模式，适合演示流程，但不是实际识别能力。",
    action: "配置 OPENAI_API_KEY 或 ANTHROPIC_API_KEY，并确认 AI_PROVIDER。",
  };
}

function oauthCheck(env: Record<string, string | undefined>): ProductionReadinessCheck {
  if (hasValue(env.GOOGLE_CLIENT_ID) && hasValue(env.GOOGLE_CLIENT_SECRET)) {
    return {
      id: "oauth",
      category: "integrations",
      title: "Google 登录",
      status: "ready",
      detail: "Google OAuth 已配置，外部试用用户可以用 Google 登录。",
      action: "确认 OAuth 回调域名和授权应用名称。",
    };
  }

  return {
    id: "oauth",
    category: "integrations",
    title: "Google 登录",
    status: "warning",
    detail: "目前只能用账号密码登录，外部试用邀请成本会高一些。",
    action: "配置 GOOGLE_CLIENT_ID 和 GOOGLE_CLIENT_SECRET。",
  };
}

function notificationsCheck(env: Record<string, string | undefined>): ProductionReadinessCheck {
  if (env.NOTIFICATIONS_ENABLED === "true") {
    const ready = hasValue(env.RESEND_API_KEY) && hasValue(env.NOTIFICATION_FROM_EMAIL);

    return {
      id: "notifications",
      category: "operations",
      title: "任务与审片通知",
      status: ready ? "ready" : "warning",
      detail: ready ? "通知发送参数已配置，可以用于任务、审片和付款提醒。" : "通知已打开但缺少 Resend key 或发件邮箱。",
      action: ready ? "用测试项目发送一封通知，确认送达率。" : "补齐 RESEND_API_KEY 和 NOTIFICATION_FROM_EMAIL，或关闭 NOTIFICATIONS_ENABLED。",
    };
  }

  return {
    id: "notifications",
    category: "operations",
    title: "任务与审片通知",
    status: "warning",
    detail: "通知未启用，团队协作需要靠人工提醒。",
    action: "上线试用前至少打开邮件通知或接入飞书/Slack。",
  };
}

function environmentModeCheck(env: Record<string, string | undefined>): ProductionReadinessCheck {
  if (env.NODE_ENV === "production") {
    return {
      id: "environment",
      category: "operations",
      title: "运行环境",
      status: "ready",
      detail: "NODE_ENV=production，当前按生产构建运行。",
      action: "保留 staging 环境用于试用前回归。",
    };
  }

  return {
    id: "environment",
    category: "operations",
    title: "运行环境",
    status: "warning",
    detail: `当前 NODE_ENV=${env.NODE_ENV ?? "development"}，适合开发和本地演示。`,
    action: "正式试用请部署生产构建，并用 staging 项目先走一遍流程。",
  };
}

function resolveMode(env: Record<string, string | undefined>): ReadinessMode {
  if (!hasValue(env.DATABASE_URL)) return "demo";
  if (env.NODE_ENV === "production") return "production";
  return "trial";
}

function hasValue(value: string | undefined) {
  return Boolean(value && value.trim() && !/^your-|^placeholder$/i.test(value.trim()));
}

function isStrongSecret(value: string | undefined) {
  return hasValue(value) && value!.length >= 32 && !value!.includes("development-only") && !value!.includes("your-long-random");
}

function isLocalUrl(value: string) {
  return /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(value);
}
