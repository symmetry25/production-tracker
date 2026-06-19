import Link from "next/link";

import { getCurrentProjectId, getProjectIdFromSearchParams } from "@/lib/current-project";
import { getInboxItems } from "@/lib/global-pages-data";

type InboxPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const resolvedSearchParams = await searchParams;
  const projectId = await getCurrentProjectId(getProjectIdFromSearchParams(resolvedSearchParams));
  const items = projectId ? await getInboxItems(projectId) : [];

  return (
    <>
      <PageHeader eyebrow="Inbox" title="收件箱 / 通知" description="集中查看待审版本、预算风险、资源规划和制片动作提醒。" />
      {projectId ? (
        <section className="space-y-3">
          {items.map((item) => (
            <Link key={item.id} href={item.href} className={["block border p-4 transition hover:border-[#d8b46a]", toneClass(item.tone)].join(" ")}>
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-semibold">{item.title}</h2>
                <span className="text-xs uppercase tracking-[0.14em] opacity-70">{item.tone}</span>
              </div>
              <p className="mt-2 text-sm leading-6 opacity-80">{item.detail}</p>
            </Link>
          ))}
        </section>
      ) : (
        <div className="grid min-h-80 place-items-center border border-dashed border-[#3f3c33] bg-[#181713] p-10 text-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b46a]">No active project</p>
            <h2 className="mt-3 text-2xl font-semibold">还没有项目通知</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#aaa599]">项目创建后，待审版本、预算风险和资源规划提醒会出现在这里。</p>
          </div>
        </div>
      )}
    </>
  );
}

function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#aaa599]">{description}</p>
    </div>
  );
}

function toneClass(tone: "info" | "watch" | "over") {
  if (tone === "over") return "border-[#743434] bg-[#281818] text-[#ffb0a4]";
  if (tone === "watch") return "border-[#6f5631] bg-[#211b12] text-[#e8c678]";
  return "border-[#34322b] bg-[#181713] text-[#f4f1e8]";
}
