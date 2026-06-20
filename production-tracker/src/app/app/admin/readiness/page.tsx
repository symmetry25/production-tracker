import { buildProductionReadinessReport, type ProductionReadinessCheck, type ReadinessStatus } from "@/lib/production-readiness";

export default function ProductionReadinessPage() {
  const report = buildProductionReadinessReport();
  const blockers = report.checks.filter((check) => check.status === "blocked");
  const warnings = report.checks.filter((check) => check.status === "warning");
  const ready = report.checks.filter((check) => check.status === "ready");

  return (
    <>
      <div className="mb-5 flex items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">Production readiness</p>
          <h1 className="mt-2 text-3xl font-semibold">上线前检查中心</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#aaa599]">
            把数据库、认证、域名、上传存储、AI、OAuth 和通知状态放在同一张表里，先排除会影响外部试用的阻断项。
          </p>
        </div>
        <div className={["min-w-48 border px-4 py-3 text-right", panelClass(report.status)].join(" ")}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f8a7e]">Readiness score</p>
          <p className="mt-1 font-mono text-3xl font-semibold">{report.score}%</p>
          <p className="mt-1 text-xs text-[#aaa599]">{modeLabel(report.mode)} · {statusLabel(report.status)}</p>
        </div>
      </div>

      <section className="mb-5 grid grid-cols-4 gap-3">
        <Metric label="阻断项" value={report.blockedCount} tone="blocked" />
        <Metric label="警告项" value={report.warningCount} tone="warning" />
        <Metric label="已就绪" value={report.readyCount} tone="ready" />
        <Metric label="生成时间" value={new Date(report.generatedAt).toLocaleTimeString("zh-CN", { hour12: false })} tone="neutral" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <ReadinessColumn title="必须先处理" eyebrow="Blocking" items={blockers} empty="当前没有阻断项。" />
        <ReadinessColumn title="上线前建议补齐" eyebrow="Warnings" items={warnings} empty="当前没有警告项。" />
      </section>

      <section className="mt-5 border border-[#34322b] bg-[#151410]">
        <div className="border-b border-[#2f2d27] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">Ready checks</p>
          <h2 className="mt-1 text-lg font-semibold text-[#f4f1e8]">已经可用的生产能力</h2>
        </div>
        <div className="grid gap-3 p-4 lg:grid-cols-2">
          {ready.map((check) => (
            <ReadinessItem key={check.id} check={check} compact />
          ))}
        </div>
      </section>
    </>
  );
}

function ReadinessColumn({ title, eyebrow, items, empty }: { title: string; eyebrow: string; items: ProductionReadinessCheck[]; empty: string }) {
  return (
    <section className="border border-[#34322b] bg-[#151410]">
      <div className="border-b border-[#2f2d27] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">{eyebrow}</p>
        <h2 className="mt-1 text-lg font-semibold text-[#f4f1e8]">{title}</h2>
      </div>
      <div className="grid gap-3 p-4">
        {items.length ? items.map((check) => <ReadinessItem key={check.id} check={check} />) : <p className="border border-[#2f2d27] bg-[#11110f] p-4 text-sm text-[#8f8a7e]">{empty}</p>}
      </div>
    </section>
  );
}

function ReadinessItem({ check, compact = false }: { check: ProductionReadinessCheck; compact?: boolean }) {
  return (
    <article className={["border bg-[#11110f] p-4", panelClass(check.status)].join(" ")}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">{categoryLabel(check.category)}</p>
          <h3 className="mt-1 text-sm font-semibold text-[#f4f1e8]">{check.title}</h3>
        </div>
        <span className={["border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]", badgeClass(check.status)].join(" ")}>
          {statusLabel(check.status)}
        </span>
      </div>
      <p className={["mt-3 text-sm leading-6 text-[#aaa599]", compact ? "line-clamp-2" : ""].join(" ")}>{check.detail}</p>
      {!compact ? <p className="mt-3 border-t border-[#2a2924] pt-3 text-xs leading-5 text-[#c9c3b5]">{check.action}</p> : null}
    </article>
  );
}

function Metric({ label, value, tone }: { label: string; value: number | string; tone: ReadinessStatus | "neutral" }) {
  return (
    <div className={["border bg-[#151410] px-4 py-3", tone === "neutral" ? "border-[#34322b]" : panelClass(tone)].join(" ")}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold text-[#f4f1e8]">{value}</p>
    </div>
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
  if (status === "warning") return "需补齐";
  return "就绪";
}

function modeLabel(mode: "demo" | "trial" | "production") {
  if (mode === "demo") return "演示模式";
  if (mode === "trial") return "试用准备";
  return "生产环境";
}

function categoryLabel(category: ProductionReadinessCheck["category"]) {
  const labels: Record<ProductionReadinessCheck["category"], string> = {
    data: "Data",
    security: "Security",
    files: "Files",
    ai: "AI",
    integrations: "Integrations",
    operations: "Operations",
  };
  return labels[category];
}
