import Link from "next/link";

import { auth } from "@/auth";
import { getMyTaskItems } from "@/lib/global-pages-data";
import { STATUS_COLORS } from "@/lib/status-colors";

export default async function MyTasksPage() {
  const session = await auth();
  const tasks = await getMyTaskItems("demo-mkali-mission", session?.user?.id);

  return (
    <>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">My Tasks</p>
        <h1 className="mt-2 text-3xl font-semibold">我的任务</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#aaa599]">查看当前用户相关任务；演示模式下会显示一组重点任务。</p>
      </div>

      <section className="border border-[#34322b] bg-[#181713]">
        {tasks.map((task) => (
          <Link key={task.id} href="/app/projects/demo-mkali-mission/tasks" className="grid grid-cols-[1fr_140px_160px_120px] border-b border-[#2a2a28] px-4 py-3 text-sm hover:bg-[#252523]">
            <div>
              <p className="font-medium text-[#f4f1e8]">{task.context.label} / {task.name}</p>
              <p className="mt-1 text-xs text-[#8f8a7e]">{task.assignees.map((assignee) => assignee.name).join(", ") || "Unassigned"}</p>
            </div>
            <span className="text-xs" style={{ color: STATUS_COLORS[task.status].dot }}>{STATUS_COLORS[task.status].label}</span>
            <span className="font-mono text-xs text-[#aaa599]">{task.startDate?.slice(0, 10) ?? "--"} → {task.dueDate?.slice(0, 10) ?? "--"}</span>
            <span className={task.overBudget ? "font-mono text-xs text-[#ff8b7c]" : "font-mono text-xs text-[#e8c678]"}>${task.calculatedCost.toLocaleString()}</span>
          </Link>
        ))}
      </section>
    </>
  );
}
