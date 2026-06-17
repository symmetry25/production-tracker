"use client";

import { useActionState, useState } from "react";
import { TaskStatus } from "@/generated/prisma/enums";

import { createTaskAction, type CreateTaskState } from "@/app/app/projects/[projectId]/tasks/actions";
import { STATUS_COLORS } from "@/lib/status-colors";
import type { TaskFormOptions } from "@/lib/task-data";

const initialState: CreateTaskState = {};

export function CreateTaskForm({ projectId, options }: { projectId: string; options: TaskFormOptions }) {
  const [open, setOpen] = useState(false);
  const [sourceType, setSourceType] = useState<"shot" | "asset">("shot");
  const [state, formAction, pending] = useActionState(createTaskAction.bind(null, projectId), initialState);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-10 bg-[#378add] px-4 text-xs font-semibold text-white transition hover:bg-[#4a9eff]"
      >
        Add Task
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/62 px-6">
          <div className="w-full max-w-3xl border border-[#3d392f] bg-[#181713] shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between border-b border-[#34322b] px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Task setup</p>
                <h2 className="mt-1 text-xl font-semibold text-[#f4f1e8]">创建生产任务</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-[#aaa599] hover:text-[#f4f1e8]">
                关闭
              </button>
            </div>

            <form action={formAction} className="grid grid-cols-3 gap-4 p-5">
              <label className="col-span-2 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Task Name</span>
                <input
                  name="name"
                  required
                  placeholder="ANM blocking / vendor delivery / final comp"
                  className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Status</span>
                <select name="status" className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]">
                  {Object.values(TaskStatus).map((status) => (
                    <option key={status} value={status}>
                      {STATUS_COLORS[status].label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="col-span-3 grid grid-cols-[140px_1fr] overflow-hidden border border-[#34322b]">
                <div className="grid grid-cols-2 bg-[#11110f] p-1">
                  <button
                    type="button"
                    onClick={() => setSourceType("shot")}
                    className={["h-9 text-xs font-semibold", sourceType === "shot" ? "bg-[#2b2924] text-[#f4f1e8]" : "text-[#8f8a7e]"].join(" ")}
                  >
                    Shot
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceType("asset")}
                    className={["h-9 text-xs font-semibold", sourceType === "asset" ? "bg-[#2b2924] text-[#f4f1e8]" : "text-[#8f8a7e]"].join(" ")}
                  >
                    Asset
                  </button>
                </div>
                <div className="p-1">
                  <input type="hidden" name="sourceType" value={sourceType} />
                  {sourceType === "shot" ? (
                    <select name="shotId" className="h-9 w-full border border-transparent bg-[#181713] px-3 text-sm outline-none focus:border-[#d8b46a]">
                      <option value="">选择镜头</option>
                      {options.shots.map((shot) => (
                        <option key={shot.id} value={shot.id}>
                          {shot.sequenceCode} / {shot.code}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select name="assetId" className="h-9 w-full border border-transparent bg-[#181713] px-3 text-sm outline-none focus:border-[#d8b46a]">
                      <option value="">选择资产</option>
                      {options.assets.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.type} / {asset.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Start</span>
                <input
                  name="startDate"
                  type="date"
                  className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Due</span>
                <input
                  name="dueDate"
                  type="date"
                  className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Duration</span>
                <input
                  name="duration"
                  type="number"
                  min={0}
                  placeholder="3"
                  className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Priority</span>
                <select name="priority" className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]">
                  <option value={0}>Normal</option>
                  <option value={1}>High</option>
                  <option value={2}>Critical</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Logged Days</span>
                <input
                  name="timeLogged"
                  type="number"
                  min={0}
                  step="0.5"
                  placeholder="0"
                  className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Budget</span>
                <input
                  name="estimatedCost"
                  type="number"
                  min={0}
                  placeholder="1200"
                  className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Assignee</span>
                <select name="assigneeId" className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]">
                  <option value="">未分配</option>
                  {options.users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.department ?? "General"} / {user.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Reviewer</span>
                <select name="reviewerId" className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]">
                  <option value="">无</option>
                  {options.users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.department ?? "General"} / {user.name}
                    </option>
                  ))}
                </select>
              </label>

              {state.error ? (
                <p className="col-span-3 border border-[#6f2f2f] bg-[#2b1717] px-3 py-2 text-sm text-[#ffb5a8]">{state.error}</p>
              ) : null}

              <div className="col-span-3 flex justify-end gap-2 border-t border-[#34322b] pt-4">
                <button type="button" onClick={() => setOpen(false)} className="h-10 border border-[#3f3c33] px-4 text-sm text-[#c9c3b5]">
                  取消
                </button>
                <button type="submit" disabled={pending} className="h-10 bg-[#378add] px-5 text-sm font-semibold text-white disabled:opacity-70">
                  {pending ? "保存中..." : "保存任务"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
