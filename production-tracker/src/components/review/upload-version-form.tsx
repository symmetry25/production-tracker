"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { Dictionary } from "@/lib/i18n";
import type { ReviewTaskOption } from "@/lib/review-data";

type UploadLabels = Dictionary["pages"]["media"]["upload"];

export function UploadVersionForm({ tasks, labels }: { tasks: ReviewTaskOption[]; labels: UploadLabels }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [, startTransition] = useTransition();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const taskId = String(formData.get("taskId") ?? "");

    if (!taskId) {
      setMessage(labels.chooseTask);
      return;
    }

    formData.delete("taskId");
    setPending(true);
    setMessage(null);

    const response = await fetch(`/api/tasks/${taskId}/versions`, {
      method: "POST",
      body: formData,
    });

    setPending(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setMessage(payload?.error ?? labels.failed);
      return;
    }

    form.reset();
    setOpen(false);
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-10 bg-[#378add] px-4 text-xs font-semibold text-white transition hover:bg-[#4a9eff]"
      >
        {labels.button}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/62 px-6">
          <div className="w-full max-w-2xl border border-[#3d392f] bg-[#181713] shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between border-b border-[#34322b] px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">{labels.eyebrow}</p>
                <h2 className="mt-1 text-xl font-semibold text-[#f4f1e8]">{labels.title}</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-[#aaa599] hover:text-[#f4f1e8]">
                {labels.close}
              </button>
            </div>

            <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4 p-5">
              <label className="col-span-2 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">{labels.task}</span>
                <select name="taskId" required className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]">
                  <option value="">{labels.taskPlaceholder}</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.contextLabel} / {task.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="col-span-2 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">{labels.file}</span>
                <input
                  name="file"
                  type="file"
                  required
                  accept="video/mp4,video/quicktime,image/jpeg,image/png,image/webp"
                  className="w-full border border-[#34322b] bg-[#11110f] px-3 py-3 text-sm outline-none file:mr-4 file:border-0 file:bg-[#2b2924] file:px-3 file:py-2 file:text-[#f4f1e8] focus:border-[#d8b46a]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">{labels.frameCount}</span>
                <input
                  name="frameCount"
                  type="number"
                  min={0}
                  className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">{labels.fps}</span>
                <input
                  name="fps"
                  type="number"
                  min={1}
                  max={240}
                  step="0.01"
                  defaultValue={24}
                  className="h-11 w-full border border-[#34322b] bg-[#11110f] px-3 text-sm outline-none focus:border-[#d8b46a]"
                />
              </label>
              <label className="col-span-2 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a09a8d]">{labels.description}</span>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full resize-none border border-[#34322b] bg-[#11110f] px-3 py-3 text-sm outline-none focus:border-[#d8b46a]"
                />
              </label>

              {message ? <p className="col-span-2 border border-[#6f2f2f] bg-[#2b1717] px-3 py-2 text-sm text-[#ffb5a8]">{message}</p> : null}

              <div className="col-span-2 flex justify-end gap-2 border-t border-[#34322b] pt-4">
                <button type="button" onClick={() => setOpen(false)} className="h-10 border border-[#3f3c33] px-4 text-sm text-[#c9c3b5]">
                  {labels.cancel}
                </button>
                <button type="submit" disabled={pending} className="h-10 bg-[#378add] px-5 text-sm font-semibold text-white disabled:opacity-70">
                  {pending ? labels.submitting : labels.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
