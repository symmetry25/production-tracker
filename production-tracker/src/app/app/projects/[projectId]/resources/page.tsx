import Link from "next/link";

import { getDictionary, getLocale } from "@/lib/i18n";
import { ManualLedgerPanel } from "@/components/resource/manual-ledger-panel";
import { ResourceExportButton } from "@/components/resource/resource-export-button";
import { SankeyFlow } from "@/components/resource/sankey-flow";
import {
  getResourceBudgetData,
  type AuditDocument,
  type BudgetDepartment,
  type PaymentMilestone,
  type ResourceBudgetData,
  type VendorSpend,
} from "@/lib/resource-data";
import { buildResourceAuditLedger, type ResourceLedgerEntry } from "@/lib/resource-ledger";

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const riskStyles = {
  ok: "border-[#224b39] bg-[#13251d] text-[#75d9a7]",
  watch: "border-[#6f5631] bg-[#211b12] text-[#e8c678]",
  over: "border-[#743434] bg-[#281818] text-[#ff8b7c]",
};

const vendorCategoryLabels: Record<VendorSpend["category"], string> = {
  equipment: "器材",
  vehicle: "车辆",
  hotel: "酒店住宿",
  location: "场地",
  vfx: "VFX",
  production: "制片",
};

const vendorStatusLabels: Record<VendorSpend["status"], string> = {
  quoted: "报价",
  contracted: "已签约",
  paid: "已付款",
  review: "待复核",
};

const paymentStatusLabels: Record<PaymentMilestone["status"], string> = {
  blocked: "暂缓",
  ready: "可付款",
  scheduled: "已排期",
  paid: "已支付",
};

