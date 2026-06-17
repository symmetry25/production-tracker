import { getDictionary, getLocale } from "@/lib/i18n";
import { SankeyFlow } from "@/components/resource/sankey-flow";
import {
  getResourceBudgetData,
  type AuditDocument,
  type BudgetDepartment,
  type PaymentMilestone,
  type ResourceBudgetData,
  type VendorSpend,
} from "@/lib/resource-data";

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

  return (
    <>
      <div className="mb-5 flex items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">{t.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold">{t.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#aaa599]">{t.description}</p>
        </div>
        <div className="grid grid-cols-3 border border-[#34322b] bg-[#181713] text-right text-xs">
          <Metric label={t.totalBudget} value={money(data.project.totalBudget)} />
          <Metric label={t.committed} value={money(data.project.committedTotal)} />
          <Metric label={t.actual} value={money(data.project.actualTotal)} />
        </div>
      </div>

      <ControlSummary data={data} />
      <div className="mb-5">
        <SankeyFlow data={data} />
      </div>

      <div className="grid grid-cols-[minmax(420px,0.88fr)_minmax(620px,1.12fr)] gap-5">
        <section className="space-y-5">
          <BudgetPanel title={t.departmentBudget} departments={data.departments} />
          <RiskPanel title={t.auditSignals} data={data} />
          <DocumentPanel title={t.auditDocuments} documents={data.documents} />
        </section>

        <section className="space-y-5">
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-36 border-l border-[#34322b] px-4 py-3 first:border-l-0">
      <p className="text-[#8f8a7e]">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold text-[#f4f1e8]">{value}</p>
    </div>
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

function money(value: number) {
  return moneyFormatter.format(value);
}
