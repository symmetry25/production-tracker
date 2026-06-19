"use client";

import * as ContextMenu from "@radix-ui/react-context-menu";
import { VersionStatus } from "@/generated/prisma/enums";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import type { Dictionary } from "@/lib/i18n";
import { formatUtcDate, formatUtcDateTime } from "@/lib/date-format";
import type { ReviewVersionItem } from "@/lib/review-data";

const VERSION_STATUS_COLORS: Record<VersionStatus, { bg: string; text: string; dot: string }> = {
  PENDING_REVIEW: { bg: "#2d2300", text: "#ef9f27", dot: "#ef9f27" },
  VIEWED: { bg: "#1a2233", text: "#4a9eff", dot: "#4a9eff" },
  APPROVED: { bg: "#153728", text: "#1d9e75", dot: "#1d9e75" },
  CHANGES_REQUESTED: { bg: "#3a1717", text: "#e24b4a", dot: "#e24b4a" },
};

type ReviewMode = "player" | "compare";
type ReviewWorkspaceLabels = Dictionary["pages"]["media"]["workspace"];

export function ReviewWorkspace({
  versions,
  initialVersionId,
  labels,
}: {
  versions: ReviewVersionItem[];
  initialVersionId?: string;
  labels: ReviewWorkspaceLabels;
}) {
  const router = useRouter();
  const initialSelectedId = useMemo(() => getInitialSelectedId(versions, initialVersionId), [initialVersionId, versions]);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [playlistIds, setPlaylistIds] = useState<string[]>(() => buildDefaultPlaylist(versions, initialSelectedId));
  const [viewMode, setViewMode] = useState<ReviewMode>("player");
  const [compareIds, setCompareIds] = useState<[string | null, string | null]>(() => buildDefaultCompareIds(versions, initialSelectedId));
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const selected = useMemo(() => versions.find((version) => version.id === selectedId) ?? versions[0] ?? null, [selectedId, versions]);
  const playlistVersions = useMemo(() => getPlaylistVersions(versions, playlistIds), [playlistIds, versions]);
  const compareVersions = useMemo(() => getCompareVersions(versions, compareIds, selected?.id ?? null), [compareIds, selected, versions]);
  const selectedQueueIndex = selected ? playlistVersions.findIndex((version) => version.id === selected.id) : -1;
  const canPrevious = selectedQueueIndex > 0;
  const canNext = selectedQueueIndex >= 0 && selectedQueueIndex < playlistVersions.length - 1;

  function addToPlaylist(versionId: string) {
    setPlaylistIds((current) => (current.includes(versionId) ? current : [...current, versionId]));
  }

  function removeFromPlaylist(versionId: string) {
    setPlaylistIds((current) => current.filter((id) => id !== versionId));
  }

  function movePlaylistItem(versionId: string, direction: -1 | 1) {
    setPlaylistIds((current) => {
      const index = current.indexOf(versionId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;

      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function selectPlaylistOffset(offset: -1 | 1) {
    if (selectedQueueIndex < 0) {
      setSelectedId(playlistVersions[0]?.id ?? selected?.id ?? null);
      return;
    }

    const nextId = playlistVersions[selectedQueueIndex + offset]?.id;
    if (nextId) {
      setSelectedId(nextId);
    }
  }

  function startCompare(primaryId: string, secondaryId?: string | null) {
    const nextIds = buildCompareIdsFromSelection(versions, primaryId, secondaryId);
    setCompareIds(nextIds);
    setSelectedId(primaryId);
    setViewMode("compare");
  }

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
      setMessage(labels.messages.updateStatusFailed);
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
      setMessage(labels.messages.deleteVersionFailed);
      return;
    }

    setPlaylistIds((current) => current.filter((id) => id !== versionId));
    setCompareIds(([leftId, rightId]) => [leftId === versionId ? null : leftId, rightId === versionId ? null : rightId]);

    if (selectedId === versionId) {
      setSelectedId(playlistVersions.find((version) => version.id !== versionId)?.id ?? versions.find((version) => version.id !== versionId)?.id ?? null);
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
      setMessage(labels.messages.addNoteFailed);
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
      setMessage(labels.messages.deleteNoteFailed);
      return;
    }

    startTransition(() => router.refresh());
  }

  if (versions.length === 0 || !selected) {
    return (
      <div className="grid min-h-[560px] place-items-center border border-dashed border-[#3f3c33] bg-[#181713] p-10 text-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">{labels.empty.eyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold">{labels.empty.title}</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#aaa599]">{labels.empty.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {message ? <div className="mb-3 border border-[#3f3c33] bg-[#181713] px-3 py-2 text-sm text-[#d8b46a]">{message}</div> : null}
      <ScreeningQueue
        versions={playlistVersions}
        allVersions={versions}
        selectedId={selected.id}
        onSelect={setSelectedId}
        onAddCurrent={() => addToPlaylist(selected.id)}
        onAddAll={() => setPlaylistIds(versions.map((version) => version.id))}
        onBuildNeedsReview={() => setPlaylistIds(buildNeedsReviewPlaylist(versions, selected.id))}
        onClear={() => setPlaylistIds([])}
        onRemove={removeFromPlaylist}
        onMove={movePlaylistItem}
        labels={labels}
      />
      <div className="grid min-h-[640px] border border-[#34322b] bg-[#181713] xl:grid-cols-[240px_minmax(0,1fr)] 2xl:grid-cols-[260px_minmax(360px,1fr)_300px]">
        <VersionList
          versions={versions}
          selectedId={selected.id}
          playlistIds={playlistIds}
          pendingId={pendingId}
          onSelect={setSelectedId}
          onStatus={updateStatus}
          onDelete={deleteVersion}
          onAddToPlaylist={addToPlaylist}
          onRemoveFromPlaylist={removeFromPlaylist}
          onCompare={(versionId) => startCompare(versionId)}
          labels={labels}
        />
        {viewMode === "compare" ? (
          <VersionCompare
            versions={versions}
            left={compareVersions.left}
            right={compareVersions.right}
            onSelectLeft={(id) => {
              setCompareIds((current) => [id, current[1]]);
              setSelectedId(id);
            }}
            onSelectRight={(id) => setCompareIds(([leftId]) => [leftId, id])}
            onExit={() => setViewMode("player")}
            labels={labels}
          />
        ) : (
          <VersionPlayer
            version={selected}
            queueIndex={selectedQueueIndex}
            queueSize={playlistVersions.length}
            isQueued={selectedQueueIndex >= 0}
            canPrevious={canPrevious}
            canNext={canNext}
            onStatus={updateStatus}
            onPrevious={() => selectPlaylistOffset(-1)}
            onNext={() => selectPlaylistOffset(1)}
            onCompare={() => startCompare(selected.id, playlistVersions[selectedQueueIndex + 1]?.id)}
            onAddToQueue={() => addToPlaylist(selected.id)}
            onRemoveFromQueue={() => removeFromPlaylist(selected.id)}
            labels={labels}
          />
        )}
        <NotesStream version={selected} pending={pendingId === `note:${selected.id}`} onCreate={addNote} onDelete={deleteNote} labels={labels} />
      </div>
      <VersionFilmstrip versions={versions} selectedId={selected.id} onSelect={setSelectedId} labels={labels} />
    </div>
  );
}

function VersionList({
  versions,
  selectedId,
  playlistIds,
  pendingId,
  onSelect,
  onStatus,
  onDelete,
  onAddToPlaylist,
  onRemoveFromPlaylist,
  onCompare,
  labels,
}: {
  versions: ReviewVersionItem[];
  selectedId: string;
  playlistIds: string[];
  pendingId: string | null;
  onSelect: (id: string) => void;
  onStatus: (id: string, status: VersionStatus) => void;
  onDelete: (id: string) => void;
  onAddToPlaylist: (id: string) => void;
  onRemoveFromPlaylist: (id: string) => void;
  onCompare: (id: string) => void;
  labels: ReviewWorkspaceLabels;
}) {
  return (
    <aside className="order-2 border-t border-[#34322b] xl:order-none xl:row-span-2 xl:border-r xl:border-t-0 2xl:row-span-1">
      <div className="border-b border-[#34322b] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d8b46a]">{labels.versionList.eyebrow}</p>
        <p className="mt-1 text-xs text-[#8f8a7e]">{formatTemplate(labels.versionList.count, { count: versions.length })}</p>
      </div>
      <div className="max-h-[590px] overflow-auto">
        {versions.map((version) => {
          const isQueued = playlistIds.includes(version.id);

          return (
          <ContextMenu.Root key={version.id}>
            <ContextMenu.Trigger asChild>
              <button
                id={version.id}
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
                  <StatusPill status={version.status} labels={labels} />
                </div>
                <p className="mt-2 truncate text-xs text-[#c9c3b5]">{version.task.contextLabel} / {version.task.name}</p>
                <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-[#7f7a70]">
                  <span>v{String(version.number).padStart(3, "0")} · {version.uploadedBy.name}</span>
                  {isQueued ? <span className="rounded-sm bg-[#253320] px-1.5 py-0.5 text-[#9fce7d]">{labels.versionList.queued}</span> : null}
                </div>
              </button>
            </ContextMenu.Trigger>
            <VersionContextMenu
              version={version}
              isQueued={isQueued}
              onStatus={onStatus}
              onDelete={onDelete}
              onAddToPlaylist={onAddToPlaylist}
              onRemoveFromPlaylist={onRemoveFromPlaylist}
              onCompare={onCompare}
              labels={labels}
            />
          </ContextMenu.Root>
          );
        })}
      </div>
    </aside>
  );
}

function VersionPlayer({
  version,
  queueIndex,
  queueSize,
  isQueued,
  canPrevious,
  canNext,
  onStatus,
  onPrevious,
  onNext,
  onCompare,
  onAddToQueue,
  onRemoveFromQueue,
  labels,
}: {
  version: ReviewVersionItem;
  queueIndex: number;
  queueSize: number;
  isQueued: boolean;
  canPrevious: boolean;
  canNext: boolean;
  onStatus: (id: string, status: VersionStatus) => void;
  onPrevious: () => void;
  onNext: () => void;
  onCompare: () => void;
  onAddToQueue: () => void;
  onRemoveFromQueue: () => void;
  labels: ReviewWorkspaceLabels;
}) {
  return (
    <section className="order-1 flex min-w-0 flex-col bg-[#11110f] xl:order-none">
      <div className="flex flex-col gap-3 border-b border-[#34322b] bg-[#181713] px-5 py-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">{labels.player.eyebrow}</p>
          <h2 className="mt-1 truncate text-xl font-semibold text-[#f4f1e8]">{version.name}</h2>
          <p className="mt-1 text-xs text-[#8f8a7e]">
            {version.task.contextLabel} / {version.task.name} · {version.fileType}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!canPrevious}
            onClick={onPrevious}
            className="h-9 border border-[#34322b] px-3 text-xs text-[#aaa599] transition hover:border-[#d8b46a] hover:text-[#e8c678] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {labels.player.previous}
          </button>
          <button
            type="button"
            disabled={!canNext}
            onClick={onNext}
            className="h-9 border border-[#34322b] px-3 text-xs text-[#aaa599] transition hover:border-[#d8b46a] hover:text-[#e8c678] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {labels.player.next}
          </button>
          <button
            type="button"
            onClick={onCompare}
            className="h-9 border border-[#34322b] px-3 text-xs text-[#aaa599] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
          >
            {labels.player.compare}
          </button>
          <button
            type="button"
            onClick={isQueued ? onRemoveFromQueue : onAddToQueue}
            className="h-9 border border-[#3f3c33] px-3 text-xs text-[#d8b46a] transition hover:border-[#e8c678] hover:text-[#f2d996]"
          >
            {isQueued ? labels.player.removeQueue : labels.player.addQueue}
          </button>
          <select
            value={version.status}
            onChange={(event) => onStatus(version.id, event.target.value as VersionStatus)}
            className="h-9 border border-[#34322b] bg-[#11110f] px-3 text-xs outline-none focus:border-[#d8b46a]"
          >
            {Object.values(VersionStatus).map((status) => (
              <option key={status} value={status}>
                {labels.status[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid flex-1 place-items-center p-5">
        <div className="grid aspect-video w-full max-w-5xl place-items-center overflow-hidden border border-[#34322b] bg-black">
          <MediaPreview version={version} labels={labels} />
        </div>
      </div>

      <div className="grid grid-cols-5 border-t border-[#34322b] bg-[#181713] text-xs">
        <MetadataCell label={labels.player.metadata.queue} value={queueIndex >= 0 ? `${queueIndex + 1}/${queueSize}` : labels.player.metadata.notQueued} />
        <MetadataCell label={labels.player.metadata.frames} value={formatInteger(version.frameCount)} />
        <MetadataCell label={labels.player.metadata.fps} value={version.fps?.toString() ?? "--"} />
        <MetadataCell label={labels.player.metadata.uploaded} value={formatUtcDate(version.createdAt)} />
        <MetadataCell label={labels.player.metadata.owner} value={version.uploadedBy.name} />
      </div>
    </section>
  );
}

function VersionCompare({
  versions,
  left,
  right,
  onSelectLeft,
  onSelectRight,
  onExit,
  labels,
}: {
  versions: ReviewVersionItem[];
  left: ReviewVersionItem | null;
  right: ReviewVersionItem | null;
  onSelectLeft: (id: string) => void;
  onSelectRight: (id: string) => void;
  onExit: () => void;
  labels: ReviewWorkspaceLabels;
}) {
  return (
    <section className="order-1 flex min-w-0 flex-col bg-[#11110f] xl:order-none">
      <div className="flex flex-col gap-3 border-b border-[#34322b] bg-[#181713] px-5 py-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">{labels.compare.eyebrow}</p>
          <h2 className="mt-1 truncate text-xl font-semibold text-[#f4f1e8]">{labels.compare.title}</h2>
          <p className="mt-1 text-xs text-[#8f8a7e]">{labels.compare.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CompareSelect label="A" value={left?.id ?? ""} versions={versions} onChange={onSelectLeft} />
          <CompareSelect label="B" value={right?.id ?? ""} versions={versions} onChange={onSelectRight} />
          <button
            type="button"
            onClick={onExit}
            className="h-9 border border-[#34322b] px-3 text-xs text-[#aaa599] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
          >
            {labels.compare.back}
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-5 xl:grid-cols-2">
        <ComparePane label="A" version={left} labels={labels} />
        <ComparePane label="B" version={right} labels={labels} />
      </div>

      <div className="grid border-t border-[#34322b] bg-[#181713] text-xs md:grid-cols-4">
        <MetadataCell label={labels.compare.metadata.statusA} value={left ? labels.status[left.status] : "--"} />
        <MetadataCell label={labels.compare.metadata.statusB} value={right ? labels.status[right.status] : "--"} />
        <MetadataCell label={labels.compare.metadata.framesDelta} value={formatFrameDelta(left, right)} />
        <MetadataCell label={labels.compare.metadata.context} value={left?.task.contextLabel ?? right?.task.contextLabel ?? "--"} />
      </div>
    </section>
  );
}

function CompareSelect({
  label,
  value,
  versions,
  onChange,
}: {
  label: string;
  value: string;
  versions: ReviewVersionItem[];
  onChange: (id: string) => void;
}) {
  return (
    <label className="flex h-9 items-center border border-[#34322b] bg-[#11110f] text-xs text-[#aaa599]">
      <span className="border-r border-[#34322b] px-2 font-semibold text-[#d8b46a]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-full min-w-48 bg-transparent px-2 text-[#f4f1e8] outline-none">
        {versions.map((version) => (
          <option key={version.id} value={version.id}>
            {version.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function ComparePane({ label, version, labels }: { label: string; version: ReviewVersionItem | null; labels: ReviewWorkspaceLabels }) {
  if (!version) {
    return (
      <div className="grid min-h-[360px] place-items-center border border-dashed border-[#3f3c33] text-sm text-[#aaa599]">
        {formatTemplate(labels.compare.choosePane, { label })}
      </div>
    );
  }

  return (
    <div className="min-w-0 border border-[#34322b] bg-[#181713]">
      <div className="flex items-start justify-between gap-3 border-b border-[#34322b] px-3 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d8b46a]">{formatTemplate(labels.compare.versionLabel, { label })}</p>
          <h3 className="mt-1 truncate font-mono text-sm text-[#4a9eff]">{version.name}</h3>
          <p className="mt-1 truncate text-xs text-[#8f8a7e]">{version.task.contextLabel} / {version.task.name}</p>
        </div>
        <StatusPill status={version.status} labels={labels} />
      </div>
      <div className="grid aspect-video place-items-center bg-black">
        <MediaPreview version={version} labels={labels} />
      </div>
      <div className="grid grid-cols-3 border-t border-[#34322b] text-xs">
        <MetadataCell label={labels.compare.metadata.runtime} value={formatVersionRuntime(version)} />
        <MetadataCell label={labels.compare.metadata.frames} value={formatInteger(version.frameCount)} />
        <MetadataCell label={labels.compare.metadata.owner} value={version.uploadedBy.name} />
      </div>
      {version.description ? <p className="border-t border-[#2a2a28] px-3 py-3 text-xs leading-5 text-[#aaa599]">{version.description}</p> : null}
    </div>
  );
}

function MediaPreview({ version, labels }: { version: ReviewVersionItem; labels: ReviewWorkspaceLabels }) {
  if (version.fileType.startsWith("video/")) {
    return <video key={version.fileUrl} src={version.fileUrl} controls className="h-full w-full bg-black object-contain" />;
  }

  if (version.fileType.startsWith("image/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={version.fileUrl} alt={version.name} className="h-full w-full object-contain" />
    );
  }

  return <div className="text-sm text-[#aaa599]">{labels.player.unavailable}</div>;
}

function NotesStream({
  version,
  pending,
  onCreate,
  onDelete,
  labels,
}: {
  version: ReviewVersionItem;
  pending: boolean;
  onCreate: (version: ReviewVersionItem, content: string) => void;
  onDelete: (noteId: string) => void;
  labels: ReviewWorkspaceLabels;
}) {
  const [content, setContent] = useState("");

  return (
    <aside className="order-3 flex min-h-0 flex-col border-t border-[#34322b] xl:col-start-2 xl:border-l 2xl:col-start-auto 2xl:border-t-0">
      <div className="border-b border-[#34322b] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d8b46a]">{labels.notes.eyebrow}</p>
        <p className="mt-1 text-xs text-[#8f8a7e]">{formatTemplate(labels.notes.count, { count: version.notes.length })}</p>
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
                      {note.author.department ?? labels.notes.defaultDepartment} · {formatUtcDateTime(note.createdAt, { seconds: true })}
                    </p>
                  </div>
                  <button type="button" onClick={() => onDelete(note.id)} className="text-xs text-[#7f7a70] hover:text-[#e24b4a]">
                    {labels.notes.delete}
                  </button>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#c9c3b5]">{note.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid min-h-40 place-items-center border border-dashed border-[#3f3c33] text-sm text-[#aaa599]">{labels.notes.empty}</div>
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
          placeholder={labels.notes.placeholder}
          className="w-full resize-none border border-[#34322b] bg-[#11110f] px-3 py-3 text-sm outline-none focus:border-[#d8b46a]"
        />
        <button type="submit" disabled={pending || !content.trim()} className="mt-3 h-9 w-full bg-[#d8b46a] text-sm font-semibold text-[#171713] disabled:opacity-50">
          {labels.notes.submit}
        </button>
      </form>
    </aside>
  );
}

function ScreeningQueue({
  versions,
  allVersions,
  selectedId,
  onSelect,
  onAddCurrent,
  onAddAll,
  onBuildNeedsReview,
  onClear,
  onRemove,
  onMove,
  labels,
}: {
  versions: ReviewVersionItem[];
  allVersions: ReviewVersionItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddCurrent: () => void;
  onAddAll: () => void;
  onBuildNeedsReview: () => void;
  onClear: () => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  labels: ReviewWorkspaceLabels;
}) {
  const stats = useMemo(() => getPlaylistStats(versions), [versions]);

  return (
    <section className="mb-4 border border-[#34322b] bg-[#181713]">
      <div className="grid gap-3 p-3 lg:grid-cols-[250px_minmax(0,1fr)_260px]">
        <div className="border-r border-[#2f2d27] pr-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">{labels.queue.eyebrow}</p>
          <h2 className="mt-2 text-lg font-semibold text-[#f4f1e8]">{versions.length ? formatTemplate(labels.queue.ready, { count: versions.length }) : labels.queue.empty}</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[#aaa599]">
            <QueueMetric label={labels.queue.runtime} value={formatDuration(stats.durationSeconds)} />
            <QueueMetric label={labels.queue.frames} value={formatInteger(stats.frames)} />
            <QueueMetric label={labels.queue.review} value={String(stats.needsReview)} />
            <QueueMetric label={labels.queue.changes} value={String(stats.changes)} />
          </div>
        </div>

        <div className="min-w-0 overflow-x-auto">
          {versions.length ? (
            <div className="flex gap-2">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={[
                    "flex w-64 shrink-0 overflow-hidden border bg-[#11110f]",
                    selectedId === version.id ? "border-[#d8b46a]" : "border-[#34322b]",
                  ].join(" ")}
                >
                  <button type="button" onClick={() => onSelect(version.id)} className="min-w-0 flex-1 px-3 py-2 text-left transition hover:bg-[#20201d]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-[#7f7a70]">{String(index + 1).padStart(2, "0")}</span>
                      <span className="truncate font-mono text-xs text-[#4a9eff]">{version.name}</span>
                    </div>
                    <p className="mt-1 truncate text-[11px] text-[#c9c3b5]">{version.task.contextLabel} / {version.task.name}</p>
                    <p className="mt-1 text-[11px] text-[#7f7a70]">{formatVersionRuntime(version)} · {labels.status[version.status]}</p>
                  </button>
                  <div className="grid w-9 shrink-0 border-l border-[#2f2d27] text-[11px] text-[#8f8a7e]">
                    <button type="button" disabled={index === 0} onClick={() => onMove(version.id, -1)} className="border-b border-[#2f2d27] hover:bg-[#22201c] disabled:opacity-30">
                      ↑
                    </button>
                    <button type="button" disabled={index === versions.length - 1} onClick={() => onMove(version.id, 1)} className="border-b border-[#2f2d27] hover:bg-[#22201c] disabled:opacity-30">
                      ↓
                    </button>
                    <button type="button" onClick={() => onRemove(version.id)} className="hover:bg-[#2d1a1a] hover:text-[#e24b4a]">
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid min-h-[88px] place-items-center border border-dashed border-[#3f3c33] text-sm text-[#aaa599]">
              {labels.queue.emptyHint}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <QueueAction onClick={onBuildNeedsReview}>{labels.queue.actions.reviewNeeds}</QueueAction>
          <QueueAction onClick={onAddCurrent}>{labels.queue.actions.addCurrent}</QueueAction>
          <QueueAction onClick={onAddAll} disabled={allVersions.length === 0}>{labels.queue.actions.addAll}</QueueAction>
          <QueueAction onClick={onClear} disabled={versions.length === 0}>{labels.queue.actions.clear}</QueueAction>
        </div>
      </div>
    </section>
  );
}

function VersionFilmstrip({
  versions,
  selectedId,
  onSelect,
  labels,
}: {
  versions: ReviewVersionItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  labels: ReviewWorkspaceLabels;
}) {
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
                <span>{version.fileType.startsWith("video/") ? labels.filmstrip.video : labels.filmstrip.media}</span>
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
  isQueued,
  onStatus,
  onDelete,
  onAddToPlaylist,
  onRemoveFromPlaylist,
  onCompare,
  labels,
}: {
  version: ReviewVersionItem;
  isQueued: boolean;
  onStatus: (id: string, status: VersionStatus) => void;
  onDelete: (id: string) => void;
  onAddToPlaylist: (id: string) => void;
  onRemoveFromPlaylist: (id: string) => void;
  onCompare: (id: string) => void;
  labels: ReviewWorkspaceLabels;
}) {
  return (
    <ContextMenu.Portal>
      <ContextMenu.Content className="z-50 min-w-64 border border-[#3b382f] bg-[#181713] p-1 text-sm text-[#d8d3c7] shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <ContextMenu.Label className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">{version.name}</ContextMenu.Label>
        <MenuItem onSelect={() => onCompare(version.id)}>⊞ {labels.menu.compare}</MenuItem>
        {isQueued ? (
          <MenuItem onSelect={() => onRemoveFromPlaylist(version.id)}>{labels.menu.removeQueue}</MenuItem>
        ) : (
          <MenuItem onSelect={() => onAddToPlaylist(version.id)}>{labels.menu.addQueue}</MenuItem>
        )}
        <Separator />
        {Object.values(VersionStatus).map((status) => (
          <MenuItem key={status} onSelect={() => onStatus(version.id, status)}>
            <span className="mr-2 inline-block size-2 rounded-full" style={{ backgroundColor: VERSION_STATUS_COLORS[status].dot }} />
            {labels.status[status]}
          </MenuItem>
        ))}
        <Separator />
        <MenuItem danger onSelect={() => onDelete(version.id)}>
          {labels.menu.delete}
        </MenuItem>
      </ContextMenu.Content>
    </ContextMenu.Portal>
  );
}

function StatusPill({ status, labels }: { status: VersionStatus; labels: ReviewWorkspaceLabels }) {
  const color = VERSION_STATUS_COLORS[status];

  return (
    <span className="rounded-sm px-2 py-1 text-[10px] font-semibold" style={{ backgroundColor: color.bg, color: color.text }}>
      {labels.status[status]}
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

function QueueMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#2f2d27] bg-[#11110f] px-2 py-1.5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#69655c]">{label}</p>
      <p className="mt-1 truncate font-mono text-xs text-[#f4f1e8]">{value}</p>
    </div>
  );
}

function QueueAction({ children, onClick, disabled = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="h-9 border border-[#3f3c33] px-3 text-xs text-[#aaa599] transition hover:border-[#d8b46a] hover:text-[#e8c678] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
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

function getInitialSelectedId(versions: ReviewVersionItem[], initialVersionId?: string) {
  return versions.find((version) => version.id === initialVersionId)?.id ?? versions[0]?.id ?? null;
}

function buildDefaultPlaylist(versions: ReviewVersionItem[], selectedId: string | null) {
  const reviewIds = buildNeedsReviewPlaylist(versions, selectedId);
  return reviewIds.length ? reviewIds : selectedId ? [selectedId] : [];
}

function buildDefaultCompareIds(versions: ReviewVersionItem[], selectedId: string | null): [string | null, string | null] {
  if (!selectedId) {
    return [versions[0]?.id ?? null, versions[1]?.id ?? null];
  }

  return buildCompareIdsFromSelection(versions, selectedId);
}

function buildCompareIdsFromSelection(versions: ReviewVersionItem[], primaryId: string, secondaryId?: string | null): [string | null, string | null] {
  const primaryIndex = versions.findIndex((version) => version.id === primaryId);
  const fallbackSecondary = versions.find((version, index) => index !== primaryIndex && version.id !== primaryId)?.id ?? null;

  return [primaryId, secondaryId && secondaryId !== primaryId ? secondaryId : fallbackSecondary];
}

function buildNeedsReviewPlaylist(versions: ReviewVersionItem[], selectedId: string | null) {
  const reviewIds = versions
    .filter((version) => version.status === VersionStatus.PENDING_REVIEW || version.status === VersionStatus.CHANGES_REQUESTED)
    .map((version) => version.id);

  if (selectedId && !reviewIds.includes(selectedId)) {
    return [selectedId, ...reviewIds];
  }

  return reviewIds;
}

function getPlaylistVersions(versions: ReviewVersionItem[], ids: string[]) {
  const versionMap = new Map(versions.map((version) => [version.id, version]));

  return ids.flatMap((id) => {
    const version = versionMap.get(id);
    return version ? [version] : [];
  });
}

function getCompareVersions(versions: ReviewVersionItem[], ids: [string | null, string | null], selectedId: string | null) {
  const [leftId, rightId] = ids;
  const left = versions.find((version) => version.id === leftId) ?? versions.find((version) => version.id === selectedId) ?? versions[0] ?? null;
  const right =
    versions.find((version) => version.id === rightId && version.id !== left?.id) ??
    versions.find((version) => version.id !== left?.id) ??
    null;

  return { left, right };
}

function getPlaylistStats(versions: ReviewVersionItem[]) {
  return versions.reduce(
    (stats, version) => {
      const frames = version.frameCount ?? 0;
      const seconds = version.fps ? frames / version.fps : 0;

      return {
        frames: stats.frames + frames,
        durationSeconds: stats.durationSeconds + seconds,
        needsReview: stats.needsReview + (version.status === VersionStatus.PENDING_REVIEW ? 1 : 0),
        changes: stats.changes + (version.status === VersionStatus.CHANGES_REQUESTED ? 1 : 0),
      };
    },
    { frames: 0, durationSeconds: 0, needsReview: 0, changes: 0 },
  );
}

function formatVersionRuntime(version: ReviewVersionItem) {
  if (!version.frameCount || !version.fps) return "--";
  return formatDuration(version.frameCount / version.fps);
}

function formatFrameDelta(left: ReviewVersionItem | null, right: ReviewVersionItem | null) {
  if (!left?.frameCount || !right?.frameCount) return "--";

  const delta = right.frameCount - left.frameCount;
  if (delta === 0) return "0";

  return `${delta > 0 ? "+" : ""}${formatInteger(delta)}`;
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "--";

  const rounded = Math.round(seconds);
  const minutes = Math.floor(rounded / 60);
  const remainder = rounded % 60;

  return minutes > 0 ? `${minutes}m ${String(remainder).padStart(2, "0")}s` : `${remainder}s`;
}

function formatTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, String(value)), template);
}

function formatInteger(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "--";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}
