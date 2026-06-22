"use client";

import { useEffect, useMemo, useState } from "react";

import { createManualLedgerEntry, mergeManualLedgerEntries, type ManualLedgerDraft } from "@/lib/manual-resource-ledger";
import type { ResourceLedgerEntry } from "@/lib/resource-ledger";

type ManualLedgerPanelProps = {
  projectId: string;
  baseEntries: ResourceLedgerEntry[];
};

const storagePrefix = "production-tracker:manual-ledger:";
const emptyDraft: ManualLedgerDraft = {
  kind: "payment",
  status: "hold",
  owner: "",
  title: "",
  amount: "",
  date: "2026-06-25",
  evidence: "",
  nextStep: "",
};

const kindLabels: Record<ResourceLedgerEntry["kind"], string> = {
  payment: "付款",
  vendor: "供应商",
  document: "材料",
  department: "部门",
};

const statusLabels: Record<ResourceLedgerEntry["status"], string> = {
  hold: "HOLD",
  watch: "WATCH",
  clear: "CLEAR",
  closed: "CLOSED",
};

export function ManualLedgerPanel({ projectId, baseEntries }: ManualLedgerPanelProps) {
  const storageKey = `${storagePrefix}${projectId}`;
  const [draft, setDraft] = useState<ManualLedgerDraft>(emptyDraft);
  const [manualEntries, setManualEntries] = useState<ResourceLedgerEntry[]>([]);
  const [loadedStorageKey, setLoadedStorageKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (!active) return;
      setManualEntries(loadManualEntries(storageKey));
      setLoadedStorageKey(storageKey);
    });

    return () => {
      active = false;
    };
  }, [storageKey]);

  useEffect(() => {
    if (loadedStorageKey !== storageKey) return;
    window.localStorage.setItem(storageKey, JSON.stringify(manualEntries));
  }, [loadedStorageKey, manualEntries, storageKey]);

  const mergedEntries = useMemo(() => mergeManualLedgerEntries(baseEntries, manualEntries), [baseEntries, manualEntries]);
  const manualHoldTotal = manualEntries.filter((entry) => entry.status === "hold").reduce((sum, entry) => sum + Math.max(0, entry.amount ?? 0), 0);

  function updateDraft<K extends keyof ManualLedgerDraft>(key: K, value: ManualLedgerDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors([]);
  }

  function addEntry() {
    const result = createManualLedgerEntry(draft, manualEntries.length + 1);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setManualEntries((current) => mergeManualLedgerEntries(current, [result.entry]));
    setDraft(emptyDraft);
    setErrors([]);
  }

  function clearManualEntries() {
    setManualEntries([]);
    setErrors([]);
  }

  return (
    <section className="mb-5 border border-[#34322b] bg-[#181713]">
      <div className="grid grid-cols-[420px_1fr]">
        <div className="border-r border-[#34322b] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b46a]">manual ledger input</p>
          <h2 className="mt-2 text-lg font-semibold text-[#f4f1e8]">手动录入审计事项</h2>
          <p className="mt-2 text-xs leading-6 text-[#8f8a7e]">
            临时供应商、付款、发票、酒店住宿、车辆押金等事项可以先录入本机台账，保存后立刻进入右侧审计排序。
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <SelectField label="类型" value={draft.kind} onChange={(value) => updateDraft("kind", value as ResourceLedgerEntry["kind"])} options={kindLabels} />
            <SelectField label="状态" value={draft.status} onChange={(value) => updateDraft("status", value as ResourceLedgerEntry["status"])} options={statusLabels} />
            <TextField label="对象/部门" value={draft.owner} onChange={(value) => updateDraft("owner", value)} placeholder="例如 Harbor Hotel" />
            <TextField label="日期" value={draft.date} onChange={(value) => updateDraft("date", value)} placeholder="2026-06-25" />
            <TextField label="事项" value={draft.title} onChange={(value) => updateDraft("title", value)} placeholder="酒店尾款复核" wide />
            <TextField label="金额" value={String(draft.amount ?? "")} onChange={(value) => updateDraft("amount", value)} placeholder="54000" />
            <TextField label="证据" value={draft.evidence} onChange={(value) => updateDraft("evidence", value)} placeholder="缺住宿名单/发票/签收单" wide />
            <TextField label="下一步" value={draft.nextStep} onChange={(value) => updateDraft("nextStep", value)} placeholder="暂缓付款，补齐材料后复核" wide />
          </div>

          {errors.length ? <p className="mt-3 border border-[#743434] bg-[#281818] px-3 py-2 text-xs text-[#ff8b7c]">{errors.join(" / ")}</p> : null}

          <div className="mt-4 flex items-center justify-between gap-3">
            <button type="button" onClick={addEntry} className="h-9 border border-[#d8b46a]/55 bg-[#d8b46a]/10 px-3 text-xs font-semibold text-[#e8c678] transition hover:bg-[#d8b46a]/15">
              保存到台账
            </button>
            <button type="button" onClick={clearManualEntries} className="h-9 border border-[#34322b] px-3 text-xs text-[#8f8a7e] transition hover:border-[#d8b46a] hover:text-[#e8c678]">
              清空手动项
            </button>
          </div>
        </div>

        <div className="min-w-0 p-4">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f7a70]">merged control list</p>
              <h3 className="mt-2 text-lg font-semibold text-[#f4f1e8]">合并后的审计决策清单</h3>
            </div>
            <div className="grid grid-cols-2 border border-[#34322b] text-right text-xs">
              <MiniLedgerMetric label="手动条目" value={manualEntries.length.toString()} />
              <MiniLedgerMetric label="手动冻结" value={formatMoney(manualHoldTotal)} />
            </div>
          </div>

          <div className="mt-4 overflow-hidden border border-[#2a2a28]">
            <div className="grid grid-cols-[74px_74px_1fr_92px_1.1fr] bg-[#1e1e1c] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6e6e69]">
              <span>Status</span>
              <span>Type</span>
              <span>Item</span>
              <span>Amount</span>
              <span>Next step</span>
            </div>
            {mergedEntries.slice(0, 8).map((entry) => (
              <div key={entry.id} className="grid min-h-14 grid-cols-[74px_74px_1fr_92px_1.1fr] border-t border-[#2a2a28] px-3 py-2 text-xs">
                <span className={["h-fit w-fit border px-2 py-1 font-semibold", statusClass(entry.status)].join(" ")}>{statusLabels[entry.status]}</span>
                <span className="text-[#aaa599]">{kindLabels[entry.kind]}</span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-[#f4f1e8]">{entry.title}</p>
                  <p className="mt-1 truncate text-[#7f7a70]">{entry.owner} · {entry.evidence}</p>
                </div>
                <span className="font-mono text-[#e8c678]">{entry.amount === null ? "--" : formatMoney(entry.amount)}</span>
                <p className="leading-5 text-[#c9c3b5]">{entry.nextStep}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs">
      <span className="text-[#7f7a70]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-9 w-full border border-[#34322b] bg-[#11110f] px-2 text-[#f4f1e8] outline-none focus:border-[#d8b46a]">
        {Object.entries(options).map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  label,
  value,
  placeholder,
  wide = false,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  wide?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className={["block text-xs", wide ? "col-span-2" : ""].join(" ")}>
      <span className="text-[#7f7a70]">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1 h-9 w-full border border-[#34322b] bg-[#11110f] px-2 text-[#f4f1e8] outline-none placeholder:text-[#555048] focus:border-[#d8b46a]" />
    </label>
  );
}

function MiniLedgerMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-28 border-l border-[#34322b] px-3 py-2 first:border-l-0">
      <p className="text-[#7f7a70]">{label}</p>
      <p className="mt-1 font-mono text-[#e8c678]">{value}</p>
    </div>
  );
}

function statusClass(status: ResourceLedgerEntry["status"]) {
  if (status === "hold") return "border-[#743434] bg-[#281818] text-[#ff8b7c]";
  if (status === "watch") return "border-[#6f5631] bg-[#211b12] text-[#e8c678]";
  if (status === "closed") return "border-[#34322b] bg-[#11110f] text-[#8f8a7e]";
  return "border-[#224b39] bg-[#13251d] text-[#75d9a7]";
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function isLedgerEntry(value: unknown): value is ResourceLedgerEntry {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<ResourceLedgerEntry>;
  return Boolean(item.id && item.kind && item.status && item.owner && item.title && item.date && item.evidence && item.nextStep);
}

function loadManualEntries(storageKey: string) {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isLedgerEntry) : [];
  } catch {
    window.localStorage.removeItem(storageKey);
    return [];
  }
}
