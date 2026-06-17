import Link from "next/link";
import type { Session } from "next-auth";

import { logoutAction } from "@/app/app/actions";

const topNavItems = [
  { label: "Projects", href: "/app/projects" },
  { label: "Shots", href: "/app/projects" },
  { label: "Assets", href: "/app/projects" },
  { label: "Tasks", href: "/app/projects" },
  { label: "Review", href: "/app" },
  { label: "Resources", href: "/app" },
  { label: "Calendar", href: "/app" },
];

const sideNavItems = [
  { label: "Project overview", href: "/app" },
  { label: "Project grid", href: "/app/projects" },
  { label: "Pipeline status", href: "/app" },
  { label: "Resource plan", href: "/app" },
  { label: "Version review", href: "/app" },
  { label: "Calendar exceptions", href: "/app" },
];

type AppShellProps = {
  session: Session;
  children: React.ReactNode;
};

export function AppShell({ session, children }: AppShellProps) {
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
                key={item.label}
                href={item.href}
                className={[
                  "px-3 py-2 text-xs font-medium transition",
                  index === 0 ? "bg-[#2b2924] text-[#f4f1e8]" : "text-[#aaa599] hover:bg-[#22201c] hover:text-[#f4f1e8]",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{session.user?.name}</p>
            <p className="text-xs text-[#9f9b8f]">
              {session.user?.role ?? "ARTIST"} · {session.user?.department ?? "Production"}
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="border border-[#3f3c33] px-3 py-1.5 text-xs text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
            >
              退出
            </button>
          </form>
        </div>
      </header>

      <section className="grid grid-cols-[240px_1fr]">
        <aside className="min-h-[calc(100vh-56px)] border-r border-[#34322b] bg-[#151410] p-4">
          <p className="px-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#7f7a70]">Workspace</p>
          <div className="mt-4 space-y-1">
            {sideNavItems.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                className={[
                  "block px-3 py-2 text-sm transition",
                  index === 0 ? "bg-[#2b2924] text-[#f4f1e8]" : "text-[#a7a196] hover:bg-[#1f1e1a]",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </aside>

        <section className="min-w-0 p-6">{children}</section>
      </section>
    </main>
  );
}
