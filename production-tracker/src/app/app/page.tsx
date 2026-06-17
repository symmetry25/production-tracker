import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { logoutAction } from "./actions";

const navItems = ["Projects", "Shots", "Assets", "Tasks", "Review", "Resources", "Calendar"];

const widgets = [
  ["Active projects", "1", "MKALI demo project is ready after seed"],
  ["Pipeline tasks", "54", "9 shots × 6 steps"],
  ["Crew capacity", "40d", "8 users at 5 days per week"],
  ["Review queue", "1", "Demo comp version pending review"],
];

export default async function AppPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#11110f] text-[#f4f1e8]">
      <header className="flex h-14 items-center justify-between border-b border-[#34322b] bg-[#181713] px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="grid size-8 place-items-center border border-[#d8b46a]/45 bg-[#d8b46a]/10 text-sm font-semibold text-[#e8c678]">
              PT
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d8b46a]">Production Tracker</p>
          </div>
          <nav className="flex items-center gap-1">
            {navItems.map((item, index) => (
              <span
                key={item}
                className={[
                  "px-3 py-2 text-xs font-medium",
                  index === 0 ? "bg-[#2b2924] text-[#f4f1e8]" : "text-[#aaa599] hover:bg-[#22201c] hover:text-[#f4f1e8]",
                ].join(" ")}
              >
                {item}
              </span>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-xs text-[#9f9b8f]">
              {session.user.role ?? "ARTIST"} · {session.user.department ?? "Production"}
            </p>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="border border-[#3f3c33] px-3 py-1.5 text-xs text-[#c9c3b5] hover:border-[#d8b46a] hover:text-[#e8c678]">
              退出
            </button>
          </form>
        </div>
      </header>

      <section className="grid grid-cols-[240px_1fr]">
        <aside className="min-h-[calc(100vh-56px)] border-r border-[#34322b] bg-[#151410] p-4">
          <p className="px-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#7f7a70]">Workspace</p>
          <div className="mt-4 space-y-1">
            {["Project overview", "Pipeline status", "Resource plan", "Version review", "Calendar exceptions"].map((item, index) => (
              <div
                key={item}
                className={[
                  "px-3 py-2 text-sm",
                  index === 0 ? "bg-[#2b2924] text-[#f4f1e8]" : "text-[#a7a196] hover:bg-[#1f1e1a]",
                ].join(" ")}
              >
                {item}
              </div>
            ))}
          </div>
        </aside>

        <section className="p-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">Protected dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold">Mkali&apos;s Mission 控制台</h1>
              <p className="mt-2 text-sm text-[#aaa599]">Step 2 已建立登录、会话、受保护路由和全局后台布局。</p>
            </div>
            <div className="border border-[#34322b] bg-[#181713] px-4 py-3 text-right">
              <p className="text-xs text-[#9f9b8f]">Next build status</p>
              <p className="mt-1 text-sm font-semibold text-[#83d6ae]">Ready</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {widgets.map(([label, value, detail]) => (
              <div key={label} className="border border-[#353229] bg-[#181713] p-4">
                <p className="text-xs text-[#9f9b8f]">{label}</p>
                <p className="mt-3 text-3xl font-semibold tabular-nums text-[#f4f1e8]">{value}</p>
                <p className="mt-3 text-xs leading-5 text-[#aaa599]">{detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-[1.2fr_0.8fr] gap-4">
            <section className="border border-[#353229] bg-[#181713] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Pipeline foundation</h2>
                <span className="text-xs text-[#9f9b8f]">LAY · ANM · CFX · FX · LGT · CMP</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {["LAY", "ANM", "CFX", "FX", "LGT", "CMP"].map((step, index) => (
                  <div key={step} className="border border-[#34322b] bg-[#11110f] p-3">
                    <p className="font-mono text-sm text-[#e8c678]">{step}</p>
                    <div className="mt-4 h-1 bg-[#2b2924]">
                      <div className="h-full bg-[#d8b46a]" style={{ width: `${70 - index * 8}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-[#353229] bg-[#f1eadb] p-5 text-[#181713]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b6d25]">Seed account</p>
              <h2 className="mt-3 text-xl font-semibold">admin@studio.com</h2>
              <p className="mt-3 text-sm leading-6 text-[#5e594f]">
                运行 `npm run db:migrate -- --name init` 和 `npm run db:seed` 后，这个账号会从数据库验证登录。
              </p>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}
