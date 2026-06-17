"use client";

import { useActionState, useState } from "react";
import { AssetType } from "@/generated/prisma/enums";

import { createAssetAction, type CreateAssetState } from "@/app/app/projects/[projectId]/assets/actions";
import { ASSET_TYPE_LABELS } from "@/lib/status-colors";

const initialState: CreateAssetState = {};

export function CreateAssetForm({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createAssetAction.bind(null, projectId), initialState);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-10 bg-[#378add] px-4 text-xs font-semibold text-white transition hover:bg-[#4a9eff]"
      >
        Add Asset
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/62 px-6">
          <div className="w-full max-w-2xl border border-[#3d392f] bg-[#181713] shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between border-b border-[#34322b] px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Asset setup</p>
                <h2 className="mt-1 text-xl font-semibold text-[#f4f1e8]">创建资产</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-[#aaa599] hover:text-[#f4f1e8]">
                关闭
              </button>
            </div>

            <form action={formAction} className="grid grid-cols-2 gap-4 p-5">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Asset Name</span>
                <input
                  name="name"
                  required
                  placeholder="mkali"
                  className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Type</span>
                <select name="type" className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]">
                  {Object.values(AssetType).map((type) => (
                    <option key={type} value={type}>
                      {ASSET_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="col-span-2 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">Thumbnail URL</span>
                <input
                  name="thumbnailUrl"
                  placeholder="/uploads/asset.jpg"
                  className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]"
                />
              </label>
              <label className="col-span-2 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">描述</span>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full resize-none border border-[#34322b] bg-[#11110f] px-3 py-3 text-sm outline-none focus:border-[#d8b46a]"
                />
              </label>

              {state.error ? (
                <p className="col-span-2 border border-[#6f2f2f] bg-[#2b1717] px-3 py-2 text-sm text-[#ffb5a8]">{state.error}</p>
              ) : null}

              <div className="col-span-2 flex justify-end gap-2 border-t border-[#34322b] pt-4">
                <button type="button" onClick={() => setOpen(false)} className="h-10 border border-[#3f3c33] px-4 text-sm text-[#c9c3b5]">
                  取消
                </button>
                <button type="submit" disabled={pending} className="h-10 bg-[#378add] px-5 text-sm font-semibold text-white disabled:opacity-70">
                  {pending ? "保存中..." : "保存资产"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
