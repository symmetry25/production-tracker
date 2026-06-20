import Link from "next/link";
import type { Session } from "next-auth";

import { logoutAction, switchLocaleAction } from "@/app/app/actions";
import { CommandPalette, type CommandItem } from "@/components/layout/command-palette";
import { KeyboardShortcuts } from "@/components/layout/keyboard-shortcuts";
import { demoProjectId, getCurrentProjectId } from "@/lib/current-project";
import { shouldUseDemoData } from "@/lib/demo-data";
import type { Dictionary, Locale } from "@/lib/i18n";

type TopNavItem = { key: keyof Dictionary["shell"]["topNav"]; href: string };
type SideNavItem = { key: keyof Dictionary["shell"]["sideNav"]; href: string };

type AppShellProps = {
  session: Session;
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
};

export async function AppShell({ session, locale, dictionary, children }: AppShellProps) {
  const t = dictionary.shell;
  const isDemoMode = shouldUseDemoData();
  const currentProjectId = await getCurrentProjectId().catch(() => (isDemoMode ? demoProjectId : null));
  const currentProjectBase = currentProjectId ? `/app/projects/${encodeURIComponent(currentProjectId)}` : "/app/projects";
  const projectQuery = currentProjectId ? `?projectId=${encodeURIComponent(currentProjectId)}` : "";
  const projectPageHref = (tab: string) => (currentProjectId ? `${currentProjectBase}/${tab}` : "/app/projects");
  const topNavItems: TopNavItem[] = [
    { key: "inbox", href: `/app/inbox${projectQuery}` },
    { key: "myTasks", href: `/app/my-tasks${projectQuery}` },
    { key: "media", href: `/app/media${projectQuery}` },
    { key: "data", href: "/app/custom-data" },
    { key: "entities", href: "/app/entity-types" },
    { key: "dashboards", href: "/app/dashboards" },
    { key: "ai", href: "/app/ai/recognize" },
    { key: "projects", href: "/app/projects" },
    { key: "people", href: "/app/admin/users" },
    { key: "shots", href: projectPageHref("shots") },
    { key: "assets", href: projectPageHref("assets") },
    { key: "tasks", href: projectPageHref("tasks") },
    { key: "review", href: projectPageHref("media") },
    { key: "resources", href: `/app/resource-planning${projectQuery}` },
    { key: "calendar", href: "/app" },
  ];
  const sideNavItems: SideNavItem[] = [
    { key: "overview", href: projectPageHref("overview") },
    { key: "projectGrid", href: "/app/projects" },
    { key: "pipeline", href: projectPageHref("tasks") },
    { key: "resource", href: `/app/resource-planning${projectQuery}` },
    { key: "review", href: projectPageHref("media") },
    { key: "customData", href: "/app/custom-data" },
    { key: "entityTypes", href: "/app/entity-types" },
    { key: "dashboards", href: "/app/dashboards" },
    { key: "aiRecognition", href: "/app/ai/recognize" },
    { key: "scorecard", href: "/app/users/demo-user-vfx/scorecard" },
    { key: "readiness", href: "/app/admin/readiness" },
    { key: "calendar", href: "/app" },
  ];
  const commandItems: CommandItem[] = [
    { title: t.topNav.inbox, subtitle: "Production inbox / 收件箱", href: `/app/inbox${projectQuery}`, keywords: ["inbox", "message", "收件箱", "通知"], shortcut: "g i" },
    { title: t.topNav.myTasks, subtitle: "My assignments / 我的任务", href: `/app/my-tasks${projectQuery}`, keywords: ["task", "assignment", "我的任务", "待办"], shortcut: "g m" },
    { title: t.topNav.media, subtitle: "Global media review / 媒体审阅", href: `/app/media${projectQuery}`, keywords: ["media", "review", "version", "媒体", "版本"], shortcut: "g v" },
    { title: t.topNav.data, subtitle: "Universal entry and templates / 通用录入模板", href: "/app/custom-data", keywords: ["data", "schema", "excel", "ai", "template", "数据", "录入", "模板", "字段"], shortcut: "g d" },
    { title: t.topNav.entities, subtitle: "Dynamic entity types / 动态实体字段", href: "/app/entity-types", keywords: ["entity", "schema", "field", "实体", "字段"], shortcut: "g e" },
    { title: t.topNav.dashboards, subtitle: "Custom dashboards / 自定义可视化", href: "/app/dashboards", keywords: ["dashboard", "chart", "visualization", "仪表盘", "图表"], shortcut: "g b" },
    { title: t.topNav.ai, subtitle: "AI document recognition / AI 单据识别", href: "/app/ai/recognize", keywords: ["ai", "ocr", "invoice", "识别", "发票", "手写"], shortcut: "g x" },
    { title: t.topNav.projects, subtitle: "Project grid / 项目网格", href: "/app/projects", keywords: ["project", "grid", "项目", "项目网格"], shortcut: "g p" },
    { title: t.topNav.people, subtitle: "Users and departments / 人员管理", href: "/app/admin/users", keywords: ["people", "users", "crew", "人员", "部门"], shortcut: "g u" },
    { title: "人员评分卡", subtitle: "Grade, trust score, skill matrix / 等级信任评分技能矩阵", href: "/app/users/demo-user-vfx/scorecard", keywords: ["score", "grade", "skill", "评分", "等级", "技能"], shortcut: "g l" },
    { title: t.sideNav.readiness, subtitle: "Production readiness / 上线前检查", href: "/app/admin/readiness", keywords: ["readiness", "deploy", "database", "auth", "上线", "部署", "数据库", "认证"], shortcut: "g y" },
    { title: t.topNav.resources, subtitle: "Resource planning / 人天资源规划", href: `/app/resource-planning${projectQuery}`, keywords: ["resource", "planning", "capacity", "资源", "排期", "人天"], shortcut: "g r" },
    { title: t.sideNav.overview, subtitle: "Project overview / 项目总览", href: projectPageHref("overview"), keywords: ["overview", "dashboard", "总览", "看板"], shortcut: "g o" },
    { title: t.topNav.shots, subtitle: "Shot pipeline / 镜头流水线", href: projectPageHref("shots"), keywords: ["shot", "sequence", "镜头", "序列"], shortcut: "g s" },
    { title: t.topNav.assets, subtitle: "Asset pipeline / 资产流水线", href: projectPageHref("assets"), keywords: ["asset", "prop", "vehicle", "资产", "车辆"], shortcut: "g a" },
    { title: t.topNav.tasks, subtitle: "Task table and gantt / 任务表", href: projectPageHref("tasks"), keywords: ["task", "gantt", "timeline", "任务", "甘特"], shortcut: "g t" },
    { title: dictionary.pages.resources.title, subtitle: "Budget, audit, Sankey / 预算审计资金流", href: projectPageHref("resources"), keywords: ["budget", "audit", "sankey", "fund", "预算", "审计", "桑基图", "资金流"] },
    { title: "制片资源报告", subtitle: "Printable producer report / 可打印制片报告", href: projectPageHref("resources/report"), keywords: ["report", "pdf", "print", "budget", "报告", "打印", "预算", "审计"] },
    { title: t.projectTabs.phases, subtitle: "Production phases / 制片阶段", href: projectPageHref("phases"), keywords: ["phase", "schedule", "阶段", "节点"] },
    { title: t.projectTabs.workOrders, subtitle: "Work orders / 制作工单", href: projectPageHref("work-orders"), keywords: ["work order", "order", "工单", "制片"] },
    ...["DIT组", "调色/VFX组", "摄影组", "灯光电工组", "场地运输组", "后期统筹组"].map((department) => ({
      title: `${department} 资源下钻`,
      subtitle: "Department capacity drill-down / 部门资源明细",
      href: `/app/resource-planning/${encodeURIComponent(department)}${projectQuery}`,
      keywords: ["department", "resource", "capacity", "部门", "资源", "下钻", department],
    })),
  ];

  return (
    <main className="min-h-screen bg-[#11110f] text-[#f4f1e8]">
      <KeyboardShortcuts
        shortcuts={{
          "g i": `/app/inbox${projectQuery}`,
          "g m": `/app/my-tasks${projectQuery}`,
          "g v": `/app/media${projectQuery}`,
          "g d": "/app/custom-data",
          "g e": "/app/entity-types",
          "g b": "/app/dashboards",
          "g x": "/app/ai/recognize",
          "g p": "/app/projects",
          "g u": "/app/admin/users",
          "g r": `/app/resource-planning${projectQuery}`,
          "g y": "/app/admin/readiness",
          "g o": projectPageHref("overview"),
          "g s": projectPageHref("shots"),
          "g a": projectPageHref("assets"),
          "g t": projectPageHref("tasks"),
          "g l": "/app/users/demo-user-vfx/scorecard",
        }}
      />
      <header className="flex h-14 items-center justify-between border-b border-[#34322b] bg-[#181713] px-6 print:hidden">
        <div className="flex items-center gap-6">
          <Link href="/app" className="flex items-center gap-3">
            <div className="grid size-8 place-items-center border border-[#d8b46a]/45 bg-[#d8b46a]/10 text-sm font-semibold text-[#e8c678]">
              PT
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d8b46a]">Production Tracker</p>
          </Link>
          <nav className="flex items-center gap-1">
            {topNavItems.map((item, index) => (
              <Link
                key={item.key}
                href={item.href}
                className={[
                  "px-3 py-2 text-xs font-medium transition",
                  index === 0 ? "bg-[#2b2924] text-[#f4f1e8]" : "text-[#aaa599] hover:bg-[#22201c] hover:text-[#f4f1e8]",
                ].join(" ")}
              >
                {t.topNav[item.key]}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <CommandPalette items={commandItems} />
          {isDemoMode ? (
            <span className="border border-[#d8b46a]/35 bg-[#d8b46a]/10 px-3 py-1.5 text-xs font-semibold text-[#e8c678]">
              {t.demoData}
            </span>
          ) : null}
          <form action={switchLocaleAction}>
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="h-8 border border-[#3f3c33] px-3 text-xs text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
              title={t.language}
            >
              {t.switchLanguage}
            </button>
          </form>
          <div className="text-right">
            <p className="text-sm font-medium">{session.user?.name}</p>
            <p className="text-xs text-[#9f9b8f]">
              {session.user?.role ?? "ARTIST"} · {session.user?.department ?? "Production"}
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="h-8 border border-[#3f3c33] px-3 text-xs text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
            >
              {t.logout}
            </button>
          </form>
        </div>
      </header>

      <section className="grid grid-cols-[240px_1fr] print:block">
        <aside className="min-h-[calc(100vh-56px)] border-r border-[#34322b] bg-[#151410] p-4 print:hidden">
          <p className="px-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#7f7a70]">{t.workspace}</p>
          <div className="mt-4 space-y-1">
            {sideNavItems.map((item, index) => (
              <Link
                key={item.key}
                href={item.href}
                className={[
                  "block px-3 py-2 text-sm transition",
                  index === 0 ? "bg-[#2b2924] text-[#f4f1e8]" : "text-[#a7a196] hover:bg-[#1f1e1a]",
                ].join(" ")}
              >
                {t.sideNav[item.key]}
              </Link>
            ))}
          </div>
        </aside>

        <section className="min-w-0 p-6 print:p-0">{children}</section>
      </section>
    </main>
  );
}
