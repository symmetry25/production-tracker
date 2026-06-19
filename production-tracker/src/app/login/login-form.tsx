"use client";

import { useActionState } from "react";

import { googleLoginAction, loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm({ googleEnabled = false }: { googleEnabled?: boolean }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="mt-8 space-y-5">
      {googleEnabled ? (
        <>
          <form action={googleLoginAction}>
            <button
              type="submit"
              className="h-12 w-full border border-[#3f3c33] bg-[#11110f] text-sm font-semibold text-[#f4f1e8] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
            >
              使用 Google 登录
            </button>
          </form>
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-[#6e6a60]">
            <span className="h-px flex-1 bg-[#34322b]" />
            <span>or credentials</span>
            <span className="h-px flex-1 bg-[#34322b]" />
          </div>
        </>
      ) : null}

      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue="admin@studio.com"
            className="h-12 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm text-[#f4f1e8] outline-none transition focus:border-[#d8b46a]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            defaultValue="admin123"
            className="h-12 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm text-[#f4f1e8] outline-none transition focus:border-[#d8b46a]"
          />
        </div>

        {state.error ? (
          <p className="border border-[#6f2f2f] bg-[#2b1717] px-3 py-2 text-sm leading-6 text-[#ffb5a8]">{state.error}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="h-12 w-full bg-[#d8b46a] text-sm font-semibold text-[#171713] transition hover:bg-[#e5c67f] disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? "正在进入..." : "进入生产后台"}
        </button>
      </form>
    </div>
  );
}
