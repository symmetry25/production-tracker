import type { TaskStatus } from "@/generated/prisma/enums";
import { PIPELINE_STEPS } from "@/lib/status-colors";
import { getPrisma } from "@/lib/prisma";

export type ShotPipelineTask = {
  id: string;
  name: string;
  status: TaskStatus;
  dueDate: Date | null;
  assignees: string[];
};

export type ShotTableItem = {
  id: string;
  code: string;
  description: string | null;
  cutIn: number | null;
  cutOut: number | null;
  cutDuration: number | null;
  status: TaskStatus;
  sequenceCode: string;
  pipeline: Record<string, ShotPipelineTask | null>;
};

export async function getShotTableItems(projectId: string): Promise<ShotTableItem[]> {
  const prisma = getPrisma();
  const shots = await prisma.shot.findMany({
    where: { projectId },
    orderBy: [{ sequence: { code: "asc" } }, { code: "asc" }],
    include: {
      sequence: { select: { code: true } },
      tasks: {
        orderBy: { name: "asc" },
        include: {
          assignments: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  return shots.map((shot) => {
    const pipeline: Record<string, ShotPipelineTask | null> = Object.fromEntries(
      PIPELINE_STEPS.map((step) => [step, null]),
    );

    for (const task of shot.tasks) {
      pipeline[task.name] = {
        id: task.id,
        name: task.name,
        status: task.status,
        dueDate: task.dueDate,
        assignees: task.assignments.map((assignment) => assignment.user.name),
      };
    }

    return {
      id: shot.id,
      code: shot.code,
      description: shot.description,
      cutIn: shot.cutIn,
      cutOut: shot.cutOut,
      cutDuration: shot.cutDuration,
      status: shot.status,
      sequenceCode: shot.sequence?.code ?? "NO_SEQUENCE",
      pipeline,
    };
  });
}
