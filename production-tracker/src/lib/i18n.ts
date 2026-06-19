import { cookies } from "next/headers";

export type Locale = "zh" | "en";

const localeCookieName = "production-tracker-locale";

export const dictionaries = {
  zh: {
    shell: {
      workspace: "工作台",
      logout: "退出",
      demoData: "演示数据",
      language: "中文",
      switchLanguage: "EN",
      topNav: {
        inbox: "收件箱",
        myTasks: "我的任务",
        media: "媒体",
        data: "数据",
        entities: "实体",
        dashboards: "仪表盘",
        ai: "AI识别",
        projects: "项目",
        people: "人员",
        shots: "镜头",
        assets: "资产",
        tasks: "任务",
        review: "审片",
        resources: "资源规划",
        calendar: "日历",
      },
      sideNav: {
        overview: "项目总览",
        projectGrid: "项目网格",
        pipeline: "流水线状态",
        resource: "资源预算",
        review: "版本审阅",
        customData: "通用录入",
        entityTypes: "实体字段",
        dashboards: "可视化仪表盘",
        aiRecognition: "AI识别",
        scorecard: "评分卡",
        calendar: "日历例外",
      },
      projectTabs: {
        overview: "总览",
        assets: "资产",
        shots: "镜头",
        tasks: "任务",
        resources: "资源",
        phases: "阶段",
        media: "媒体",
        workOrders: "工单",
        other: "其他",
      },
    },
    pages: {
      projects: {
        eyebrow: "Projects",
        title: "项目网格",
        description: "管理项目入口、截止日期、里程碑、镜头量和资产量。",
        databasePending: "数据库还没有连接或迁移",
      },
      overview: {
        eyebrow: "项目总览",
        fallbackDescription: "生产洞察看板汇总镜头、资产、任务、版本和成员状态，供制片、监制和工作室负责人快速判断风险。",
        report: "下载报告",
        databasePending: "生产洞察看板等待数据库",
        producerCommand: {
          eyebrow: "制片监控台",
          scheduleHealth: "排期健康度",
          budgetBurn: "预算消耗",
          reviewQueue: "审片队列",
          overloadedCrew: "超负载人员",
          decisions: "下一步制片决策",
          actionsCount: "{count} 项",
          budgetCorridor: "预算走廊",
          loggedCost: "已记录成本",
          approvedBid: "已批准预算",
          atRisk: "风险金额",
          openTasks: "未完成任务",
          producerNote: "制片建议",
          milestone: "里程碑",
          dateUnset: "日期未设置",
          criticalSchedule: "关键排期",
          watchItems: "{count} 个观察项",
          deliveryProgress: "交付进度",
          daysRemaining: "剩余 {days} 天",
          versions: "版本",
          pendingReview: "{count} 个待审",
          loggedVsBid: "{actual} / {bid}",
          healthHeadlines: {
            danger: "今天需要制片决策",
            warn: "排期可控但需要盯紧",
            normal: "项目节奏稳定",
          },
          healthNarratives: {
            danger: "还有 {critical} 个关键风险会影响 {milestone}，建议先锁定负责人、供应商交付和预算冻结线。",
            warn: "当前有 {warning} 个观察项，适合在例会上确认前置依赖、审片节奏和人员负载。",
            normal: "当前没有明显逾期、超预算或审片阻塞，可以按既定节奏推进。",
          },
          financeRecommendations: {
            freeze: "先冻结高风险任务的额外工时，复核 {amount} 差额后再放行。",
            watch: "预算消耗已到 {burnPct}%，建议把剩余变更都走制片审批。",
            stable: "预算仍在可控区间，可以继续按现有审批节奏执行。",
          },
          actionLabels: {
            budget: "预算",
            review: "审片",
            critical: "关键",
            warning: "关注",
            info: "提示",
          },
          actionTitles: {
            budget: "冻结超预算任务，复核 {amount} 差额",
            review: "安排导演/监制集中审片，清掉 {count} 个待审版本",
          },
          actionMeta: {
            burn: "{burnPct}% 消耗",
            items: "{count} 项",
          },
          scheduleActions: {
            overdue: "{context} / 当日决策：补人、拆 scope，或后移下游依赖。",
            over_budget: "{context} / 冻结额外工时，要求负责人提交剩余工作量。",
            missing_owner: "{context} / 指定 owner 和 reviewer 后再进入 ready 队列。",
            dependency_gap: "{context} / 先确认前置任务状态、交付版本和 lag 天数。",
            review_bottleneck: "{context} / 组织导演/监制审片，明确 approve 或返修责任。",
            ready_to_pull: "{context} / 本周有空档时可提前拉入执行。",
          },
        },
      },
      shots: {
        eyebrow: "Shots",
        title: "镜头流水线",
        description: "按 Sequence 分组查看每个镜头在 LAY、ANM、CFX、FX、LGT、CMP 的状态。",
      },
      assets: {
        eyebrow: "Assets",
        title: "资产流水线",
        description: "按资产类型分组查看角色、环境、道具、车辆和 FX 资产的任务状态。",
      },
      tasks: {
        eyebrow: "Tasks",
        title: "任务表与甘特图",
        description: "把 Shot、Asset、负责人、预算、日期和依赖关系放在同一个制作追踪视图里。",
      },
      media: {
        eyebrow: "Media",
        title: "版本审阅",
        description: "上传任务版本，集中播放视频/图片，记录导演、监制和供应商反馈。",
      },
      resources: {
        eyebrow: "Resources",
        title: "资源与预算中心",
        description: "把部门预算、人员成本、器材车辆、酒店场地、VFX 供应商和审计风险放在一个制片视图里。",
        totalBudget: "总预算",
        committed: "已承诺",
        actual: "支出口径",
        departmentBudget: "部门预算",
        auditSignals: "审计信号",
        vendorSpend: "供应商开销",
        peopleCost: "人员成本",
        fundFlow: "资金流向",
        paymentGate: "付款节点",
        auditDocuments: "审计材料",
      },
    },
  },
  en: {
    shell: {
      workspace: "Workspace",
      logout: "Sign out",
      demoData: "Demo data",
      language: "English",
      switchLanguage: "中文",
      topNav: {
        inbox: "Inbox",
        myTasks: "My Tasks",
        media: "Media",
        data: "Data",
        entities: "Entities",
        dashboards: "Dashboards",
        ai: "AI",
        projects: "Projects",
        people: "People",
        shots: "Shots",
        assets: "Assets",
        tasks: "Tasks",
        review: "Review",
        resources: "Resource Planning",
        calendar: "Calendar",
      },
      sideNav: {
        overview: "Project overview",
        projectGrid: "Project grid",
        pipeline: "Pipeline status",
        resource: "Resource budget",
        review: "Version review",
        customData: "Custom data",
        entityTypes: "Entity types",
        dashboards: "Dashboards",
        aiRecognition: "AI recognition",
        scorecard: "Scorecard",
        calendar: "Calendar exceptions",
      },
      projectTabs: {
        overview: "Overview",
        assets: "Assets",
        shots: "Shots",
        tasks: "Tasks",
        resources: "Resources",
        phases: "Phases",
        media: "Media",
        workOrders: "Work Orders",
        other: "Other",
      },
    },
    pages: {
      projects: {
        eyebrow: "Projects",
        title: "Project grid",
        description: "Manage project entry points, deadlines, milestones, shot counts, and asset counts.",
        databasePending: "Database is not connected or migrated yet",
      },
      overview: {
        eyebrow: "Project overview",
        fallbackDescription:
          "Production insights summarize shots, assets, tasks, versions, and crew status for producers, supervisors, and studio leads.",
        report: "Download report",
        databasePending: "Production insights are waiting for the database",
        producerCommand: {
          eyebrow: "Producer command",
          scheduleHealth: "Schedule health",
          budgetBurn: "Budget burn",
          reviewQueue: "Review queue",
          overloadedCrew: "Overloaded crew",
          decisions: "Next producer decisions",
          actionsCount: "{count} actions",
          budgetCorridor: "Budget corridor",
          loggedCost: "logged cost",
          approvedBid: "approved bid",
          atRisk: "At risk",
          openTasks: "Open tasks",
          producerNote: "Producer note",
          milestone: "Milestone",
          dateUnset: "date unset",
          criticalSchedule: "Critical schedule",
          watchItems: "{count} watch items",
          deliveryProgress: "Delivery progress",
          daysRemaining: "{days} days remaining",
          versions: "Versions",
          pendingReview: "{count} pending review",
          loggedVsBid: "{actual} / {bid}",
          healthHeadlines: {
            danger: "Producer decision needed today",
            warn: "Schedule is controllable, but needs attention",
            normal: "Project rhythm is stable",
          },
          healthNarratives: {
            danger: "{critical} critical risks may affect {milestone}. Lock owners, vendor delivery, and budget freeze lines first.",
            warn: "{warning} watch items need a producer pass on dependencies, review cadence, and crew load.",
            normal: "No obvious overdue, over-budget, or review blockers are visible. Continue on the current plan.",
          },
          financeRecommendations: {
            freeze: "Freeze extra hours on high-risk tasks and review the {amount} variance before releasing more work.",
            watch: "Budget burn is at {burnPct}%. Route remaining changes through producer approval.",
            stable: "Budget is still inside the working corridor. Continue with the current approval cadence.",
          },
          actionLabels: {
            budget: "budget",
            review: "review",
            critical: "critical",
            warning: "warning",
            info: "info",
          },
          actionTitles: {
            budget: "Freeze over-budget work and review {amount} variance",
            review: "Run a director/producer review block for {count} pending versions",
          },
          actionMeta: {
            burn: "{burnPct}% burn",
            items: "{count} items",
          },
          scheduleActions: {
            overdue: "{context} / Same-day decision: add crew, reduce scope, or move downstream dependencies.",
            over_budget: "{context} / Freeze extra hours and request remaining effort from the owner.",
            missing_owner: "{context} / Assign owner and reviewer before it enters the ready queue.",
            dependency_gap: "{context} / Confirm upstream status, delivery version, and lag days first.",
            review_bottleneck: "{context} / Hold director/producer review and decide approve or revision owner.",
            ready_to_pull: "{context} / Pull forward if this week has idle capacity.",
          },
        },
      },
      shots: {
        eyebrow: "Shots",
        title: "Shot pipeline",
        description: "Review every shot by sequence across LAY, ANM, CFX, FX, LGT, and CMP.",
      },
      assets: {
        eyebrow: "Assets",
        title: "Asset pipeline",
        description: "Group characters, environments, props, vehicles, and FX assets by type and task status.",
      },
      tasks: {
        eyebrow: "Tasks",
        title: "Task table and Gantt",
        description: "Track shots, assets, owners, budgets, dates, and dependencies in one production view.",
      },
      media: {
        eyebrow: "Media",
        title: "Version review",
        description: "Upload task versions, play media, and capture director, producer, and vendor feedback.",
      },
      resources: {
        eyebrow: "Resources",
        title: "Resource and budget center",
        description: "Combine department budgets, crew cost, equipment, vehicles, hotels, locations, VFX vendors, and audit risk in one producer view.",
        totalBudget: "Total budget",
        committed: "Committed",
        actual: "Spend view",
        departmentBudget: "Department budget",
        auditSignals: "Audit signals",
        vendorSpend: "Vendor spend",
        peopleCost: "People cost",
        fundFlow: "Fund flow",
        paymentGate: "Payment gates",
        auditDocuments: "Audit documents",
      },
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(localeCookieName)?.value;
  return value === "en" ? "en" : "zh";
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function getNextLocale(locale: Locale): Locale {
  return locale === "zh" ? "en" : "zh";
}

export { localeCookieName };
