const widgets = [
  ["Active projects", "1", "MKALI demo project is ready after seed"],
  ["Pipeline tasks", "54", "9 shots x 6 steps"],
  ["Crew capacity", "40d", "8 users at 5 days per week"],
  ["Review queue", "1", "Demo comp version pending review"],
];

export default function AppPage() {
  return (
    <>
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
    </>
  );
}
