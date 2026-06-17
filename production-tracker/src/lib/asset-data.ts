import type { AssetType, TaskStatus } from "@/generated/prisma/enums";
import { PIPELINE_STEPS } from "@/lib/status-colors";
import { getPrisma } from "@/lib/prisma";

export type AssetPipelineTask = {
  id: string;
  name: string;
  status: TaskStatus;
};

export type AssetTableItem = {
  id: string;
  name: string;
  type: AssetType;
  status: TaskStatus;
  description: string | null;
  thumbnailUrl: string | null;
  linkedShots: {
    id: string;
    code: string;
  }[];
  pipeline: Record<string, AssetPipelineTask | null>;
};

export async function getAssetTableItems(projectId: string): Promise<AssetTableItem[]> {
  const prisma = getPrisma();
  const assets = await prisma.asset.findMany({
    where: { projectId },
    orderBy: [{ type: "asc" }, { name: "asc" }],
    include: {
      linkedShots: {
        include: {
          shot: {
            select: {
              id: true,
              code: true,
            },
          },
        },
      },
      tasks: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
  });

  return assets.map((asset) => {
    const pipeline: Record<string, AssetPipelineTask | null> = Object.fromEntries(
      PIPELINE_STEPS.map((step) => [step, null]),
    );

    for (const task of asset.tasks) {
      pipeline[task.name] = task;
    }

    return {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      status: asset.status,
      description: asset.description,
      thumbnailUrl: asset.thumbnailUrl,
      linkedShots: asset.linkedShots.map((link) => link.shot),
      pipeline,
    };
  });
}
