import type { BudgetDepartment, ResourceBudgetData } from "@/lib/resource-data";

export type ResourceLedgerEntry = {
  id: string;
  date: string;
  kind: "payment" | "vendor" | "document" | "department";
  owner: string;
  title: string;
  amount: number | null;
  status: "hold" | "watch" | "clear" | "closed";
  evidence: string;
  nextStep: string;
};

export type ResourceLedgerSummary = {
  entries: ResourceLedgerEntry[];
  holdCount: number;
  watchCount: number;
  exposureAmount: number;
  missingEvidenceCount: number;
  nextOwner: string;
};

export function buildResourceAuditLedger(data: ResourceBudgetData, todayIso = "2026-06-18"): ResourceLedgerSummary {
  const entries = [
    ...data.payments.map((payment): ResourceLedgerEntry => ({
      id: `payment-${payment.id}`,
      date: payment.dueDate,
      kind: "payment",
      owner: payment.vendorName,
      title: payment.label,
      amount: payment.amount,
      status: payment.status === "blocked" ? "hold" : payment.status === "paid" ? "closed" : payment.status === "scheduled" ? "watch" : "clear",
      evidence: payment.gate,
      nextStep:
        payment.status === "blocked"
          ? "冻结付款，补齐材料后由制片主任复核"
          : payment.status === "ready"
            ? "可进入付款审批"
            : payment.status === "scheduled"
              ? "等待财务排款确认"
              : "归档付款凭证",
    })),
    ...data.vendors.map((vendor): ResourceLedgerEntry => ({
      id: `vendor-${vendor.id}`,
      date: todayIso,
      kind: "vendor",
      owner: vendor.owner,
      title: vendor.name,
      amount: vendor.amount,
      status: vendor.status === "review" ? "watch" : vendor.status === "paid" ? "closed" : vendor.status === "quoted" ? "watch" : "clear",
      evidence: vendor.auditFlag,
      nextStep:
        vendor.status === "review"
          ? "复核合同科目、交付清单和付款条件"
          : vendor.status === "quoted"
            ? "签约前确认税费、押金和取消条款"
            : vendor.status === "paid"
              ? "补齐归档凭证"
              : "保持合同与任务进度同步",
    })),
    ...data.documents.map((document): ResourceLedgerEntry => {
      const missingCount = Math.max(0, document.required - document.received);

      return {
        id: `document-${document.id}`,
        date: todayIso,
        kind: "document",
        owner: document.owner,
        title: `${document.category}材料`,
        amount: null,
        status: missingCount === 0 ? "clear" : document.severity === "over" ? "hold" : "watch",
        evidence: missingCount > 0 ? `缺 ${missingCount} 份：${document.missing.join("、")}` : "材料齐全",
        nextStep: missingCount > 0 ? "上传或确认缺失材料后再放行相关付款" : "归档",
      };
    }),
    ...data.departments
      .filter((department) => department.risk !== "ok")
      .map((department): ResourceLedgerEntry => ({
        id: `department-${department.id}`,
        date: todayIso,
        kind: "department",
        owner: department.name,
        title: `${department.name}预算${department.risk === "over" ? "超支" : "观察"}`,
        amount: departmentExposure(department),
        status: department.risk === "over" ? "hold" : "watch",
        evidence: `预算 ${formatMoney(department.budget)}，已承诺 ${formatMoney(department.committed)}，支出 ${formatMoney(department.actual)}`,
        nextStep: department.risk === "over" ? "冻结新增采购，提交追加审批或缩减 scope" : "确认剩余工作量和供应商暴露",
      })),
  ].sort(sortResourceLedgerEntries);

  const holdEntries = entries.filter((entry) => entry.status === "hold");
  const watchEntries = entries.filter((entry) => entry.status === "watch");
  const missingEvidenceCount = data.documents.reduce((sum, document) => sum + Math.max(0, document.required - document.received), 0);

  return {
    entries,
    holdCount: holdEntries.length,
    watchCount: watchEntries.length,
    exposureAmount: holdEntries.reduce((sum, entry) => sum + Math.max(0, entry.amount ?? 0), 0),
    missingEvidenceCount,
    nextOwner: holdEntries[0]?.owner ?? watchEntries[0]?.owner ?? "制片",
  };
}

function departmentExposure(department: BudgetDepartment) {
  return Math.max(0, department.committed - department.budget, department.actual - department.budget);
}

export function sortResourceLedgerEntries(a: ResourceLedgerEntry, b: ResourceLedgerEntry) {
  const statusPriority: Record<ResourceLedgerEntry["status"], number> = {
    hold: 0,
    watch: 1,
    clear: 2,
    closed: 3,
  };
  const kindPriority: Record<ResourceLedgerEntry["kind"], number> = {
    payment: 0,
    document: 1,
    vendor: 2,
    department: 3,
  };

  return statusPriority[a.status] - statusPriority[b.status] || kindPriority[a.kind] - kindPriority[b.kind] || a.date.localeCompare(b.date) || a.title.localeCompare(b.title);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
