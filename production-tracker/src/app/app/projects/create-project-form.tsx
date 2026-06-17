"use client";

import { useActionState, useState } from "react";

import { createProjectAction, type CreateProjectState } from "./actions";

const initialState: CreateProjectState = {};

export function CreateProjectForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createProjectAction, initialState);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-10 bg-[#d8b46a] px-4 text-sm font-semibold text-[#171713] transition hover:bg-[#e5c67f]"
      >
        新建项目
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/62 px-6">
          <div className="w-full max-w-2xl border border-[#3d392f] bg-[#181713] shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between border-b border-[#34322b] px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Project setup</p>
                <h2 className="mt-1 text-xl font-semibold text-[#f4f1e8]">创建新项目</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-[#aaa599] hover:text-[#f4f1e8]">
                关闭
              </button>
            </div>

            <form action={formAction} className="grid grid-cols-2 gap-4 p-5">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">项目名称</span>
                <input name="name" required className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]" />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">项目代号</span>
                <input name="code" required className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm uppercase outline-none focus:border-[#d8b46a]" />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">开始日期</span>
                <input name="startDate" type="date" required className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]" />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">截止日期</span>
                <input name="dueDate" type="date" required className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]" />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">里程碑</span>
                <input name="milestone" className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]" />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">里程碑日期</span>
                <input name="milestoneDate" type="date" className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]" />
              </label>
              <label className="col-span-2 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">描述</span>
                <textarea name="description" rows={3} className="w-full resize-none border border-[#34322b] bg-[#11110f] px-3 py-3 text-sm outline-none focus:border-[#d8b46a]" />
              </label>

              {state.error ? (
                <p className="col-span-2 border border-[#6f2f2f] bg-[#2b1717] px-3 py-2 text-sm text-[#ffb5a8]">{state.error}</p>
              ) : null}

              <div className="col-span-2 flex justify-end gap-2 border-t border-[#34322b] pt-4">
                <button type="button" onClick={() => setOpen(false)} className="h-10 border border-[#3f3c33] px-4 text-sm text-[#c9c3b5]">
                  取消
                </button>
                <button type="submit" disabled={pending} className="h-10 bg-[#d8b46a] px-5 text-sm font-semibold text-[#171713] disabled:opacity-70">
                  {pending ? "保存中..." : "保存项目"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
