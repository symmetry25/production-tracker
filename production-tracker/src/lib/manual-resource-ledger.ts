import type { ResourceLedgerEntry } from "@/lib/resource-ledger";
import { sortResourceLedgerEntries } from "@/lib/resource-ledger";

export type ManualLedgerDraft = {
  kind: ResourceLedgerEntry["kind"];
  status: ResourceLedgerEntry["status"];
  owner: string;
  title: string;
  amount?: string | number | null;
  date: string;
  evidence: string;
  nextStep: string;
};

export type ManualLedgerValidation =
  | { ok: true; entry: ResourceLedgerEntry }
  | { ok: false; errors: string[] };

export function createManualLedgerEntry(draft: ManualLedgerDraft, sequence = 1): ManualLedgerValidation {
  const errors: string[] = [];
  const owner = draft.owner.trim();
  const title = draft.title.trim();
  const evidence = draft.evidence.trim();
  const nextStep = draft.nextStep.trim();
  const amount = parseAmount(draft.amount);

  if (!owner) errors.push("owner is required");
  if (!title) errors.push("title is required");
  if (!draft.date || Number.isNaN(Date.parse(`${draft.date}T00:00:00Z`))) errors.push("valid date is required");
  if (amount !== null && amount < 0) errors.push("amount must be zero or greater");
  if (!evidence) errors.push("evidence is required");
  if (!nextStep) errors.push("next step is required");

  if (errors.length) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    entry: {
      id: `manual-${draft.kind}-${slugify(owner)}-${sequence}`,
      date: draft.date,
      kind: draft.kind,
      owner,
      title,
      amount,
      status: draft.status,
      evidence,
      nextStep,
    },
  };
}

export function mergeManualLedgerEntries(entries: ResourceLedgerEntry[], manualEntries: ResourceLedgerEntry[]) {
  const merged = new Map(entries.map((entry) => [entry.id, entry]));
  for (const entry of manualEntries) {
    merged.set(entry.id, entry);
  }
  return Array.from(merged.values()).sort(sortResourceLedgerEntries);
}

function parseAmount(value: ManualLedgerDraft["amount"]) {
  if (value === null || value === undefined || value === "") return null;
  const amount = typeof value === "number" ? value : Number(value.replaceAll(",", ""));
  return Number.isFinite(amount) ? amount : -1;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "") || "entry";
}
