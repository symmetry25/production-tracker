import { shouldUseDemoData } from "@/lib/demo-data";
import { getPrisma } from "@/lib/prisma";

export type PhaseItem = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  taskCount: number;
};

export type WorkOrderItem = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
};

const demoPhases: PhaseItem[] = [
  { id: "demo-phase-prep", name: "Prep / Breakdown", startDate: "2026-05-01", endDate: "2026-05-12", taskCount: 3 },
  { id: "demo-phase-shoot", name: "Principal Production", startDate: "2026-05-13", endDate: "2026-06-15", taskCount: 7 },
  { id: "demo-phase-post", name: "Post / VFX Review", startDate: "2026-06-16", endDate: "2026-07-18", taskCount: 5 },
];

const demoWorkOrders: WorkOrderItem[] = [
  {
    id: "demo-workorder-vfx-v003",
    title: "VFX v003 payment gate review",
    description: "Confirm approved status, supervisor notes, and vendor delivery list before payment release.",
    status: "review",
    createdAt: "2026-06-08T09:00:00.000Z",
  },
  {
    id: "demo-workorder-vehicle-split",
    title: "Vehicle and generator cost split",
    description: "Split transport, generator, fuel, and driver allowance into separate audit lines.",
    status: "open",
    createdAt: "2026-06-10T10:20:00.000Z",
  },
  {
    id: "demo-workorder-hotel-list",
    title: "Hotel rooming list confirmation",
    description: "Lock final rooming list and night shoot accommodation extension.",
    status: "scheduled",
    createdAt: "2026-06-12T14:30:00.000Z",
  },
];

export async function getProjectPhases(projectId: string): Promise<PhaseItem[]> {
  if (shouldUseDemoData()) {
    return demoPhases;
  }

  const prisma = getPrisma();
  const phases = await prisma.phase.findMany({
    where: { projectId },
    orderBy: { startDate: "asc" },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  });

  return phases.map((phase) => ({
    id: phase.id,
    name: phase.name,
    startDate: phase.startDate.toISOString().slice(0, 10),
    endDate: phase.endDate.toISOString().slice(0, 10),
    taskCount: phase._count.tasks,
  }));
}

export async function getProjectWorkOrders(projectId: string): Promise<WorkOrderItem[]> {
  if (shouldUseDemoData()) {
    return demoWorkOrders;
  }

  const prisma = getPrisma();
  const workOrders = await prisma.workOrder.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return workOrders.map((workOrder) => ({
    id: workOrder.id,
    title: workOrder.title,
    description: workOrder.description,
    status: workOrder.status,
    createdAt: workOrder.createdAt.toISOString(),
  }));
}
