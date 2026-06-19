"use client";

import { downloadWorkbookXlsx, type WorkbookSheet } from "@/lib/csv";
import type { ResourceBudgetData, VendorSpend } from "@/lib/resource-data";

const vendorCategoryLabels: Record<VendorSpend["category"], string> = {
  equipment: "器材",
  vehicle: "车辆",
  hotel: "酒店住宿",
  location: "场地",
  vfx: "VFX",
  production: "制片",
};

export function ResourceExportButton({ data }: { data: ResourceBudgetData }) {
  return (
    <button
      type="button"
      onClick={() => downloadWorkbookXlsx(`resource-audit-${slugify(data.project.name)}.xlsx`, buildResourceWorkbook(data))}
      className="h-10 border border-[#3f3c33] px-3 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678]"
    >
      Export audit XLSX
    </button>
  );
}

function buildResourceWorkbook(data: ResourceBudgetData): WorkbookSheet[] {
  const totalDepartmentBudget = data.departments.reduce((sum, department) => sum + department.budget, 0);
  const totalPeopleCost = data.people.reduce((sum, person) => sum + person.total, 0);
  const totalVendorSpend = data.vendors.reduce((sum, vendor) => sum + vendor.amount, 0);
  const blockedPayments = data.payments.filter((payment) => payment.status === "blocked");
  const missingDocuments = data.documents.reduce((sum, document) => sum + Math.max(0, document.required - document.received), 0);

  return [
    {
      name: "Summary",
      rows: [
        ["project", data.project.name],
        ["total_budget", data.project.totalBudget],
        ["committed_total", data.project.committedTotal],
        ["actual_total", data.project.actualTotal],
        ["department_budget_total", totalDepartmentBudget],
        ["people_cost_total", totalPeopleCost],
        ["vendor_spend_total", totalVendorSpend],
        ["blocked_payment_count", blockedPayments.length],
        ["blocked_payment_total", blockedPayments.reduce((sum, payment) => sum + payment.amount, 0)],
        ["missing_document_count", missingDocuments],
        [],
        ["risk", "severity", "amount", "detail"],
        ...data.insights.map((insight) => [insight.title, insight.severity, insight.amount ?? "", insight.detail]),
      ],
    },
    {
      name: "Departments",
      rows: [
        ["department", "budget", "committed", "actual", "actual_pct", "committed_pct", "risk"],
        ...data.departments.map((department) => [
          department.name,
          department.budget,
          department.committed,
          department.actual,
          pct(department.actual, department.budget),
          pct(department.committed, department.budget),
          department.risk,
        ]),
      ],
    },
    {
      name: "People",
      rows: [
        ["name", "role", "department", "company_vendor", "grade", "trust_score", "day_rate", "days", "total"],
        ...data.people.map((person) => [
          person.name,
          person.role,
          person.department,
          person.vendor,
          person.grade,
          person.trustScore,
          person.dayRate,
          person.days,
          person.total,
        ]),
      ],
    },
    {
      name: "Vendors",
      rows: [
        ["vendor", "category", "owner_department", "amount", "status", "progress_pct", "audit_flag"],
        ...data.vendors.map((vendor) => [
          vendor.name,
          vendorCategoryLabels[vendor.category],
          vendor.owner,
          vendor.amount,
          vendor.status,
          vendor.progress,
          vendor.auditFlag,
        ]),
      ],
    },
    {
      name: "Payments",
      rows: [
        ["milestone", "vendor", "due_date", "amount", "status", "gate"],
        ...data.payments.map((payment) => [
          payment.label,
          payment.vendorName,
          payment.dueDate,
          payment.amount,
          payment.status,
          payment.gate,
        ]),
      ],
    },
    {
      name: "Documents",
      rows: [
        ["owner", "category", "required", "received", "missing_count", "missing_items", "severity"],
        ...data.documents.map((document) => [
          document.owner,
          document.category,
          document.required,
          document.received,
          Math.max(0, document.required - document.received),
          document.missing.join(" / "),
          document.severity,
        ]),
      ],
    },
    {
      name: "Fund Flow",
      rows: [
        ["from", "to", "amount", "share_of_budget_pct"],
        ...data.fundFlow.map((link) => [
          link.from,
          link.to,
          link.amount,
          pct(link.amount, data.project.totalBudget),
        ]),
      ],
    },
  ];
}

function pct(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 1000) / 10 : 0;
}

function slugify(value: string) {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
}
