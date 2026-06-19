"use client";

export function ResourcePrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="h-9 border border-[#3f3c33] px-3 text-xs font-semibold text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678] print:hidden"
    >
      打印 / 保存 PDF
    </button>
  );
}
