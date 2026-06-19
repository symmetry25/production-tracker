import type { ReviewVersionItem } from "@/lib/review-data";
import type { Dictionary } from "@/lib/i18n";

type MediaLabels = Dictionary["pages"]["overview"]["charts"]["media"];

export function LatestVersionFilmstrip({ versions, labels }: { versions: ReviewVersionItem[]; labels: MediaLabels }) {
  if (versions.length === 0) {
    return <div className="grid min-h-44 place-items-center p-4 text-sm text-[#8f8a7e]">{labels.empty}</div>;
  }

  return (
    <div className="overflow-x-auto p-4">
      <div className="flex gap-3">
        {versions.map((version) => (
          <div key={version.id} className="w-44 shrink-0 border border-[#34322b] bg-[#11110f] p-2">
            <div className="grid aspect-video place-items-center overflow-hidden bg-black text-[11px] text-[#8f8a7e]">
              {version.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={version.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span>{version.fileType.startsWith("video/") ? labels.video : labels.media}</span>
              )}
            </div>
            <p className="mt-2 truncate font-mono text-xs text-[#4a9eff]">{version.name}</p>
            <p className="mt-1 truncate text-[11px] text-[#8f8a7e]">{version.task.contextLabel} / {version.task.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
