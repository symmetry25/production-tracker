"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AssetType, TaskStatus } from "@/generated/prisma/enums";

import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { PIPELINE_STEPS } from "@/lib/status-colors";

export type CreateAssetState = {
  error?: string;
};

const createAssetFormSchema = z.object({
  name: z.string().trim().min(2, "请输入资产名称。").max(80, "资产名称不要超过 80 个字符。"),
  type: z.enum(AssetType),
  description: z.string().trim().optional(),
  thumbnailUrl: z.string().trim().optional(),
});

export async function createAssetAction(
  projectId: string,
  _: CreateAssetState,
  formData: FormData,
): Promise<CreateAssetState> {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const parsed = createAssetFormSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    description: formData.get("description"),
    thumbnailUrl: formData.get("thumbnailUrl"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "资产信息不完整。" };
  }

  try {
    const prisma = getPrisma();
    await prisma.asset.create({
      data: {
        projectId,
        name: parsed.data.name,
        type: parsed.data.type,
        description: parsed.data.description || null,
        thumbnailUrl: parsed.data.thumbnailUrl || null,
        tasks: {
          create: PIPELINE_STEPS.map((step) => ({
            name: step,
            status: TaskStatus.WAITING_TO_START,
          })),
        },
      },
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "创建资产失败。" };
  }

  revalidatePath(`/app/projects/${projectId}/assets`);
  return {};
}
