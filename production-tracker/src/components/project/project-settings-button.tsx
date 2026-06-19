"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { updateProjectSettingsAction, type UpdateProjectState } from "@/app/app/projects/[projectId]/overview/actions";
import type { DashboardStats } from "@/lib/dashboard-data";

const initialState: UpdateProjectState = {};

export function ProjectSettingsButton({ project }: { project: DashboardStats["project"] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailName, setThumbnailName] = useState("");
  const [state, formAction, pending] = useActionState(updateProjectSettingsAction.bind(null, project.id), initialState);
  const previewUrl = thumbnailPreview ?? project.thumbnailUrl;

  useEffect(() => {
    if (!state.success) return;
    router.refresh();
  }, [router, state.success]);

  useEffect(() => {
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [thumbnailPreview]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-10 border border-[#3f3c33] px-3 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
      >
        Project Settings
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/62">
          <aside className="flex h-full w-full max-w-2xl flex-col border-l border-[#3d392f] bg-[#181713] shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
            <div className="flex items-start justify-between border-b border-[#34322b] px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Project settings</p>
                <h2 className="mt-1 truncate text-2xl font-semibold text-[#f4f1e8]">{project.name}</h2>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-[#8f8a7e]">{project.code}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-[#aaa599] hover:text-[#f4f1e8]">
                关闭
              </button>
            </div>

            <form action={formAction} className="min-h-0 flex-1 overflow-auto p-5">
              <div className="grid gap-5">
                <label className="grid gap-4 border border-[#34322b] bg-[#11110f] p-3 sm:grid-cols-[220px_minmax(0,1fr)]">
                  <span className="relative block aspect-video overflow-hidden border border-[#34322b] bg-[linear-gradient(135deg,#2c2a23,#11110f_62%)]">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- Project covers may be local uploads or remote URLs.
                      <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                    ) : null}
                    <span className="absolute inset-x-0 bottom-0 bg-black/55 px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-[#c9c3b5]">
                      Project cover
                    </span>
                  </span>
                  <span className="flex min-w-0 flex-col justify-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">替换封面</span>
                    <input type="hidden" name="thumbnailUrl" value={project.thumbnailUrl ?? ""} />
                    <input
                      name="thumbnail"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
                        setThumbnailName(file?.name ?? "");
                        setThumbnailPreview(file ? URL.createObjectURL(file) : null);
                      }}
                      className="block w-full text-xs text-[#aaa599] file:mr-3 file:h-9 file:border-0 file:bg-[#2b2924] file:px-3 file:text-xs file:font-semibold file:text-[#f4f1e8] hover:file:bg-[#343027]"
                    />
                    <span className="truncate text-xs text-[#7f7a70]">{thumbnailName || "留空则继续使用当前封面。"}</span>
                  </span>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">项目名称</span>
                    <input name="name" required defaultValue={project.name} className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">项目代号</span>
                    <input name="code" required defaultValue={project.code} className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm uppercase outline-none focus:border-[#d8b46a]" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">开始日期</span>
                    <input name="startDate" type="date" required defaultValue={project.startDate.slice(0, 10)} className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">截止日期</span>
                    <input name="dueDate" type="date" required defaultValue={project.dueDate.slice(0, 10)} className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">里程碑</span>
                    <input name="milestone" defaultValue={project.milestone ?? ""} className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">里程碑日期</span>
                    <input name="milestoneDate" type="date" defaultValue={project.milestoneDate?.slice(0, 10) ?? ""} className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]" />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">描述</span>
                  <textarea name="description" rows={5} defaultValue={project.description ?? ""} className="w-full resize-none border border-[#34322b] bg-[#11110f] px-3 py-3 text-sm outline-none focus:border-[#d8b46a]" />
                </label>

                {state.error ? <p className="border border-[#6f2f2f] bg-[#2b1717] px-3 py-2 text-sm text-[#ffb5a8]">{state.error}</p> : null}
                {state.success ? <p className="border border-[#2f5f49] bg-[#14241d] px-3 py-2 text-sm text-[#83d6ae]">{state.success}</p> : null}
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-[#34322b] pt-4">
                <button type="button" onClick={() => setOpen(false)} className="h-10 border border-[#3f3c33] px-4 text-sm text-[#c9c3b5]">
                  取消
                </button>
                <button type="submit" disabled={pending} className="h-10 bg-[#d8b46a] px-5 text-sm font-semibold text-[#171713] disabled:opacity-70">
                  {pending ? "保存中..." : "保存设置"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </>
  );
}
