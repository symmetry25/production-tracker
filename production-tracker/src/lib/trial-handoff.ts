import type { ProductionReadinessCheck, ProductionReadinessReport, ReadinessStatus } from "@/lib/production-readiness";

export type TrialDeploymentTrack = {
  id: string;
  title: string;
  owner: string;
  status: ReadinessStatus;
  summary: string;
  checkIds: string[];
  steps: string[];
};

export type TrialChecklistItem = {
  id: string;
  title: string;
  route: string;
  owner: string;
  focus: string;
  expectedEvidence: string;
};

export type TrialDemoAccount = {
  email: string;
  password: string;
  role: string;
  note: string;
};

export type TrialTesterBrief = {
  appUrl: string;
  demoAccounts: TrialDemoAccount[];
  feedbackQuestions: string[];
  handoffNotes: string[];
};

export type TrialHandoffPack = {
  generatedAt: string;
  status: ReadinessStatus;
  headline: string;
  summary: {
    readinessScore: number;
    mode: ProductionReadinessReport["mode"];
    canInviteExternalUsers: boolean;
    blockedCount: number;
    warningCount: number;
    readyCount: number;
  };
  deploymentTracks: TrialDeploymentTrack[];
  blockedItems: ProductionReadinessCheck[];
  warningItems: ProductionReadinessCheck[];
  trialChecklist: TrialChecklistItem[];
  testerBrief: TrialTesterBrief;
};

type BuildTrialHandoffInput = {
  report: ProductionReadinessReport;
  appUrl?: string;
  projectId?: string | null;
  generatedAt?: Date;
};

const defaultAppUrl = "http://localhost:3100";
const defaultTrialProjectId = "demo-mkali-mission";

const trackDefinitions: Array<Omit<TrialDeploymentTrack, "status" | "summary">> = [
  {
    id: "data-foundation",
    title: "数据与文件底座",
    owner: "技术负责人 / 制片运营",
    checkIds: ["database", "storage"],
    steps: ["配置 PostgreSQL 并执行迁移", "导入演示项目 seed 数据", "启用对象存储，验证媒体、附件和识别文件上传"],
  },
  {
    id: "access-security",
    title: "访问、域名与安全",
    owner: "技术负责人",
    checkIds: ["auth-secret", "public-url", "oauth"],
    steps: ["配置强随机 AUTH_SECRET", "绑定 HTTPS 公开域名", "确认账号密码和 Google 登录回调都可用"],
  },
  {
    id: "ai-review",
    title: "AI 识别与审片协作",
    owner: "制片 / AI 运维",
    checkIds: ["ai-provider", "notifications"],
    steps: ["配置低额度 AI key", "用收据或通告单样张跑一次识别", "测试任务、版本审阅和付款提醒通知"],
  },
  {
    id: "release-ops",
    title: "试用发布与回归",
    owner: "产品负责人",
    checkIds: ["environment"],
    steps: ["使用生产构建运行", "准备测试路线和反馈表", "记录测试人员、项目角色和关键问题"],
  },
];

export function buildTrialHandoffPack(input: BuildTrialHandoffInput): TrialHandoffPack {
  const generatedAt = input.generatedAt ?? new Date();
  const appUrl = normalizeAppUrl(input.appUrl);
  const trialChecklist = buildTrialChecklist(input.projectId);
  const blockedItems = input.report.checks.filter((check) => check.status === "blocked");
  const warningItems = input.report.checks.filter((check) => check.status === "warning");
  const deploymentTracks = trackDefinitions.map((track) => buildDeploymentTrack(track, input.report.checks));
  const canInviteExternalUsers = blockedItems.length === 0;
  const status: ReadinessStatus = blockedItems.length > 0 ? "blocked" : warningItems.length > 0 ? "warning" : "ready";

  return {
    generatedAt: generatedAt.toISOString(),
    status,
    headline: buildHeadline(status, blockedItems.length, warningItems.length),
    summary: {
      readinessScore: input.report.score,
      mode: input.report.mode,
      canInviteExternalUsers,
      blockedCount: input.report.blockedCount,
      warningCount: input.report.warningCount,
      readyCount: input.report.readyCount,
    },
    deploymentTracks,
    blockedItems,
    warningItems,
    trialChecklist,
    testerBrief: {
      appUrl,
      demoAccounts: [
        {
          email: "admin@studio.com",
          password: "admin123",
          role: "制片/管理员",
          note: "用于看项目、资源预算、审计、仪表盘和后台配置。",
        },
        {
          email: "ay@studio.com",
          password: "pass123",
          role: "艺术家/供应商",
          note: "数据库 seed 后可用，用于体验任务、版本审阅、备注和个人待办；无数据库演示模式只保证管理员账号。",
        },
      ],
      feedbackQuestions: [
        "你是否能在 5 分钟内判断项目哪里最烧钱、哪里最拖进度？",
        "资源预算、人员、器材、车辆、酒店、供应商和审计信息是否足够清楚？",
        "哪些页面像真实工作台，哪些页面仍然像演示稿？",
        "如果要在你的剧组试用，最先缺的三个字段或流程是什么？",
      ],
      handoffNotes: [
        "建议先让测试者用演示项目走完整流程，再录入一条自己的真实费用或版本。",
        "外部试用前不要使用 localhost 链接，必须使用 HTTPS 域名。",
        "如果 AI key 没配置，请明确告诉测试者当前是规则/mock 识别，不代表最终 OCR 能力。",
      ],
    },
  };
}

