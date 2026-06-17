"use client";

import * as ContextMenu from "@radix-ui/react-context-menu";
import { VersionStatus } from "@/generated/prisma/enums";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import type { ReviewVersionItem } from "@/lib/review-data";

const VERSION_STATUS_LABELS: Record<VersionStatus, string> = {
  PENDING_REVIEW: "Pending Review",
  VIEWED: "Viewed",
  APPROVED: "Approved",
  CHANGES_REQUESTED: "Changes Requested",
};

const VERSION_STATUS_COLORS: Record<VersionStatus, { bg: string; text: string; dot: string }> = {
  PENDING_REVIEW: { bg: "#2d2300", text: "#ef9f27", dot: "#ef9f27" },
  VIEWED: { bg: "#1a2233", text: "#4a9eff", dot: "#4a9eff" },
  APPROVED: { bg: "#153728", text: "#1d9e75", dot: "#1d9e75" },
  CHANGES_REQUESTED: { bg: "#3a1717", text: "#e24b4a", dot: "#e24b4a" },
};

export function ReviewWorkspace({ versions }: { versions: ReviewVersionItem[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(versions[0]?.id ?? null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const selected = useMemo(() => versions.find((version) => version.id === selectedId) ?? versions[0] ?? null, [selectedId, versions]);

  async function updateStatus(versionId: string, status: VersionStatus) {
    setPendingId(versionId);
    setMessage(null);

    const response = await fetch(`/api/versions/${versionId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("更新版本状态失败。");
      return;
    }

    startTransition(() => router.refresh());
  }

  async function deleteVersion(versionId: string) {
    setPendingId(versionId);
    setMessage(null);

    const response = await fetch(`/api/versions/${versionId}`, {
      method: "DELETE",
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("删除版本失败。");
      return;
    }

    if (selectedId === versionId) {
      setSelectedId(versions.find((version) => version.id !== versionId)?.id ?? "");
    }

    startTransition(() => router.refresh());
  }

  async function addNote(version: ReviewVersionItem, content: string) {
    setPendingId(`note:${version.id}`);
    setMessage(null);

    const response = await fetch(`/api/tasks/${version.task.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId: version.id, content }),
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("添加备注失败。");
      return;
    }

    startTransition(() => router.refresh());
  }

  async function deleteNote(noteId: string) {
    setPendingId(noteId);
    setMessage(null);

    const response = await fetch(`/api/notes/${noteId}`, {
      method: "DELETE",
    });

    setPendingId(null);

    if (!response.ok) {
      setMessage("删除备注失败。");
      return;
    }

    startTransition(() => router.refresh());
  }

  if (versions.length === 0 || !selected) {
    return (
      <div className="grid min-h-[560px] place-items-center border border-dashed border-[#3f3c33] bg-[#181713] p-10 text-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">No versions</p>
          <h2 className="mt-3 text-2xl font-semibold">还没有审阅版本</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#aaa599]">上传 mp4、mov 或图片后，版本会出现在这里，供监制和导演做备注、审批。</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {message ? <div className="mb-3 border border-[#3f3c33] bg-[#181713] px-3 py-2 text-sm text-[#d8b46a]">{message}</div> : null}
      <div className="grid min-h-[640px] grid-cols-[280px_minmax(420px,1fr)_320px] overflow-hidden border border-[#34322b] bg-[#181713]">
        <VersionList
          versions={versions}
          selectedId={selected.id}
          pendingId={pendingId}
          onSelect={setSelectedId}
          onStatus={updateStatus}
          onDelete={deleteVersion}
        />
        <VersionPlayer version={selected} onStatus={updateStatus} />
        <NotesStream version={selected} pending={pendingId === `note:${selected.id}`} onCreate={addNote} onDelete={deleteNote} />
      </div>
      <VersionFilmstrip versions={versions} selectedId={selected.id} onSelect={setSelectedId} />
    </div>
  );
}

function VersionList({
  versions,
  selectedId,
  pendingId,
  onSelect,
  onStatus,
  onDelete,
}: {
  versions: ReviewVersionItem[];
  selectedId: string;
  pendingId: string | null;
  onSelect: (id: string) => void;
  onStatus: (id: string, status: VersionStatus) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <aside className="border-r border-[#34322b]">
      <div className="border-b border-[#34322b] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d8b46a]">Version List</p>
        <p className="mt-1 text-xs text-[#8f8a7e]">{versions.length} review items</p>
      </div>
      <div className="max-h-[590px] overflow-auto">
        {versions.map((version) => (
          <ContextMenu.Root key={version.id}>
            <ContextMenu.Trigger asChild>
              <button
                type="button"
                onClick={() => onSelect(version.id)}
                disabled={pendingId === version.id}
                className={[
                  "block w-full border-b border-[#2a2a28] px-4 py-3 text-left transition hover:bg-[#252523]",
                  selectedId === version.id ? "bg-[#22201c]" : "",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-xs text-[#4a9eff]">{version.name}</span>
                  <StatusPill status={version.status} />
                </div>
                <p className="mt-2 truncate text-xs text-[#c9c3b5]">{version.task.contextLabel} / {version.task.name}</p>
                <p className="mt-1 text-[11px] text-[#7f7a70]">v{String(version.number).padStart(3, "0")} · {version.uploadedBy.name}</p>
              </button>
            </ContextMenu.Trigger>
            <VersionContextMenu version={version} onStatus={onStatus} onDelete={onDelete} />
          </ContextMenu.Root>
        ))}
      </div>
    </aside>
  );
}

function VersionPlayer({ version, onStatus }: { version: ReviewVersionItem; onStatus: (id: string, status: VersionStatus) => void }) {
  return (
    <section className="flex min-w-0 flex-col bg-[#11110f]">
      <div className="flex items-start justify-between gap-4 border-b border-[#34322b] bg-[#181713] px-5 py-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">Review Player</p>
          <h2 className="mt-1 truncate text-xl font-semibold text-[#f4f1e8]">{version.name}</h2>
          <p className="mt-1 text-xs text-[#8f8a7e]">
            {version.task.contextLabel} / {version.task.name} · {version.fileType}
          </p>
        </div>
        <select
          value={version.status}
          onChange={(event) => onStatus(version.id, event.target.value as VersionStatus)}
          className="h-9 border border-[#34322b] bg-[#11110f] px-3 text-xs outline-none focus:border-[#d8b46a]"
        >
          {Object.values(VersionStatus).map((status) => (
            <option key={status} value={status}>
              {VERSION_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid flex-1 place-items-center p-5">
        <div className="grid aspect-video w-full max-w-5xl place-items-center overflow-hidden border border-[#34322b] bg-black">
          {version.fileType.startsWith("video/") ? (
            <video key={version.fileUrl} src={version.fileUrl} controls className="h-full w-full bg-black object-contain" />
          ) : version.fileType.startsWith("image/") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={version.fileUrl} alt={version.name} className="h-full w-full object-contain" />
          ) : (
            <div className="text-sm text-[#aaa599]">无法预览此文件类型</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 border-t border-[#34322b] bg-[#181713] text-xs">
        <MetadataCell label="Frames" value={version.frameCount?.toLocaleString() ?? "--"} />
        <MetadataCell label="FPS" value={version.fps?.toString() ?? "--"} />
        <MetadataCell label="Uploaded" value={new Date(version.createdAt).toLocaleDateString()} />
        <MetadataCell label="Owner" value={version.uploadedBy.name} />
      </div>
    </section>
  );
}

function NotesStream({
  version,
  pending,
  onCreate,
  onDelete,
}: {
  version: ReviewVersionItem;
  pending: boolean;
  onCreate: (version: ReviewVersionItem, content: string) => void;
  onDelete: (noteId: string) => void;
}) {
  const [content, setContent] = useState("");

  return (
    <aside className="flex min-h-0 flex-col border-l border-[#34322b]">
      <div className="border-b border-[#34322b] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d8b46a]">Notes Stream</p>
        <p className="mt-1 text-xs text-[#8f8a7e]">{version.notes.length} notes on selected version</p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {version.notes.length ? (
          <div className="space-y-3">
            {version.notes.map((note) => (
              <div key={note.id} className="border border-[#34322b] bg-[#11110f] p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-[#f4f1e8]">{note.author.name}</p>
                    <p className="text-[11px] text-[#7f7a70]">
                      {note.author.department ?? "Production"} · {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button type="button" onClick={() => onDelete(note.id)} className="text-xs text-[#7f7a70] hover:text-[#e24b4a]">
                    Delete
                  </button>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#c9c3b5]">{note.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid min-h-40 place-items-center border border-dashed border-[#3f3c33] text-sm text-[#aaa599]">暂无备注。</div>
        )}
      </div>

      <form
        className="border-t border-[#34322b] p-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!content.trim()) return;
          onCreate(version, content);
          setContent("");
        }}
      >
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={4}
          placeholder="给导演、监制或供应商留下审阅意见..."
          className="w-full resize-none border border-[#34322b] bg-[#11110f] px-3 py-3 text-sm outline-none focus:border-[#d8b46a]"
        />
        <button type="submit" disabled={pending || !content.trim()} className="mt-3 h-9 w-full bg-[#d8b46a] text-sm font-semibold text-[#171713] disabled:opacity-50">
          Add Note
        </button>
      </form>
    </aside>
  );
}

function VersionFilmstrip({ versions, selectedId, onSelect }: { versions: ReviewVersionItem[]; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <div className="mt-4 overflow-x-auto border border-[#34322b] bg-[#181713] p-3">
      <div className="flex gap-3">
        {versions.map((version) => (
          <button
            key={version.id}
            type="button"
            onClick={() => onSelect(version.id)}
            className={["w-44 shrink-0 border bg-[#11110f] p-2 text-left", selectedId === version.id ? "border-[#d8b46a]" : "border-[#34322b]"].join(" ")}
          >
            <div className="grid aspect-video place-items-center overflow-hidden bg-black text-[11px] text-[#8f8a7e]">
              {version.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={version.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span>{version.fileType.startsWith("video/") ? "VIDEO" : "MEDIA"}</span>
              )}
            </div>
            <p className="mt-2 truncate font-mono text-xs text-[#c9c3b5]">{version.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function VersionContextMenu({
  version,
  onStatus,
  onDelete,
}: {
  version: ReviewVersionItem;
  onStatus: (id: string, status: VersionStatus) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <ContextMenu.Portal>
      <ContextMenu.Content className="z-50 min-w-64 border border-[#3b382f] bg-[#181713] p-1 text-sm text-[#d8d3c7] shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <ContextMenu.Label className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">{version.name}</ContextMenu.Label>
        <MenuItem>⊞ Compare Versions</MenuItem>
        <MenuItem>⇩ Download Original</MenuItem>
        <MenuItem>⌕ Add Note</MenuItem>
        <Separator />
        {Object.values(VersionStatus).map((status) => (
          <MenuItem key={status} onSelect={() => onStatus(version.id, status)}>
            <span className="mr-2 inline-block size-2 rounded-full" style={{ backgroundColor: VERSION_STATUS_COLORS[status].dot }} />
            {VERSION_STATUS_LABELS[status]}
          </MenuItem>
        ))}
        <Separator />
        <MenuItem danger onSelect={() => onDelete(version.id)}>
          Delete Version
        </MenuItem>
      </ContextMenu.Content>
    </ContextMenu.Portal>
  );
}

function StatusPill({ status }: { status: VersionStatus }) {
  const color = VERSION_STATUS_COLORS[status];

  return (
    <span className="rounded-sm px-2 py-1 text-[10px] font-semibold" style={{ backgroundColor: color.bg, color: color.text }}>
      {VERSION_STATUS_LABELS[status]}
    </span>
  );
}

function MetadataCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-[#34322b] px-4 py-3 last:border-r-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">{label}</p>
      <p className="mt-1 truncate text-sm text-[#f4f1e8]">{value}</p>
    </div>
  );
}

function MenuItem({ children, danger = false, onSelect }: { children: React.ReactNode; danger?: boolean; onSelect?: () => void }) {
  return (
    <ContextMenu.Item
      onSelect={onSelect}
      className={[
        "flex cursor-default items-center px-3 py-2 outline-none hover:bg-[#252523]",
        danger ? "text-[#e24b4a] hover:bg-[#2d1a1a]" : "text-[#d8d3c7]",
      ].join(" ")}
    >
      {children}
    </ContextMenu.Item>
  );
}

function Separator() {
  return <ContextMenu.Separator className="my-1 h-px bg-[#302d26]" />;
}
