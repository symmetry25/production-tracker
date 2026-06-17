import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen grid-cols-[0.95fr_1.05fr] bg-[#11110f] text-[#f4f1e8]">
      <section className="flex flex-col justify-between border-r border-[#34322b] bg-[#181713] px-10 py-8">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center border border-[#d8b46a]/45 bg-[#d8b46a]/10 text-sm font-semibold text-[#e8c678]">
            PT
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">Production Tracker</p>
            <p className="text-xs text-[#9f9b8f]">secure production workspace</p>
          </div>
        </div>

        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-[#898477]">Step 2</p>
          <h1 className="max-w-xl text-5xl font-semibold leading-[1.02]">登录后进入项目、镜头、资产和资源规划工作台。</h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-[#aaa599]">
            本地开发环境没有数据库时，会启用演示登录；接入 PostgreSQL 后会自动读取 Prisma 用户表。
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs text-[#bcb7aa]">
          <div className="border border-[#34322b] bg-[#11110f] p-3">
            <p className="font-mono text-[#e8c678]">ADMIN</p>
            <p className="mt-2">权限角色</p>
          </div>
          <div className="border border-[#34322b] bg-[#11110f] p-3">
            <p className="font-mono text-[#e8c678]">JWT</p>
            <p className="mt-2">Session</p>
          </div>
          <div className="border border-[#34322b] bg-[#11110f] p-3">
            <p className="font-mono text-[#e8c678]">/app</p>
            <p className="mt-2">受保护路由</p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-8">
        <div className="w-full max-w-md border border-[#353229] bg-[#181713]/90 p-8 shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Sign in</p>
          <h2 className="mt-3 text-2xl font-semibold">制片后台入口</h2>
          <p className="mt-3 text-sm leading-6 text-[#aaa599]">本地演示账号：admin@studio.com / admin123</p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
