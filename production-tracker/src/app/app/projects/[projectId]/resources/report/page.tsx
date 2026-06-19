import Link from "next/link";

import { ResourcePrintButton } from "@/components/resource/resource-print-button";
import {
  getResourceBudgetData,
  type AuditDocument,
  type BudgetDepartment,
  type PaymentMilestone,
  type ResourceBudgetData,
  type ResourcePerson,
  type VendorSpend,
} from "@/lib/resource-data";
import { buildResourceReportSummary, type ResourceReportSummary } from "@/lib/resource-report";

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const riskLabels: Record<BudgetDepartment["risk"], string> = {
  ok: "可控",
  watch: "关注",
  over: "超支",
};

const paymentStatusLabels: Record<PaymentMilestone["status"], string> = {
  blocked: "暂缓",
  ready: "可付款",
  scheduled: "已排期",
  paid: "已支付",
};

const vendorStatusLabels: Record<VendorSpend["status"], string> = {
  quoted: "报价",
  contracted: "已签约",
  paid: "已付款",
  review: "待复核",
};

const vendorCategoryLabels: Record<VendorSpend["category"], string> = {
  equipment: "器材",
  vehicle: "车辆",
  hotel: "酒店住宿",
  location: "场地",
  vfx: "VFX",
  production: "制片",
};

const gradeLabels: Record<ResourceReportSummary["reportGrade"], { title: string; detail: string; className: string }> = {
  clear: {
    title: "CLEAR",
    detail: "预算、付款与材料可继续按计划推进",
    className: "border-[#224b39] bg-[#13251d] text-[#75d9a7] print:border-[#15803d] print:bg-white print:text-[#166534]",
  },
  watch: {
    title: "WATCH",
    detail: "存在材料或预算观察项，需要会前确认",
    className: "border-[#6f5631] bg-[#211b12] text-[#e8c678] print:border-[#b45309] print:bg-white print:text-[#92400e]",
  },
  hold: {
    title: "HOLD",
    detail: "建议暂缓部分付款或追加预算审批",
    className: "border-[#743434] bg-[#281818] text-[#ff8b7c] print:border-[#b91c1c] print:bg-white print:text-[#991b1b]",
  },
};

export default async function ProjectResourceReportPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const data = await getResourceBudgetData(projectId);
  const reportDate = new Date().toISOString().slice(0, 10);
  const summary = buildResourceReportSummary(data, reportDate);

  return (
    <article className="mx-auto max-w-[1180px] border border-[#34322b] bg-[#181713] text-[#f4f1e8] print:max-w-none print:border-0 print:bg-white print:text-[#171717]">
      <ReportHeader projectId={projectId} data={data} summary={summary} reportDate={reportDate} />
      <ExecutiveSummary summary={summary} />
      <ReportMetrics summary={summary} />
      <div className="grid grid-cols-[1fr_0.82fr] gap-5 border-t border-[#34322b] p-5 print:block print:border-[#d8d1c4] print:p-0">
        <div className="space-y-5 print:space-y-4">
          <DepartmentSection departments={data.departments} totalBudget={data.project.totalBudget} />
          <VendorSection vendors={data.vendors} />
          <FundFlowSection data={data} />
        </div>
        <div className="space-y-5 print:mt-4 print:space-y-4">
          <PaymentSection payments={data.payments} />
          <AuditSection documents={data.documents} />
          <PeopleSection people={data.people} />
        </div>
      </div>
    </article>
  );
}

