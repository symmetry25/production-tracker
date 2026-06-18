"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { listSkills } from "@/lib/scoring";

type Skills = ReturnType<typeof listSkills>;

export function SkillUpdatePanel({ userId, skills }: { userId: string; skills: Skills }) {
  const router = useRouter();
  const [skillId, setSkillId] = useState(skills[0]?.id ?? "");
  const [level, setLevel] = useState("4");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function updateSkill(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    const response = await fetch(`/api/users/${userId}/skills`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills: [{ skillId, level: Number(level), verifiedBy: "demo-user-producer" }] }),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    setStatus("done");
    router.refresh();
  }

  return (
    <form onSubmit={updateSkill} className="border border-[#34322b] bg-[#181713] p-4">
      <div className="flex items-end gap-3">
        <label className="block min-w-72">
          <span className="mb-1 block text-[11px] text-[#8f8a7e]">技能</span>
          <select value={skillId} onChange={(event) => setSkillId(event.target.value)} className="h-9 w-full border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#f4f1e8] outline-none focus:border-[#d8b46a]">
            {skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.category} / {skill.name}</option>)}
          </select>
        </label>
        <label className="block w-32">
          <span className="mb-1 block text-[11px] text-[#8f8a7e]">等级</span>
          <select value={level} onChange={(event) => setLevel(event.target.value)} className="h-9 w-full border border-[#34322b] bg-[#11110f] px-2 text-xs text-[#f4f1e8] outline-none focus:border-[#d8b46a]">
            {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <button type="submit" disabled={status === "saving"} className="h-9 border border-[#d8b46a]/55 bg-[#d8b46a]/10 px-4 text-xs font-semibold text-[#e8c678] disabled:opacity-50">
          {status === "saving" ? "更新中" : "更新技能"}
        </button>
        {status === "done" ? <span className="pb-2 text-xs text-[#83d6ae]">技能已更新</span> : null}
        {status === "error" ? <span className="pb-2 text-xs text-[#ff9c8c]">更新失败</span> : null}
      </div>
    </form>
  );
}
