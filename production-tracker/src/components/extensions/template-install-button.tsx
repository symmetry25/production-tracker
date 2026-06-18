"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TemplateInstallButton({ templateId, templateName }: { templateId: string; templateName: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const router = useRouter();

  async function installTemplate() {
    setState("loading");
    const response = await fetch(`/api/templates/${templateId}/install`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: "demo-mkali-mission", customName: `${templateName} 副本` }),
    });

    if (!response.ok) {
      setState("error");
      return;
    }

    setState("done");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={installTemplate}
      disabled={state === "loading"}
      className="mt-3 h-8 border border-[#3f3c33] px-3 text-xs text-[#c9c3b5] transition hover:border-[#d8b46a] hover:text-[#e8c678] disabled:opacity-50"
    >
      {state === "loading" ? "安装中..." : state === "done" ? "已安装" : state === "error" ? "重试安装" : "安装模板"}
    </button>
  );
}
