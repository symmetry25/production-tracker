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
        projects: "项目",
        shots: "镜头",
        assets: "资产",
        tasks: "任务",
        review: "审片",
        resources: "资源",
        calendar: "日历",
      },
      sideNav: {
        overview: "项目总览",
        projectGrid: "项目网格",
        pipeline: "流水线状态",
        resource: "资源计划",
        review: "版本审阅",
        calendar: "日历例外",
      },
      projectTabs: {
        overview: "总览",
        assets: "资产",
        shots: "镜头",
        tasks: "任务",
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
        eyebrow: "Project overview",
        fallbackDescription: "生产洞察看板汇总镜头、资产、任务、版本和成员状态，供制片、监制和工作室负责人快速判断风险。",
        report: "下载报告",
        databasePending: "生产洞察看板等待数据库",
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
        projects: "Projects",
        shots: "Shots",
        assets: "Assets",
        tasks: "Tasks",
        review: "Review",
        resources: "Resources",
        calendar: "Calendar",
      },
      sideNav: {
        overview: "Project overview",
        projectGrid: "Project grid",
        pipeline: "Pipeline status",
        resource: "Resource plan",
        review: "Version review",
        calendar: "Calendar exceptions",
      },
      projectTabs: {
        overview: "Overview",
        assets: "Assets",
        shots: "Shots",
        tasks: "Tasks",
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