function ReportHeader({
  projectId,
  data,
  summary,
  reportDate,
}: {
  projectId: string;
  data: ResourceBudgetData;
  summary: ResourceReportSummary;
  reportDate: string;
}) {
  const grade = gradeLabels[summary.reportGrade];

  return (
    <header className="grid grid-cols-[1fr_320px] gap-5 border-b border-[#34322b] p-5 print:grid-cols-[1fr_260px] print:border-[#d8d1c4] print:px-0 print:pb-5 print:pt-0">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#d8b46a] print:text-[#735f28]">producer resource report</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em] print:text-2xl">制片资源与预算报告</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#aaa599] print:text-[#4a4640]">
          {data.project.name} · 预算、人员、供应商、付款关口、审计材料和资金流向汇总。此报告用于周会、付款审批和监制/制片厂复核。
        </p>
        <div className="mt-4 flex items-center gap-2 print:hidden">
          <Link
            href={`/app/projects/${encodeURIComponent(projectId)}/resources`}
            className="grid h-9 place-items-center border border-[#3f3c33] px-3 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
          >
            返回资源页
          </Link>
          <ResourcePrintButton />
        </div>
      </div>
      <div className={`border p-4 ${grade.className}`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">decision status</p>
        <p className="mt-3 font-mono text-4xl font-semibold tracking-[-0.04em]">{grade.title}</p>
        <p className="mt-3 text-sm leading-6 opacity-85">{grade.detail}</p>
        <div className="mt-4 border-t border-current/25 pt-3 text-xs leading-6">
          <p>报告日期：{reportDate}</p>
          <p>项目预算：{money(data.project.totalBudget)}</p>
        </div>
      </div>
    </header>
  );
}

function ExecutiveSummary({ summary }: { summary: ResourceReportSummary }) {
  return (
    <section className="grid grid-cols-[1fr_280px] gap-5 border-b border-[#34322b] p-5 print:grid-cols-[1fr_220px] print:border-[#d8d1c4] print:px-0">
      <div>
        <SectionTitle eyebrow="executive note" title="制片结论" />
        <p className="mt-3 text-base leading-8 text-[#e6dfd0] print:text-[#26231d]">{summary.recommendation}</p>
        <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
          <ReportFact label="超支部门" value={summary.overBudgetDepartments.join(" / ") || "暂无"} />
          <ReportFact label="待复核供应商" value={summary.watchVendors.join(" / ") || "暂无"} />
          <ReportFact label="成本最高部门" value={`${summary.topDepartmentName} · ${money(summary.topDepartmentAmount)}`} />
        </div>
      </div>
      <div className="border border-[#34322b] bg-[#11110f] p-4 print:border-[#d8d1c4] print:bg-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f7a70] print:text-[#5f5a52]">cash control</p>
        <p className="mt-3 font-mono text-2xl font-semibold text-[#e8c678] print:text-[#6f5720]">{money(summary.blockedPaymentTotal)}</p>
        <p className="mt-2 text-sm leading-6 text-[#aaa599] print:text-[#4a4640]">
          {summary.blockedPaymentCount} 个付款节点需要暂缓；7日窗口内应处理 {money(summary.dueSoonPaymentTotal)}。
        </p>
      </div>
    </section>
  );
}

function ReportMetrics({ summary }: { summary: ResourceReportSummary }) {
  return (
    <section className="grid grid-cols-4 border-b border-[#34322b] print:border-[#d8d1c4]">
      <Metric label="预算消耗" value={`${summary.budgetBurnPct}%`} detail="Actual / Budget" tone={summary.budgetBurnPct > 70 ? "over" : summary.budgetBurnPct > 55 ? "watch" : "ok"} />
      <Metric label="承诺消耗" value={`${summary.committedBurnPct}%`} detail={`余量 ${money(summary.reserve)}`} tone={summary.reserve < 0 ? "over" : summary.committedBurnPct > 82 ? "watch" : "ok"} />
      <Metric label="审计完整率" value={`${summary.auditReadinessPct}%`} detail={`${summary.missingDocumentCount} 份材料缺口`} tone={summary.auditReadinessPct < 70 ? "over" : summary.auditReadinessPct < 90 ? "watch" : "ok"} />
      <Metric label="人员信任均分" value={summary.averageTrustScore.toString()} detail={`人员成本 ${money(summary.peopleCostTotal)}`} tone={summary.averageTrustScore < 70 ? "watch" : "ok"} />
    </section>
  );
}

function DepartmentSection({ departments, totalBudget }: { departments: BudgetDepartment[]; totalBudget: number }) {
  return (
    <ReportSection eyebrow="budget split" title="部门预算与消耗">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#34322b] text-left text-[11px] uppercase tracking-[0.12em] text-[#7f7a70] print:border-[#d8d1c4] print:text-[#5f5a52]">
              <th className="py-2 pr-3 font-semibold">部门</th>
              <th className="py-2 pr-3 font-semibold">预算</th>
              <th className="py-2 pr-3 font-semibold">已承诺</th>
              <th className="py-2 pr-3 font-semibold">支出</th>
              <th className="py-2 pr-3 font-semibold">占比</th>
              <th className="py-2 font-semibold">信号</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((department) => {
              const usedPct = percent(department.actual, department.budget);
              const sharePct = percent(department.budget, totalBudget);

              return (
                <tr key={department.id} className="border-b border-[#2a2a28] print:border-[#e4ded2]">
                  <td className="py-2.5 pr-3">
                    <span className="inline-flex items-center gap-2 font-medium">
                      <span className="size-2" style={{ backgroundColor: department.color }} />
                      {department.name}
                    </span>
                    <div className="mt-1 h-1.5 bg-[#26231d] print:bg-[#eee9df]">
                      <div className="h-full" style={{ width: `${Math.min(usedPct, 120)}%`, backgroundColor: department.color }} />
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-[#c9c3b5] print:text-[#26231d]">{money(department.budget)}</td>
                  <td className="py-2.5 pr-3 font-mono text-[#c9c3b5] print:text-[#26231d]">{money(department.committed)}</td>
                  <td className="py-2.5 pr-3 font-mono text-[#e8c678] print:text-[#6f5720]">{money(department.actual)}</td>
                  <td className="py-2.5 pr-3 font-mono text-[#aaa599] print:text-[#4a4640]">{sharePct}% / {usedPct}%</td>
                  <td className="py-2.5"><ToneBadge tone={department.risk}>{riskLabels[department.risk]}</ToneBadge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ReportSection>
  );
}

function VendorSection({ vendors }: { vendors: VendorSpend[] }) {
  return (
    <ReportSection eyebrow="supplier ledger" title="供应商与公司/个人开销">
      <div className="space-y-2">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="grid grid-cols-[1fr_90px_90px_110px] gap-3 border-b border-[#2a2a28] py-2 text-sm print:border-[#e4ded2]">
            <div className="min-w-0">
              <p className="truncate font-medium">{vendor.name}</p>
              <p className="mt-1 text-xs text-[#8f8a7e] print:text-[#5f5a52]">{vendor.owner} · {vendor.auditFlag}</p>
            </div>
            <span className="text-xs text-[#aaa599] print:text-[#4a4640]">{vendorCategoryLabels[vendor.category]}</span>
            <span className="font-mono text-xs text-[#e8c678] print:text-[#6f5720]">{money(vendor.amount)}</span>
            <span className="text-xs text-[#c9c3b5] print:text-[#26231d]">{vendorStatusLabels[vendor.status]} · {vendor.progress}%</span>
          </div>
        ))}
      </div>
    </ReportSection>
  );
}

function PaymentSection({ payments }: { payments: PaymentMilestone[] }) {
  return (
    <ReportSection eyebrow="payment gates" title="付款审批节点">
      <div className="space-y-2">
        {payments.map((payment) => (
          <div key={payment.id} className="border-b border-[#2a2a28] py-2 print:border-[#e4ded2]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{payment.label}</p>
                <p className="mt-1 truncate text-xs text-[#8f8a7e] print:text-[#5f5a52]">{payment.vendorName} · {payment.dueDate}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-[#e8c678] print:text-[#6f5720]">{money(payment.amount)}</p>
                <p className="mt-1 text-xs text-[#aaa599] print:text-[#4a4640]">{paymentStatusLabels[payment.status]}</p>
              </div>
            </div>
            <p className="mt-2 text-xs leading-5 text-[#aaa599] print:text-[#4a4640]">{payment.gate}</p>
          </div>
        ))}
      </div>
    </ReportSection>
  );
}

function AuditSection({ documents }: { documents: AuditDocument[] }) {
  return (
    <ReportSection eyebrow="audit trail" title="审计材料缺口">
      <div className="space-y-2">
        {documents.map((document) => {
          const missingCount = Math.max(0, document.required - document.received);

          return (
            <div key={document.id} className="grid grid-cols-[1fr_70px] gap-3 border-b border-[#2a2a28] py-2 text-sm print:border-[#e4ded2]">
              <div className="min-w-0">
                <p className="truncate font-medium">{document.owner}</p>
                <p className="mt-1 text-xs text-[#8f8a7e] print:text-[#5f5a52]">
                  {document.category} · {document.missing.length ? document.missing.join("、") : "材料齐全"}
                </p>
              </div>
              <div className="text-right">
                <ToneBadge tone={document.severity}>{missingCount > 0 ? `缺 ${missingCount}` : "齐"}</ToneBadge>
                <p className="mt-1 font-mono text-xs text-[#aaa599] print:text-[#4a4640]">{document.received}/{document.required}</p>
              </div>
            </div>
          );
        })}
      </div>
    </ReportSection>
  );
}

function FundFlowSection({ data }: { data: ResourceBudgetData }) {
  return (
    <ReportSection eyebrow="fund flow" title="资金流向明细">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {data.fundFlow.map((link) => (
          <div key={`${link.from}-${link.to}`} className="border-b border-[#2a2a28] py-2 print:border-[#e4ded2]">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate">{link.from} → {link.to}</span>
              <span className="shrink-0 font-mono text-[#e8c678] print:text-[#6f5720]">{money(link.amount)}</span>
            </div>
            <div className="mt-2 h-1.5 bg-[#26231d] print:bg-[#eee9df]">
              <div className="h-full bg-[#d8b46a] print:bg-[#9b7a2c]" style={{ width: `${Math.min(percent(link.amount, data.project.totalBudget), 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </ReportSection>
  );
}

function PeopleSection({ people }: { people: ResourcePerson[] }) {
  return (
    <ReportSection eyebrow="crew cost" title="人员成本与信任评分">
      <div className="space-y-2">
        {people.slice(0, 10).map((person) => (
          <div key={person.id} className="grid grid-cols-[1fr_64px_82px] gap-3 border-b border-[#2a2a28] py-2 text-sm print:border-[#e4ded2]">
            <div className="min-w-0">
              <p className="truncate font-medium">{person.name}</p>
              <p className="mt-1 truncate text-xs text-[#8f8a7e] print:text-[#5f5a52]">{person.role} · {person.department} · {person.vendor}</p>
            </div>
            <span className="font-mono text-xs text-[#c9c3b5] print:text-[#26231d]">{person.grade} / {person.trustScore}</span>
            <span className="text-right font-mono text-xs text-[#e8c678] print:text-[#6f5720]">{money(person.total)}</span>
          </div>
        ))}
      </div>
    </ReportSection>
  );
}

function ReportSection({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border border-[#34322b] bg-[#11110f] p-4 print:border-[#d8d1c4] print:bg-white print:break-inside-avoid">
      <SectionTitle eyebrow={eyebrow} title={title} />
      <div className="mt-3">{children}</div>
    </section>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d8b46a] print:text-[#735f28]">{eyebrow}</p>
      <h2 className="mt-1 text-lg font-semibold print:text-base">{title}</h2>
    </div>
  );
}

function ReportFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#34322b] bg-[#11110f] p-3 print:border-[#d8d1c4] print:bg-white">
      <p className="text-[11px] text-[#7f7a70] print:text-[#5f5a52]">{label}</p>
      <p className="mt-2 truncate text-sm font-medium text-[#f4f1e8] print:text-[#171717]">{value}</p>
    </div>
  );
}

function Metric({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: BudgetDepartment["risk"] }) {
  return (
    <div className="border-l border-[#34322b] p-4 first:border-l-0 print:border-[#d8d1c4]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#7f7a70] print:text-[#5f5a52]">{label}</p>
      <p className={["mt-2 font-mono text-2xl font-semibold", tone === "over" ? "text-[#ff8b7c] print:text-[#991b1b]" : tone === "watch" ? "text-[#e8c678] print:text-[#92400e]" : "text-[#75d9a7] print:text-[#166534]"].join(" ")}>
        {value}
      </p>
      <p className="mt-1 text-xs text-[#8f8a7e] print:text-[#5f5a52]">{detail}</p>
    </div>
  );
}

function ToneBadge({ tone, children }: { tone: BudgetDepartment["risk"]; children: React.ReactNode }) {
  const className =
    tone === "over"
      ? "border-[#743434] bg-[#281818] text-[#ff8b7c] print:border-[#b91c1c] print:bg-white print:text-[#991b1b]"
      : tone === "watch"
        ? "border-[#6f5631] bg-[#211b12] text-[#e8c678] print:border-[#b45309] print:bg-white print:text-[#92400e]"
        : "border-[#224b39] bg-[#13251d] text-[#75d9a7] print:border-[#15803d] print:bg-white print:text-[#166534]";

  return <span className={`inline-flex border px-2 py-1 text-[11px] font-semibold ${className}`}>{children}</span>;
}

function percent(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function money(value: number) {
  return moneyFormatter.format(value);
}
