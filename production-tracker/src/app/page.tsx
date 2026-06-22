const buildSteps = [
  { label: "Step 1", title: "项目初始化与数据库", status: "完成基础", detail: "Next.js、Prisma 7、PostgreSQL schema、seed、工程脚本" },
  { label: "Step 2", title: "认证 + 全局布局", status: "下一步", detail: "NextAuth v5、登录页、受保护路由、顶部导航" },
  { label: "Step 3", title: "项目网格页", status: "待开始", detail: "项目卡片、缩略图上传、创建项目弹窗" },
  { label: "Step 4", title: "镜头流水线表格", status: "待开始", detail: "Shot 表格、状态点、右键菜单、内联编辑" },
];

const schemaStats = [
  ["Models", "14"],
  ["Enums", "6"],
  ["Seed users", "8"],
  ["Demo shots", "9"],
  ["Pipeline steps", "6"],
  ["Demo assets", "6"],
];

const commands = [
  ["生成 Prisma Client", "npm run db:generate"],
  ["创建数据库迁移", "npm run db:migrate -- --name init"],
  ["写入演示数据", "npm run db:seed"],
  ["打开数据后台", "npm run db:studio"],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_0%,rgba(215,168,84,0.18),transparent_34%),linear-gradient(180deg,#171713_0%,#0d0d0c_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-8 py-6">
        <header className="flex h-14 items-center justify-between border-b border-[#34322b]">
          <div className="flex items-center gap-3">
            <div className="grid size-8 place-items-center rounded-[6px] bg-[#1db954] text-base font-black text-[#11110f]">
              F
            </div>
            <div>
              <p className="text-sm font-semibold text-[#f4f1e8]">Frederick</p>
              <p className="text-xs text-[#9f9b8f]">正式工程版 · ShotGrid-style production control</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#bcb7aa]">
            <span className="rounded-sm border border-[#3f3c33] bg-[#1c1b18] px-3 py-1.5">Next 16</span>
            <span className="rounded-sm border border-[#3f3c33] bg-[#1c1b18] px-3 py-1.5">Prisma 7</span>
            <span className="rounded-sm border border-[#3f3c33] bg-[#1c1b18] px-3 py-1.5">PostgreSQL</span>
          </div>
        </header>

        <section className="grid flex-1 grid-cols-[1.15fr_0.85fr] gap-8 py-8">
          <div className="flex flex-col justify-between">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-[#898477]">DEV roadmap</p>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] text-[#f6f1e6]">
                从静态预算原型，进入真实制片追踪系统。
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#bcb7aa]">
                当前版本已经独立出正式工程目录，保留旧的 HTML 原型，同时开始搭建项目、镜头、资产、任务、审阅、资源规划和日历异常的数据库底座。
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3">
              {buildSteps.map((step) => (
                <div key={step.label} className="border border-[#353229] bg-[#181713]/85 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="font-mono text-xs text-[#8f8a7e]">{step.label}</span>
                    <span
                      className={[
                        "rounded-sm px-2.5 py-1 text-xs font-medium",
                        step.status === "完成基础"
                          ? "bg-[#1d6f52]/20 text-[#83d6ae]"
                          : step.status === "下一步"
                            ? "bg-[#d8b46a]/15 text-[#e9cb80]"
                            : "bg-[#2b2924] text-[#9f9b8f]",
                      ].join(" ")}
                    >
                      {step.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-[#f4f1e8]">{step.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-[#aaa599]">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="grid gap-4">
            <section className="border border-[#39362e] bg-[#f1eadb] p-5 text-[#181713] shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b6d25]">Database base</p>
                  <h2 className="mt-2 text-2xl font-semibold">Prisma schema ready</h2>
                </div>
                <span className="rounded-sm bg-[#183b2e] px-2.5 py-1 text-xs font-semibold text-[#a7f0c7]">VALID</span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {schemaStats.map(([label, value]) => (
                  <div key={label} className="border border-[#d8ccb5] bg-[#fffaf0] p-3">
                    <p className="text-2xl font-semibold tabular-nums">{value}</p>
                    <p className="mt-1 text-xs text-[#6d675d]">{label}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-[#353229] bg-[#181713]/90 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Runbook</p>
              <div className="mt-4 space-y-3">
                {commands.map(([label, command]) => (
                  <div key={command} className="flex items-center justify-between gap-4 border border-[#302d26] bg-[#11110f] px-3 py-3">
                    <span className="text-sm text-[#c9c3b5]">{label}</span>
                    <code className="font-mono text-xs text-[#e8c678]">{command}</code>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-[#353229] bg-[#181713]/90 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Next action</p>
              <h2 className="mt-3 text-xl font-semibold text-[#f4f1e8]">进入 Step 2：认证和全局后台布局</h2>
              <p className="mt-3 text-sm leading-6 text-[#aaa599]">
                接下来会加入 Credentials 登录、session、受保护的工作区路由，以及更像制片厂内部系统的顶部导航和项目入口。
              </p>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
