"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { TaskStatus } from "@/generated/prisma/enums";

import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { PIPELINE_STEPS } from "@/lib/status-colors";

export type CreateShotState = {
  error?: string;
};

const createShotFormSchema = z
  .object({
    code: z.string().trim().min(2, "请输入镜头编号。").max(40, "镜头编号不要超过 40 个字符。"),
    sequenceCode: z.string().trim().min(1, "请输入 Sequence。").max(24, "Sequence 不要超过 24 个字符。"),
    description: z.string().trim().optional(),
    cutIn: z.coerce.number().int().optional().or(z.literal("")),
    cutOut: z.coerce.number().int().optional().or(z.literal("")),
  })
  .transform((value) => ({
    ...value,
    code: value.code.toUpperCase(),
    sequenceCode: value.sequenceCode.toUpperCase(),
    cutIn: value.cutIn === "" ? undefined : value.cutIn,
    cutOut: value.cutOut === "" ? undefined : value.cutOut,
  }));

export async function createShotAction(
  projectId: string,
  _: CreateShotState,
  formData: FormData,
): Promise<CreateShotState> {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const parsed = createShotFormSchema.safeParse({
    code: formData.get("code"),
    sequenceCode: formData.get("sequenceCode"),
    description: formData.get("description"),
    cutIn: formData.get("cutIn") || "",
    cutOut: formData.get("cutOut") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "镜头信息不完整。" };
  }

  try {
    const prisma = getPrisma();
    const existing = await prisma.shot.findUnique({
      where: { projectId_code: { projectId, code: parsed.data.code } },
      select: { id: true },
    });

    if (existing) {
      return { error: "这个镜头编号已经存在，请换一个。" };
    }

    const sequence = await prisma.sequence.upsert({
      where: { projectId_code: { projectId, code: parsed.data.sequenceCode } },
      update: {},
      create: {
        projectId,
        code: parsed.data.sequenceCode,
      },
    });

    await prisma.shot.create({
      data: {
        projectId,
        sequenceId: sequence.id,
        code: parsed.data.code,
        description: parsed.data.description || null,
        cutIn: parsed.data.cutIn,
        cutOut: parsed.data.cutOut,
        cutDuration:
          typeof parsed.data.cutIn === "number" && typeof parsed.data.cutOut === "number"
            ? Math.max(0, parsed.data.cutOut - parsed.data.cutIn)
            : null,
        tasks: {
          create: PIPELINE_STEPS.map((step) => ({
            name: step,
            status: TaskStatus.WAITING_TO_START,
          })),
        },
      },
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "创建镜头失败。" };
  }

  revalidatePath(`/app/projects/${projectId}/shots`);
  return {};
}
