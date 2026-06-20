import Link from "next/link";

import { buildProductionReadinessReport, type ReadinessStatus } from "@/lib/production-readiness";
import { getCurrentProjectId } from "@/lib/current-project";
import { buildTrialHandoffPack, type TrialChecklistItem, type TrialDeploymentTrack } from "@/lib/trial-handoff";

export default async function TrialHandoffPage() {
  const readiness = buildProductionReadinessReport();
  const currentProjectId = await getCurrentProjectId().catch(() => null);
  const pack = buildTrialHandoffPack({
    report: readiness,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? process.env.NEXTAUTH_URL,
    projectId: currentProjectId,
  });

  return (
    <>
      <div className="mb-5 grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className={["border p-5", panelClass(pack.status)].join(" ")}>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">Trial handoff</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">试用交付包</h1>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-[#c9c3b5]">
                把部署状态、测试账号、测试路线和反馈问题整理成同一张交付台。准备邀请制片、监制、财务或供应商试用前，先看这里。
              </p>
            </div>
            <StatusBadge status={pack.status} />
          </div>
          <p className="mt-4 border-t border-[#2f2d27] pt-4 text-sm font-medium text-[#f4f1e8]">{pack.headline}</p>
        </div>

        <section className="border border-[#34322b] bg-[#151410] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">External trial gate</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Metric label="就绪分" value={`${pack.summary.readinessScore}%`} />
            <Metric label="模式" value={modeLabel(pack.summary.mode)} />
            <Metric label="阻断" value={pack.summary.blockedCount} tone="blocked" />
            <Metric label="警告" value={pack.summary.warningCount} tone="warning" />
          </div>
          <p className="mt-3 border border-[#2f2d27] bg-[#11110f] px-3 py-2 text-xs leading-5 text-[#aaa599]">
            {pack.summary.canInviteExternalUsers ? "可以邀请小范围测试者，建议先控制在 3-5 人。" : "当前仍不适合发给外部测试者，先处理阻断项。"}
          </p>
        </section>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="border border-[#34322b] bg-[#151410]">
          <SectionHeader eyebrow="Release tracks" title="试用发布轨道" />
          <div className="divide-y divide-[#2f2d27]">
            {pack.deploymentTracks.map((track) => (
              <DeploymentTrackRow key={track.id} track={track} />
            ))}
          </div>
        </div>

        <div className="border border-[#34322b] bg-[#151410]">
          <SectionHeader eyebrow="Tester brief" title="可发送给测试者的信息" />
          <div className="space-y-4 p-4">
            <div className="border border-[#2f2d27] bg-[#11110f] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">Trial URL</p>
              <p className="mt-2 break-all font-mono text-sm text-[#f4f1e8]">{pack.testerBrief.appUrl}</p>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">Accounts</p>
              <div className="space-y-2">
                {pack.testerBrief.demoAccounts.map((account) => (
                  <div key={account.email} className="grid grid-cols-[1fr_auto] gap-3 border border-[#2f2d27] bg-[#11110f] p-3">
                    <div>
                      <p className="font-mono text-sm text-[#f4f1e8]">{account.email}</p>
                      <p className="mt-1 text-xs text-[#aaa599]">{account.role}</p>
                      <p className="mt-2 text-xs leading-5 text-[#8f8a7e]">{account.note}</p>
                    </div>
                    <span className="font-mono text-sm text-[#e8c678]">{account.password}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 border border-[#34322b] bg-[#151410]">
        <SectionHeader eyebrow="Acceptance route" title="外部试用验收路线" />
        <div className="overflow-x-auto">
          <div className="grid min-w-[980px] grid-cols-[220px_170px_1fr_1fr_120px] border-b border-[#2f2d27] bg-[#1e1d19] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7f7a70]">
            <span>模块</span>
            <span>测试角色</span>
            <span>观察重点</span>
            <span>验收证据</span>
            <span>入口</span>
          </div>
          {pack.trialChecklist.map((item) => (
            <ChecklistRow key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <ActionList title="仍需处理" eyebrow="Blockers / Warnings" items={[...pack.blockedItems, ...pack.warningItems]} />
        <div className="border border-[#34322b] bg-[#151410]">
          <SectionHeader eyebrow="Feedback questions" title="试用反馈问题" />
          <div className="divide-y divide-[#2f2d27]">
            {pack.testerBrief.feedbackQuestions.map((question, index) => (
              <div key={question} className="grid grid-cols-[40px_1fr] gap-3 px-4 py-3">
                <span className="font-mono text-sm text-[#7f7a70]">{String(index + 1).padStart(2, "0")}</span>
                <p className="text-sm leading-6 text-[#c9c3b5]">{question}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-[#2f2d27] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">Handoff notes</p>
            <div className="mt-3 space-y-2">
              {pack.testerBrief.handoffNotes.map((note) => (
                <p key={note} className="border border-[#2f2d27] bg-[#11110f] px-3 py-2 text-xs leading-5 text-[#aaa599]">{note}</p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function DeploymentTrackRow({ track }: { track: TrialDeploymentTrack }) {
  return (
    <article className="grid gap-3 p-4 lg:grid-cols-[190px_1fr]">
      <div>
        <StatusBadge status={track.status} compact />
        <h3 className="mt-3 text-sm font-semibold text-[#f4f1e8]">{track.title}</h3>
        <p className="mt-1 text-xs text-[#8f8a7e]">{track.owner}</p>
      </div>
      <div>
        <p className="text-sm leading-6 text-[#c9c3b5]">{track.summary}</p>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {track.steps.map((step) => (
            <p key={step} className="border border-[#2f2d27] bg-[#11110f] px-3 py-2 text-xs leading-5 text-[#aaa599]">{step}</p>
          ))}
        </div>
      </div>
    </article>
  );
}

function ChecklistRow({ item }: { item: TrialChecklistItem }) {
  return (
    <div className="grid min-w-[980px] grid-cols-[220px_170px_1fr_1fr_120px] border-b border-[#2f2d27] px-4 py-3 text-sm">
      <span className="font-semibold text-[#f4f1e8]">{item.title}</span>
      <span className="text-[#e8c678]">{item.owner}</span>
      <span className="leading-6 text-[#c9c3b5]">{item.focus}</span>
      <span className="leading-6 text-[#aaa599]">{item.expectedEvidence}</span>
      <Link href={item.route} className="text-xs font-semibold text-[#d8b46a] hover:text-[#f4f1e8]">
        打开
      </Link>
    </div>
  );
}

function ActionList({ title, eyebrow, items }: { title: string; eyebrow: string; items: Array<{ id: string; title: string; status: ReadinessStatus; action: string; detail: string }> }) {
  return (
    <div className="border border-[#34322b] bg-[#151410]">
      <SectionHeader eyebrow={eyebrow} title={title} />
      <div className="divide-y divide-[#2f2d27]">
        {items.length ? items.map((item) => (
          <article key={item.id} className="grid gap-3 p-4 md:grid-cols-[130px_1fr]">
            <div>
              <StatusBadge status={item.status} compact />
              <h3 className="mt-2 text-sm font-semibold text-[#f4f1e8]">{item.title}</h3>
            </div>
            <div>
              <p className="text-sm leading-6 text-[#aaa599]">{item.detail}</p>
              <p className="mt-2 text-xs leading-5 text-[#c9c3b5]">{item.action}</p>
            </div>
          </article>
        )) : (
          <p className="p-4 text-sm text-[#8f8a7e]">当前没有阻断或警告项。</p>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="border-b border-[#2f2d27] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">{eyebrow}</p>
      <h2 className="mt-1 text-lg font-semibold text-[#f4f1e8]">{title}</h2>
    </div>
  );
}

function Metric({ label, value, tone = "neutral" }: { label: string; value: number | string; tone?: ReadinessStatus | "neutral" }) {
  return (
    <div className={["border bg-[#11110f] px-3 py-2", tone === "neutral" ? "border-[#2f2d27]" : panelClass(tone)].join(" ")}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7f7a70]">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold text-[#f4f1e8]">{value}</p>
    </div>
  );
}

function StatusBadge({ status, compact = false }: { status: ReadinessStatus; compact?: boolean }) {
  return (
    <span className={["inline-flex border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]", badgeClass(status), compact ? "" : "text-xs"].join(" ")}>
      {statusLabel(status)}
    </span>
  );
}

function panelClass(status: ReadinessStatus) {
  if (status === "blocked") return "border-[#6f2f2f] bg-[#221515]";
  if (status === "warning") return "border-[#6f5631] bg-[#211b12]";
  return "border-[#294838] bg-[#13221b]";
}

function badgeClass(status: ReadinessStatus) {
  if (status === "blocked") return "border-[#6f2f2f] bg-[#2b1717] text-[#ff9a8f]";
  if (status === "warning") return "border-[#6f5631] bg-[#211b12] text-[#e8c678]";
  return "border-[#294838] bg-[#13221b] text-[#9cccae]";
}

function statusLabel(status: ReadinessStatus) {
  if (status === "blocked") return "阻断";
  if (status === "warning") return "可小范围试用";
  return "可交付";
}

function modeLabel(mode: "demo" | "trial" | "production") {
  if (mode === "demo") return "演示";
  if (mode === "trial") return "试用";
  return "生产";
}