export default async function ProjectResourcesPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const locale = await getLocale();
  const t = getDictionary(locale).pages.resources;
  const data = await getResourceBudgetData(projectId);
  const ledger = buildResourceAuditLedger(data);

  return (
    <>
      <div className="mb-5 flex items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">{t.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold">{t.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#aaa599]">{t.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/app/projects/${encodeURIComponent(projectId)}/resources/report`}
            className="grid h-10 place-items-center border border-[#3f3c33] px-3 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
          >
            制片报告
          </Link>
          <ResourceExportButton data={data} />
          <div className="grid grid-cols-3 border border-[#34322b] bg-[#181713] text-right text-xs">
            <Metric label={t.totalBudget} value={money(data.project.totalBudget)} />
            <Metric label={t.committed} value={money(data.project.committedTotal)} />
            <Metric label={t.actual} value={money(data.project.actualTotal)} />
          </div>
        </div>
      </div>

      <ControlSummary data={data} />
      <ResourceCommandDeck data={data} />
      <div className="mb-5">
        <SankeyFlow data={data} />
      </div>
      <AuditLedgerPanel ledger={ledger} />
      <ManualLedgerPanel projectId={projectId} baseEntries={ledger.entries} />

      <div className="grid grid-cols-[minmax(420px,0.88fr)_minmax(620px,1.12fr)] gap-5">
        <section className="space-y-5">
          <BudgetPanel title={t.departmentBudget} departments={data.departments} />
          <DepartmentForecastPanel data={data} />
          <RiskPanel title={t.auditSignals} data={data} />
          <DocumentPanel title={t.auditDocuments} documents={data.documents} />
        </section>

        <section className="space-y-5">
          <ApprovalQueuePanel data={data} />
          <CashWindowPanel data={data} />
          <VendorRiskMatrixPanel data={data} />
          <PaymentPanel title={t.paymentGate} payments={data.payments} />
          <VendorPanel title={t.vendorSpend} vendors={data.vendors} />
          <PeoplePanel title={t.peopleCost} data={data} />
          <FundFlowPanel title={t.fundFlow} data={data} />
        </section>
      </div>
    </>
  );
}

function ControlSummary({ data }: { data: ResourceBudgetData }) {
  const blockedPayments = data.payments.filter((payment) => payment.status === "blocked");
  const blockedTotal = blockedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const missingDocs = data.documents.reduce((sum, document) => sum + Math.max(0, document.required - document.received), 0);
  const overDepartments = data.departments.filter((department) => department.risk === "over");

  return (
    <section className="mb-5 grid grid-cols-[1.1fr_0.9fr_0.9fr_1.2fr] border border-[#34322b] bg-[#181713]">
      <SummaryTile label="Producer decision" value={blockedTotal > 0 ? "Hold selected payments" : "Payment window clear"} tone={blockedTotal > 0 ? "over" : "ok"} />
      <SummaryTile label="Blocked cash" value={money(blockedTotal)} tone={blockedTotal > 0 ? "over" : "ok"} />
      <SummaryTile label="Missing docs" value={`${missingDocs} items`} tone={missingDocs > 5 ? "over" : missingDocs > 0 ? "watch" : "ok"} />
      <SummaryTile label="Budget pressure" value={overDepartments.map((department) => department.name).join(" / ") || "No overrun"} tone={overDepartments.length ? "watch" : "ok"} />
    </section>
  );
}

function AuditLedgerPanel({ ledger }: { ledger: ReturnType<typeof buildResourceAuditLedger> }) {
  return (
    <section className="mb-5 border border-[#34322b] bg-[#181713]">
      <div className="grid grid-cols-[1fr_380px] border-b border-[#34322b]">
        <div className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">audit ledger</p>
          <h2 className="mt-2 text-xl font-semibold text-[#f4f1e8]">供应商 / 付款 / 材料审计台账</h2>
          <p className="mt-2 max-w-3xl text-xs leading-6 text-[#aaa599]">
            把付款节点、供应商状态、缺失材料和部门超支统一到同一张台账里，方便制片主任按 HOLD / WATCH / CLEAR 做会前决策。
          </p>
        </div>
        <div className="grid grid-cols-2 border-l border-[#34322b] text-xs">
          <LedgerMetric label="HOLD 条目" value={ledger.holdCount.toString()} tone={ledger.holdCount ? "over" : "ok"} />
          <LedgerMetric label="WATCH 条目" value={ledger.watchCount.toString()} tone={ledger.watchCount ? "watch" : "ok"} />
          <LedgerMetric label="冻结暴露金额" value={money(ledger.exposureAmount)} tone={ledger.exposureAmount > 0 ? "over" : "ok"} />
          <LedgerMetric label="缺失材料" value={`${ledger.missingEvidenceCount} 份`} tone={ledger.missingEvidenceCount ? "watch" : "ok"} />
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="grid grid-cols-[88px_92px_1fr_120px_1.15fr_1fr] border-b border-[#2a2a28] bg-[#1e1e1c] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#6e6e69]">
          <span>Status</span>
          <span>Type</span>
          <span>Owner / Item</span>
          <span>Amount</span>
          <span>Evidence</span>
          <span>Next step</span>
        </div>
        {ledger.entries.slice(0, 12).map((entry) => (
          <LedgerRow key={entry.id} entry={entry} />
        ))}
      </div>
    </section>
  );
}

function LedgerMetric({ label, value, tone }: { label: string; value: string; tone: keyof typeof riskStyles }) {
  return (
    <div className="border-b border-l border-[#34322b] p-3 odd:border-l-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7f7a70]">{label}</p>
      <p className={["mt-2 font-mono text-lg font-semibold", tone === "over" ? "text-[#ff8b7c]" : tone === "watch" ? "text-[#e8c678]" : "text-[#75d9a7]"].join(" ")}>
        {value}
      </p>
    </div>
  );
}

function LedgerRow({ entry }: { entry: ResourceLedgerEntry }) {
  return (
    <div className="grid min-h-16 grid-cols-[88px_92px_1fr_120px_1.15fr_1fr] border-b border-[#2a2a28] px-4 py-3 text-sm">
      <span className={["h-fit w-fit border px-2 py-1 text-[11px] font-semibold", ledgerStatusClass(entry.status)].join(" ")}>{entry.status.toUpperCase()}</span>
      <span className="text-xs text-[#aaa599]">{ledgerKindLabel(entry.kind)}</span>
      <div className="min-w-0">
        <p className="truncate font-medium text-[#f4f1e8]">{entry.title}</p>
        <p className="mt-1 truncate text-xs text-[#8f8a7e]">{entry.owner} · {entry.date}</p>
      </div>
      <span className="font-mono text-xs text-[#e8c678]">{entry.amount === null ? "--" : money(entry.amount)}</span>
      <p className="text-xs leading-5 text-[#aaa599]">{entry.evidence}</p>
      <p className="text-xs leading-5 text-[#c9c3b5]">{entry.nextStep}</p>
    </div>
  );
}

function ledgerStatusClass(status: ResourceLedgerEntry["status"]) {
  if (status === "hold") return riskStyles.over;
  if (status === "watch") return riskStyles.watch;
  if (status === "closed") return "border-[#34322b] bg-[#11110f] text-[#8f8a7e]";
  return riskStyles.ok;
}

function ledgerKindLabel(kind: ResourceLedgerEntry["kind"]) {
  const labels: Record<ResourceLedgerEntry["kind"], string> = {
    payment: "付款",
    vendor: "供应商",
    document: "材料",
    department: "部门",
  };
  return labels[kind];
}

function SummaryTile({ label, value, tone }: { label: string; value: string; tone: keyof typeof riskStyles }) {
  return (
    <div className="border-l border-[#34322b] p-4 first:border-l-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f7a70]">{label}</p>
      <p className={["mt-2 truncate text-lg font-semibold", tone === "over" ? "text-[#ff8b7c]" : tone === "watch" ? "text-[#e8c678]" : "text-[#75d9a7]"].join(" ")}>
        {value}
      </p>
    </div>
  );
}

function ResourceCommandDeck({ data }: { data: ResourceBudgetData }) {
  const blockedPayments = data.payments.filter((payment) => payment.status === "blocked");
  const dueSoonPayments = data.payments.filter((payment) => payment.status !== "paid" && daysUntil(payment.dueDate) <= 7);
  const blockedTotal = blockedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const dueSoonTotal = dueSoonPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const requiredDocuments = data.documents.reduce((sum, document) => sum + document.required, 0);
  const receivedDocuments = data.documents.reduce((sum, document) => sum + document.received, 0);
  const auditRate = requiredDocuments > 0 ? receivedDocuments / requiredDocuments : 1;
  const reserve = data.project.totalBudget - data.project.committedTotal;
  const projectedOverrun = getDepartmentForecasts(data).reduce((sum, item) => sum + Math.max(0, item.variance), 0);

  return (
    <section className="mb-5 border border-[#34322b] bg-[#181713]">
      <div className="grid grid-cols-[1fr_1.2fr]">
        <div className="border-r border-[#34322b] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">producer control room</p>
          <h2 className="mt-2 text-xl font-semibold text-[#f4f1e8]">制片资源指令台</h2>
          <p className="mt-2 max-w-2xl text-xs leading-6 text-[#aaa599]">
            把预算余量、付款关口、审计材料和部门压力集中在一个会前视图里，方便监制、制片主任和财务快速判断放款顺序。
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <CommandMetric label="7日应付" value={money(dueSoonTotal)} meta={`${dueSoonPayments.length} 个节点`} tone={dueSoonTotal > 0 ? "watch" : "ok"} />
            <CommandMetric label="冻结付款" value={money(blockedTotal)} meta={`${blockedPayments.length} 个暂缓`} tone={blockedTotal > 0 ? "over" : "ok"} />
            <CommandMetric label="预算余量" value={money(reserve)} meta="按已承诺口径" tone={reserve < 0 ? "over" : reserve < data.project.totalBudget * 0.12 ? "watch" : "ok"} />
            <CommandMetric label="预测超支" value={money(projectedOverrun)} meta="部门+供应商暴露" tone={projectedOverrun > 0 ? "over" : "ok"} />
          </div>
        </div>

        <div className="grid grid-cols-[0.95fr_1.05fr]">
          <div className="border-r border-[#34322b] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">next actions</p>
            <div className="mt-3 space-y-2">
              {data.payments.slice().sort(sortPaymentsForDecision).slice(0, 4).map((payment) => {
                const decision = getPaymentDecision(payment);

                return (
                  <div key={payment.id} className="border border-[#2f2c25] bg-[#11110f] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#f4f1e8]">{payment.label}</p>
                        <p className="mt-1 truncate text-xs text-[#8f8a7e]">{payment.vendorName} · {payment.dueDate}</p>
                      </div>
                      <DecisionBadge decision={decision} />
                    </div>
                    <p className="mt-2 font-mono text-sm text-[#e8c678]">{money(payment.amount)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">readiness</p>
            <div className="mt-3 border border-[#2f2c25] bg-[#11110f] p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#c9c3b5]">审计材料完整率</span>
                <span className="font-mono text-[#e8c678]">{Math.round(auditRate * 100)}%</span>
              </div>
              <div className="mt-2 h-2 bg-[#26231d]">
                <div className="h-full bg-[#d8b46a]" style={{ width: `${Math.min(auditRate, 1) * 100}%` }} />
              </div>
              <p className="mt-3 text-xs leading-5 text-[#8f8a7e]">
                已收 {receivedDocuments} / 应收 {requiredDocuments}。付款前优先补齐 VFX、灯光/发电车和酒店住宿材料。
              </p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <MiniStat label="Review vendors" value={data.vendors.filter((vendor) => vendor.status === "review").length.toString()} />
              <MiniStat label="Avg trust" value={averageTrust(data.people).toString()} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CommandMetric({ label, value, meta, tone }: { label: string; value: string; meta: string; tone: keyof typeof riskStyles }) {
  return (
    <div className={`border p-4 ${riskStyles[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold tracking-[-0.03em]">{value}</p>
      <p className="mt-1 text-xs opacity-75">{meta}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-36 border-l border-[#34322b] px-4 py-3 first:border-l-0">
      <p className="text-[#8f8a7e]">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold tracking-[-0.03em] text-[#f4f1e8]">{value}</p>
    </div>
  );
}

function DepartmentForecastPanel({ data }: { data: ResourceBudgetData }) {
  const forecasts = getDepartmentForecasts(data).slice().sort((a, b) => b.exposureRate - a.exposureRate);

  return (
    <section className="border border-[#34322b] bg-[#181713]">
      <PanelHeader eyebrow="forecast variance" title="部门消耗预测" />
      <div className="overflow-hidden">
        <div className="grid grid-cols-[1.1fr_90px_90px_88px_92px] border-y border-[#2a2a28] bg-[#1e1e1c] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#6e6e69]">
          <span>Department</span>
          <span>Used</span>
          <span>Forecast</span>
          <span>Variance</span>
          <span>Signal</span>
        </div>
        {forecasts.map((item) => (
          <div key={item.department.id} className="grid min-h-14 grid-cols-[1.1fr_90px_90px_88px_92px] items-center border-b border-[#2a2a28] px-4 py-3 text-xs">
            <div className="min-w-0 pr-3">
              <p className="truncate font-medium text-[#f4f1e8]">{item.department.name}</p>
              <div className="mt-2 h-1.5 bg-[#26231d]">
                <div className="h-full" style={{ width: `${Math.min(item.exposureRate, 1.15) * 86}%`, backgroundColor: item.department.color }} />
              </div>
            </div>
            <span className="font-mono text-[#aaa599]">{Math.round(item.actualRate * 100)}%</span>
            <span className="font-mono text-[#e8c678]">{money(item.forecast)}</span>
            <span className={item.variance > 0 ? "font-mono text-[#ff8b7c]" : "font-mono text-[#75d9a7]"}>{money(item.variance)}</span>
            <span className={["w-fit border px-2 py-1", riskStyles[item.tone]].join(" ")}>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function BudgetPanel({ title, departments }: { title: string; departments: BudgetDepartment[] }) {
  const max = Math.max(...departments.map((department) => department.budget), 1);
  const totalBudget = departments.reduce((sum, department) => sum + department.budget, 0);

  return (
    <section className="border border-[#34322b] bg-[#181713]">
      <PanelHeader eyebrow="budget split" title={title} />
      <div className="space-y-3 p-4">
        {departments.map((department) => {
          const actualRate = department.budget > 0 ? department.actual / department.budget : 0;
          const share = totalBudget > 0 ? department.budget / totalBudget : 0;

          return (
            <div key={department.id} className="border border-[#2f2c25] bg-[#11110f] p-3">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                <span className="flex min-w-0 items-center gap-2 font-medium text-[#f4f1e8]">
                  <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: department.color }} />
                  <span className="truncate">{department.name}</span>
                </span>
                <span className="font-mono text-[#aaa599]">{money(department.actual)} / {money(department.budget)}</span>
              </div>
              <div className="relative h-2 overflow-hidden bg-[#26231d]">
                <div className="absolute inset-y-0 left-0 bg-[#3a352a]" style={{ width: `${(department.budget / max) * 100}%` }} />
                <div className="absolute inset-y-0 left-0" style={{ width: `${Math.min(actualRate, 1) * 100}%`, backgroundColor: department.color }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-[#7f7a70]">
                <span>{Math.round(share * 100)}% share</span>
                <span className={department.risk === "over" ? "text-[#ff8b7c]" : department.risk === "watch" ? "text-[#e8c678]" : "text-[#75d9a7]"}>
                  {Math.round(actualRate * 100)}% used
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ApprovalQueuePanel({ data }: { data: ResourceBudgetData }) {
  const payments = data.payments.slice().sort(sortPaymentsForDecision);

  return (
    <section className="border border-[#34322b] bg-[#181713]">
      <PanelHeader eyebrow="approval queue" title="付款审批队列" />
      <div className="overflow-hidden">
        <div className="grid grid-cols-[96px_1.1fr_120px_105px_1fr] border-y border-[#2a2a28] bg-[#1e1e1c] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#6e6e69]">
          <span>Action</span>
          <span>Milestone</span>
          <span>Amount</span>
          <span>Owner</span>
          <span>Release condition</span>
        </div>
        {payments.map((payment) => {
          const decision = getPaymentDecision(payment);

          return (
            <div key={payment.id} className="grid min-h-16 grid-cols-[96px_1.1fr_120px_105px_1fr] border-b border-[#2a2a28] px-4 py-3 text-sm">
              <DecisionBadge decision={decision} />
              <div className="min-w-0">
                <p className="truncate font-medium text-[#f4f1e8]">{payment.label}</p>
                <p className="mt-1 truncate text-xs text-[#8f8a7e]">{payment.vendorName} · {payment.dueDate}</p>
              </div>
              <span className="font-mono text-xs text-[#e8c678]">{money(payment.amount)}</span>
              <span className="text-xs text-[#c9c3b5]">{decision.owner}</span>
              <p className="text-xs leading-5 text-[#aaa599]">{payment.gate}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CashWindowPanel({ data }: { data: ResourceBudgetData }) {
  const scheduled = data.payments
    .filter((payment) => payment.status !== "paid")
    .slice()
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const max = Math.max(...scheduled.map((payment) => payment.amount), 1);
  const releaseTotal = scheduled.filter((payment) => payment.status !== "blocked").reduce((sum, payment) => sum + payment.amount, 0);
  const blockedTotal = scheduled.filter((payment) => payment.status === "blocked").reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <section className="border border-[#34322b] bg-[#181713]">
      <PanelHeader eyebrow="cash window" title="近期待付现金流" />
      <div className="grid grid-cols-[180px_1fr] border-b border-[#2a2a28]">
        <div className="border-r border-[#2a2a28] p-4">
          <MiniStat label="可排款" value={money(releaseTotal)} />
          <div className="mt-4">
            <MiniStat label="需暂缓" value={money(blockedTotal)} />
          </div>
        </div>
        <div className="space-y-3 p-4">
          {scheduled.map((payment) => {
            const decision = getPaymentDecision(payment);
            const day = daysUntil(payment.dueDate);

            return (
              <div key={payment.id} className="grid grid-cols-[78px_1fr_86px] items-center gap-3 text-xs">
                <div>
                  <p className="font-mono text-[#f4f1e8]">D{day >= 0 ? `+${day}` : day}</p>
                  <p className="mt-1 text-[#7f7a70]">{payment.dueDate.slice(5)}</p>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="truncate text-[#c9c3b5]">{payment.label}</span>
                    <span className="font-mono text-[#e8c678]">{money(payment.amount)}</span>
                  </div>
                  <div className="h-2 bg-[#26231d]">
                    <div className={["h-full", decision.tone === "over" ? "bg-[#e24b4a]" : decision.tone === "watch" ? "bg-[#d8b46a]" : "bg-[#1d9e75]"].join(" ")} style={{ width: `${(payment.amount / max) * 100}%` }} />
                  </div>
                </div>
                <DecisionBadge decision={decision} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function VendorRiskMatrixPanel({ data }: { data: ResourceBudgetData }) {
  const risks = data.vendors.map((vendor) => getVendorRisk(vendor, data)).sort((a, b) => b.score - a.score);

  return (
    <section className="border border-[#34322b] bg-[#181713]">
      <PanelHeader eyebrow="vendor diligence" title="供应商风险矩阵" />
      <div className="grid grid-cols-2 gap-3 p-4">
        {risks.map(({ vendor, score, tone, blockers }) => (
          <div key={vendor.id} className="border border-[#2f2c25] bg-[#11110f] p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#f4f1e8]">{vendor.name}</p>
                <p className="mt-1 text-xs text-[#8f8a7e]">{vendor.owner} · {vendorCategoryLabels[vendor.category]}</p>
              </div>
              <span className={["border px-2 py-1 text-xs", riskStyles[tone]].join(" ")}>{score}</span>
            </div>
            <div className="mt-3 h-1.5 bg-[#26231d]">
              <div className="h-full bg-[#d8b46a]" style={{ width: `${Math.min(score, 100)}%` }} />
            </div>
            <p className="mt-3 text-xs leading-5 text-[#aaa599]">{blockers.join("；") || "材料和付款条件正常。"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RiskPanel({ title, data }: { title: string; data: ResourceBudgetData }) {
  return (
    <section className="border border-[#34322b] bg-[#181713]">
      <PanelHeader eyebrow="audit" title={title} />
      <div className="grid gap-3 p-4">
        {data.insights.map((insight) => (
          <div key={insight.id} className={`border p-3 ${riskStyles[insight.severity]}`}>
            <div className="flex items-start justify-between gap-3">
              <strong className="text-sm">{insight.title}</strong>
              {insight.amount ? <span className="font-mono text-xs">{money(insight.amount)}</span> : null}
            </div>
            <p className="mt-2 text-xs leading-5 opacity-85">{insight.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PaymentPanel({ title, payments }: { title: string; payments: PaymentMilestone[] }) {
  return (
    <section className="border border-[#34322b] bg-[#181713]">
      <PanelHeader eyebrow="payment gates" title={title} />
      <div className="overflow-hidden">
        <div className="grid grid-cols-[1.2fr_110px_120px_110px_1.1fr] border-y border-[#2a2a28] bg-[#1e1e1c] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#6e6e69]">
          <span>Milestone</span>
          <span>Due</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Gate</span>
        </div>
        {payments.map((payment) => (
          <div key={payment.id} className="grid min-h-16 grid-cols-[1.2fr_110px_120px_110px_1.1fr] border-b border-[#2a2a28] px-4 py-3 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium text-[#f4f1e8]">{payment.label}</p>
              <p className="mt-1 truncate text-xs text-[#8f8a7e]">{payment.vendorName}</p>
            </div>
            <span className="font-mono text-xs text-[#aaa599]">{payment.dueDate}</span>
            <span className="font-mono text-xs text-[#e8c678]">{money(payment.amount)}</span>
            <span className={["h-fit w-fit border px-2 py-1 text-[11px]", payment.status === "blocked" ? riskStyles.over : payment.status === "ready" ? riskStyles.ok : "border-[#34322b] bg-[#11110f] text-[#aaa599]"].join(" ")}>
              {paymentStatusLabels[payment.status]}
            </span>
            <p className="text-xs leading-5 text-[#aaa599]">{payment.gate}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DocumentPanel({ title, documents }: { title: string; documents: AuditDocument[] }) {
  return (
    <section className="border border-[#34322b] bg-[#181713]">
      <PanelHeader eyebrow="paper trail" title={title} />
      <div className="grid gap-3 p-4">
        {documents.map((document) => {
          const rate = document.required > 0 ? document.received / document.required : 0;

          return (
            <div key={document.id} className="border border-[#2f2c25] bg-[#11110f] p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#f4f1e8]">{document.owner}</p>
                  <p className="mt-1 text-xs text-[#8f8a7e]">{document.category}</p>
                </div>
                <span className={["border px-2 py-1 text-xs", riskStyles[document.severity]].join(" ")}>
                  {document.received}/{document.required}
                </span>
              </div>
              <div className="h-2 bg-[#26231d]">
                <div className="h-full bg-[#d8b46a]" style={{ width: `${rate * 100}%` }} />
              </div>
              <p className="mt-2 text-xs leading-5 text-[#aaa599]">
                {document.missing.length ? `缺：${document.missing.join("、")}` : "材料齐全"}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function VendorPanel({ title, vendors }: { title: string; vendors: VendorSpend[] }) {
  return (
    <section className="border border-[#34322b] bg-[#181713]">
      <PanelHeader eyebrow="supplier ledger" title={title} />
      <div className="overflow-hidden">
        <div className="grid grid-cols-[1.2fr_100px_120px_120px_1fr] border-y border-[#2a2a28] bg-[#1e1e1c] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#6e6e69]">
          <span>Vendor</span>
          <span>Type</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Audit note</span>
        </div>
        {vendors.map((vendor) => (
          <div key={vendor.id} className="grid min-h-16 grid-cols-[1.2fr_100px_120px_120px_1fr] border-b border-[#2a2a28] px-4 py-3 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium text-[#f4f1e8]">{vendor.name}</p>
              <p className="mt-1 text-xs text-[#8f8a7e]">{vendor.owner} · {vendor.progress}%</p>
            </div>
            <span className="text-xs text-[#c9c3b5]">{vendorCategoryLabels[vendor.category]}</span>
            <span className="font-mono text-xs text-[#e8c678]">{money(vendor.amount)}</span>
            <span className={["h-fit w-fit border px-2 py-1 text-[11px]", vendor.status === "review" ? riskStyles.watch : "border-[#34322b] bg-[#11110f] text-[#aaa599]"].join(" ")}>
              {vendorStatusLabels[vendor.status]}
            </span>
            <p className="text-xs leading-5 text-[#aaa599]">{vendor.auditFlag}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PeoplePanel({ title, data }: { title: string; data: ResourceBudgetData }) {
  const total = data.people.reduce((sum, person) => sum + person.total, 0);

  return (
    <section className="border border-[#34322b] bg-[#181713]">
      <PanelHeader eyebrow={`${data.people.length} crew / ${money(total)}`} title={title} />
      <div className="grid grid-cols-2 gap-3 p-4">
        {data.people.map((person) => (
          <div key={person.id} className="border border-[#2f2c25] bg-[#11110f] p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-[#f4f1e8]">{person.name}</p>
                <p className="mt-1 truncate text-xs text-[#8f8a7e]">{person.role} · {person.department}</p>
              </div>
              <span className="border border-[#3f3c33] px-2 py-1 text-xs text-[#e8c678]">{person.grade}</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <MiniStat label="Trust" value={person.trustScore.toString()} />
              <MiniStat label="Days" value={person.days.toString()} />
              <MiniStat label="Cost" value={money(person.total)} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FundFlowPanel({ title, data }: { title: string; data: ResourceBudgetData }) {
  const max = Math.max(...data.fundFlow.map((link) => link.amount), 1);

  return (
    <section className="border border-[#34322b] bg-[#181713]">
      <PanelHeader eyebrow="money path" title={title} />
      <div className="space-y-3 p-4">
        {data.fundFlow.map((link) => (
          <div key={`${link.from}-${link.to}`} className="grid grid-cols-[120px_1fr_150px] items-center gap-3 text-xs">
            <span className="truncate text-[#8f8a7e]">{link.from}</span>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium text-[#c9c3b5]">{link.to}</span>
                <span className="font-mono text-[#e8c678]">{money(link.amount)}</span>
              </div>
              <div className="h-2 bg-[#26231d]">
                <div className="h-full bg-[#d8b46a]" style={{ width: `${(link.amount / max) * 100}%` }} />
              </div>
            </div>
            <span className="text-right text-[#7f7a70]">{Math.round((link.amount / Math.max(data.project.totalBudget, 1)) * 100)}% of budget</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PanelHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="border-b border-[#34322b] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d8b46a]">{eyebrow}</p>
      <h2 className="mt-1 text-lg font-semibold">{title}</h2>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[#7f7a70]">{label}</p>
      <p className="mt-1 font-mono text-[#c9c3b5]">{value}</p>
    </div>
  );
}

type PaymentDecision = {
  label: string;
  tone: keyof typeof riskStyles;
  owner: string;
};

function getPaymentDecision(payment: PaymentMilestone): PaymentDecision {
  if (payment.status === "blocked") {
    return { label: "HOLD", tone: "over", owner: "审计" };
  }

  if (payment.status === "ready") {
    return { label: "RELEASE", tone: "ok", owner: "制片" };
  }

  if (payment.status === "scheduled") {
    return { label: "SCHEDULE", tone: "watch", owner: "财务" };
  }

  return { label: "CLOSED", tone: "ok", owner: "财务" };
}

function DecisionBadge({ decision }: { decision: PaymentDecision }) {
  return <span className={["h-fit w-fit border px-2 py-1 text-[11px] font-semibold", riskStyles[decision.tone]].join(" ")}>{decision.label}</span>;
}

function sortPaymentsForDecision(a: PaymentMilestone, b: PaymentMilestone) {
  const priority: Record<PaymentMilestone["status"], number> = {
    blocked: 0,
    ready: 1,
    scheduled: 2,
    paid: 3,
  };

  return priority[a.status] - priority[b.status] || a.dueDate.localeCompare(b.dueDate);
}

function getDepartmentForecasts(data: ResourceBudgetData) {
  return data.departments.map((department) => {
    const vendorExposure = data.vendors.filter((vendor) => vendor.owner === department.name).reduce((sum, vendor) => sum + vendor.amount, 0);
    const forecast = Math.max(department.committed, department.actual) + vendorExposure * 0.35;
    const variance = forecast - department.budget;
    const exposureRate = department.budget > 0 ? forecast / department.budget : 0;
    const actualRate = department.budget > 0 ? department.actual / department.budget : 0;
    const tone: keyof typeof riskStyles = variance > 0 ? "over" : exposureRate > 0.82 ? "watch" : "ok";
    const label = tone === "over" ? "overrun" : tone === "watch" ? "watch" : "clear";

    return { department, vendorExposure, forecast, variance, exposureRate, actualRate, tone, label };
  });
}

function getVendorRisk(vendor: VendorSpend, data: ResourceBudgetData) {
  const document = data.documents.find((item) => item.owner === vendor.name);
  const blockedPayment = data.payments.find((payment) => payment.vendorId === vendor.id && payment.status === "blocked");
  const blockers = [
    vendor.status === "review" ? "供应商状态待复核" : "",
    blockedPayment ? `付款暂缓：${blockedPayment.label}` : "",
    document && document.missing.length ? `缺 ${document.missing.join("、")}` : "",
    vendor.progress < 55 ? "执行进度低于付款节奏" : "",
  ].filter(Boolean);
  const score =
    (vendor.status === "review" ? 28 : 0) +
    (blockedPayment ? 32 : 0) +
    ((document?.missing.length ?? 0) * 9) +
    (vendor.progress < 55 ? 12 : 0) +
    Math.min(18, vendor.amount / 10000);
  const tone: keyof typeof riskStyles = score >= 58 ? "over" : score >= 28 ? "watch" : "ok";

  return { vendor, score: Math.round(score), tone, blockers };
}

function daysUntil(date: string) {
  const today = Date.UTC(2026, 5, 18);
  const target = Date.parse(`${date}T00:00:00Z`);
  return Math.ceil((target - today) / 86_400_000);
}

function averageTrust(people: ResourceBudgetData["people"]) {
  if (!people.length) return 0;
  return Math.round(people.reduce((sum, person) => sum + person.trustScore, 0) / people.length);
}

function money(value: number) {
  return moneyFormatter.format(value);
}