function buildTrialChecklist(projectId: string | null | undefined): TrialChecklistItem[] {
  const encodedProjectId = encodeURIComponent(projectId?.trim() || defaultTrialProjectId);
  const projectRoute = (tab: string) => `/app/projects/${encodedProjectId}/${tab}`;

  return [
    {
      id: "project-grid",
      title: "项目入口与多项目视图",
      route: "/app/projects",
      owner: "制片 / 监制",
      focus: "确认项目网格能快速判断项目进度、预算、审计和下一里程碑。",
      expectedEvidence: "测试者能在 60 秒内找到高风险项目和下一步动作。",
    },
    {
      id: "producer-overview",
      title: "制片总览与决策清单",
      route: projectRoute("overview"),
      owner: "制片主任 / 监制",
      focus: "查看预算脉搏、任务进度、镜头资产状态和会议议程导出。",
      expectedEvidence: "测试者能指出今天最该处理的一项付款、审计或排期风险。",
    },
    {
      id: "resource-budget",
      title: "资源预算、审计和资金流",
      route: projectRoute("resources"),
      owner: "制片财务 / 会计",
      focus: "验证部门预算、供应商、人员、器材车辆酒店场地和桑基图金额是否一致。",
      expectedEvidence: "测试者能复述预算剩余、冻结付款和缺失材料。",
    },
    {
      id: "media-review",
      title: "版本审阅与反馈闭环",
      route: projectRoute("media"),
      owner: "导演 / VFX 供应商",
      focus: "确认版本、审片队列、备注、状态流转和右键操作是否顺手。",
      expectedEvidence: "测试者能完成一次从提交版本到修改意见的流程。",
    },
    {
      id: "ai-recognition",
      title: "AI 单据识别与录入",
      route: "/app/ai/recognize",
      owner: "制片助理 / 财务",
      focus: "用 Excel、票据或手写样张测试识别结果如何进入资源预算和审计。",
      expectedEvidence: "测试者能说明哪些字段需要人工复核，哪些字段可直接入库。",
    },
    {
      id: "custom-dashboard",
      title: "自定义仪表盘",
      route: "/app/dashboards",
      owner: "监制 / 制片厂",
      focus: "确认可视化图表、放大缩小、全屏和自定义看板是否能支持汇报。",
      expectedEvidence: "测试者能搭出一个用于会议的预算或进度视图。",
    },
  ];
}

function buildDeploymentTrack(
  track: Omit<TrialDeploymentTrack, "status" | "summary">,
  checks: ProductionReadinessCheck[],
): TrialDeploymentTrack {
  const relatedChecks = track.checkIds.map((id) => checks.find((check) => check.id === id)).filter(Boolean) as ProductionReadinessCheck[];
  const status = resolveTrackStatus(relatedChecks);
  const unresolved = relatedChecks.filter((check) => check.status !== "ready");

  return {
    ...track,
    status,
    summary: unresolved.length
      ? unresolved.map((check) => `${check.title}: ${check.action}`).join(" / ")
      : "该交付轨道已经具备外部试用条件。",
  };
}

function resolveTrackStatus(checks: ProductionReadinessCheck[]): ReadinessStatus {
  if (checks.some((check) => check.status === "blocked")) return "blocked";
  if (checks.some((check) => check.status === "warning")) return "warning";
  return "ready";
}

function buildHeadline(status: ReadinessStatus, blockedCount: number, warningCount: number) {
  if (status === "blocked") return `还有 ${blockedCount} 个阻断项，先不要发给外部剧组试用。`;
  if (status === "warning") return `可以小范围试用，但还有 ${warningCount} 个上线前建议补齐项。`;
  return "已经具备外部试用交付条件，可以准备邀请测试者。";
}

function normalizeAppUrl(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed || defaultAppUrl;
}
