"use client";

import { useState } from "react";

export function WidgetActions({ dashboardId, widgetId }: { dashboardId: string; widgetId: string }) {
  const [status, setStatus] = useState<"idle" | "deleting" | "deleted" | "error">("idle");

  async function deleteWidget() {
    setStatus("deleting");
    const response = await fetch(`/api/dashboards/${dashboardId}/widgets/${widgetId}`, { method: "DELETE" });
    setStatus(response.ok ? "deleted" : "error");
  }

  return (
    <div className="mt-4 flex items-center gap-2">
      <button type="button" onClick={deleteWidget} disabled={status === "deleting" || status === "deleted"} className="border border-[#4a2b24] px-2 py-1 text-[11px] text-[#ff9c8c] hover:border-[#e24b4a] disabled:opacity-45">
        {status === "deleting" ? "删除中" : status === "deleted" ? "已删除" : "删除 Widget"}
      </button>
      {status === "deleted" ? <span className="text-[11px] text-[#83d6ae]">Widget 已删除</span> : null}
      {status === "error" ? <span className="text-[11px] text-[#ff9c8c]">删除失败</span> : null}
    </div>
  );
}
