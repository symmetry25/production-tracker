import Link from "next/link";
import type { Session } from "next-auth";

import { logoutAction, switchLocaleAction } from "@/app/app/actions";
import { CommandPalette, type CommandItem } from "@/components/layout/command-palette";
import { KeyboardShortcuts } from "@/components/layout/keyboard-shortcuts";
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

export function AppShell({ session, locale, dictionary, children }: AppShellProps) {
  const t = dictionary.shell;
  const isDemoMode = shouldUseDemoData();
  const demoProjectBase = "/app/projects/demo-mkali-mission";
  const topNavItems: TopNavItem[] = [
    { key: "inbox", href: "/app/inbox" },
    { key: "myTasks", href: "/app/my-tasks" },
    { key: "media", href: "/app/media" },
    { key: "projects", href: "/app/projects" },
    { key: "people", href: "/app/admin/users" },
    { key: "shots", href: isDemoMode ? `${demoProjectBase}/shots` : "/app/projects" },
    { key: "assets", href: isDemoMode ? `${demoProjectBase}/assets` : "/app/projects" },
    { key: "tasks", href: isDemoMode ? `${demoProjectBase}/tasks` : "/app/projects" },
    { key: "review", href: isDemoMode ? `${demoProjectBase}/media` : "/app/projects" },
    { key: "resources", href: "/app/resource-planning" },
    { key: "calendar", href: "/app" },
  ];
  const sideNavItems: SideNavItem[] = [
    { key: "overview", href: isDemoMode ? `${demoProjectBase}/overview` : "/app" },
    { key: "projectGrid", href: "/app/projects" },
    { key: "pipeline", href: isDemoMode ? `${demoProjectBase}/tasks` : "/app" },
    { key: "resource", href: "/app/resource-planning" },
    { key: "review", href: isDemoMode ? `${demoProjectBase}/media` : "/app" },
    { key: "calendar", href: "/app" },
  ];
  const commandItems: CommandItem[] = [
    { title: t.topNav.inbox, subtitle: "Production inbox / 收件箱", href: "/app/inbox", keywords: ["inbox", "message", "收件箱", "通知"], shortcut: "g i" },
    { title: t.topNav.myTasks, subtitle: "My assignments / 我的任务", href: "/app/my-tasks", keywords: ["task", "assignment", "我的任务", "待办"], shortcut: "g m" },
    { title: t.topNav.media, subtitle: "Global media review / 媒体审阅", href: "/app/media", keywords: ["media", "review", "version", "媒体", "版本"], shortcut: "g v" },
    { title: t.topNav.projects, subtitle: "Project grid / 项目网格", href: "/app/projects", keywords: ["project", "grid", "项目", "项目网格"], shortcut: "g p" },
    { title: t.topNav.people, subtitle: "Users and departments / 人员管理", href: "/app/admin/users", keywords: ["people", "users", "crew", "人员", "部门"], shortcut: "g u" },
    { title: t.topNav.resources, subtitle: "Resource planning / 人天资源规划", href: "/app/resource-planning", keywords: ["resource", "planning", "capacity", "资源", "排期", "人天"], shortcut: "g r" },
    { title: t.sideNav.overview, subtitle: "Demo project overview / 项目总览", href: `${demoProjectBase}/overview`, keywords: ["overview", "dashboard", "总览", "看板"], shortcut: "g o" },
    { title: t.topNav.shots, subtitle: "Shot pipeline / 镜头流水线", href: `${demoProjectBase}/shots`, keywords: ["shot", "sequence", "镜头", "序列"], shortcut: "g s" },
    { title: t.topNav.assets, subtitle: "Asset pipeline / 资产流水线", href: `${demoProjectBase}/assets`, keywords: ["asset", "prop", "vehicle", "资产", "车辆"], shortcut: "g a" },
    { title: t.topNav.tasks, subtitle: "Task table and gantt / 任务表", href: `${demoProjectBase}/tasks`, keywords: ["task", "gantt", "timeline", "任务", "甘特"], shortcut: "g t" },
    { title: dictionary.pages.resources.title, subtitle: "Budget, audit, Sankey / 预算审计资金流", href: `${demoProjectBase}/resources`, keywords: ["budget", "audit", "sankey", "fund", "预算", "审计", "桑基图", "资金流"] },
    { title: t.projectTabs.phases, subtitle: "Production phases / 制片阶段", href: `${demoProjectBase}/phases`, keywords: ["phase", "schedule", "阶段", "节点"] },
    { title: t.projectTabs.workOrders, subtitle: "Work orders / 制作工单", href: `${demoProjectBase}/work-orders`, keywords: ["work order", "order", "工单", "制片"] },
  ];

  return (
    <main className="min-h-screen bg-[#11110f] text-[#f4f1e8]">
      <KeyboardShortcuts
        shortcuts={{
          "g i": "/app/inbox",
          "g m": "/app/my-tasks",
          "g v": "/app/media",
          "g p": "/app/projects",
          "g u": "/app/admin/users",
          "g r": "/app/resource-planning",
          "g o": `${demoProjectBase}/overview`,
          "g s": `${demoProjectBase}/shots`,
          "g a": `${demoProjectBase}/assets`,
          "g t": `${demoProjectBase}/tasks`,
        }}
      />
      <header className="flex h-14 items-center justify-between border-b border-[#34322b] bg-[#181713] px-6">
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

      <section className="grid grid-cols-[240px_1fr]">
        <aside className="min-h-[calc(100vh-56px)] border-r border-[#34322b] bg-[#151410] p-4">
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

        <section className="min-w-0 p-6">{children}</section>
      </section>
    </main>
  );
}
