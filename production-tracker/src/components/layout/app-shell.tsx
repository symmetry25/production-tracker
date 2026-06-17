import Link from "next/link";
import type { Session } from "next-auth";

import { logoutAction, switchLocaleAction } from "@/app/app/actions";
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
    { key: "projects", href: "/app/projects" },
    { key: "shots", href: isDemoMode ? `${demoProjectBase}/shots` : "/app/projects" },
    { key: "assets", href: isDemoMode ? `${demoProjectBase}/assets` : "/app/projects" },
    { key: "tasks", href: isDemoMode ? `${demoProjectBase}/tasks` : "/app/projects" },
    { key: "review", href: isDemoMode ? `${demoProjectBase}/media` : "/app/projects" },
    { key: "resources", href: "/app" },
    { key: "calendar", href: "/app" },
  ];
  const sideNavItems: SideNavItem[] = [
    { key: "overview", href: isDemoMode ? `${demoProjectBase}/overview` : "/app" },
    { key: "projectGrid", href: "/app/projects" },
    { key: "pipeline", href: isDemoMode ? `${demoProjectBase}/tasks` : "/app" },
    { key: "resource", href: "/app" },
    { key: "review", href: isDemoMode ? `${demoProjectBase}/media` : "/app" },
    { key: "calendar", href: "/app" },
  ];

  return (
    <main className="min-h-screen bg-[#11110f] text-[#f4f1e8]">
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
