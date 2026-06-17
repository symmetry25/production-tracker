import { ReviewWorkspace } from "@/components/review/review-workspace";
import { UploadVersionForm } from "@/components/review/upload-version-form";
import { getProjectReviewTaskOptions, getProjectReviewVersions, type ReviewTaskOption, type ReviewVersionItem } from "@/lib/review-data";

export default async function ProjectMediaPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  let versions: ReviewVersionItem[] = [];
  let tasks: ReviewTaskOption[] = [];
  let error: string | null = null;

  try {
    [versions, tasks] = await Promise.all([getProjectReviewVersions(projectId), getProjectReviewTaskOptions(projectId)]);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "审阅数据暂时无法读取。";
  }

  return (
    <>
      <div className="mb-4 flex items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">Media</p>
          <h1 className="mt-2 text-3xl font-semibold">版本审阅</h1>
          <p className="mt-2 text-sm text-[#aaa599]">上传任务版本，集中播放视频/图片，记录导演、监制和供应商反馈。</p>
        </div>
        <div className="flex h-10 items-center gap-2 text-xs text-[#aaa599]">
          <UploadVersionForm tasks={tasks} />
          <button className="h-10 border border-[#3f3c33] px-3">Compare</button>
          <button className="h-10 border border-[#3f3c33] px-3">Filter</button>
        </div>
      </div>

      {error ? (
        <div className="border border-[#6f5631] bg-[#211b12] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">Database pending</p>
          <h2 className="mt-3 text-xl font-semibold">版本审阅等待数据库</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#c9c3b5]">{error}</p>
        </div>
      ) : (
        <ReviewWorkspace versions={versions} />
      )}
    </>
  );
}
