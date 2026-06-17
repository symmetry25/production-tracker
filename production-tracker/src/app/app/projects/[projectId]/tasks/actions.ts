"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { TaskStatus } from "@/generated/prisma/enums";

import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

export type CreateTaskState = {
  error?: string;
};

const createTaskFormSchema = z
  .object({
    name: z.string().trim().min(2, "请输入任务名称。").max(80, "任务名称不要超过 80 个字符。"),
    sourceType: z.enum(["shot", "asset"]),
    shotId: z.string().trim().optional(),
    assetId: z.string().trim().optional(),
    status: z.enum(TaskStatus),
    priority: z.coerce.number().int().min(0).max(2),
    startDate: z.string().trim().optional(),
    dueDate: z.string().trim().optional(),
    duration: z.coerce.number().int().min(0).optional().or(z.literal("")),
    timeLogged: z.coerce.number().min(0).optional().or(z.literal("")),
    estimatedCost: z.coerce.number().min(0).optional().or(z.literal("")),
    assigneeId: z.string().trim().optional(),
    reviewerId: z.string().trim().optional(),
  })
  .transform((value) => ({
    ...value,
    shotId: value.sourceType === "shot" ? value.shotId : undefined,
    assetId: value.sourceType === "asset" ? value.assetId : undefined,
    duration: value.duration === "" ? undefined : value.duration,
    timeLogged: value.timeLogged === "" ? 0 : value.timeLogged,
    estimatedCost: value.estimatedCost === "" ? undefined : value.estimatedCost,
    assigneeIds: value.assigneeId ? [value.assigneeId] : [],
    reviewerId: value.reviewerId || undefined,
  }))
  .refine((value) => Boolean(value.shotId) !== Boolean(value.assetId), {
    message: "请选择一个 Shot 或 Asset 作为任务来源。",
    path: ["sourceType"],
  });

export async function createTaskAction(
  projectId: string,
  _: CreateTaskState,
  formData: FormData,
): Promise<CreateTaskState> {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const parsed = createTaskFormSchema.safeParse({
    name: formData.get("name"),
    sourceType: formData.get("sourceType"),
    shotId: formData.get("shotId"),
    assetId: formData.get("assetId"),
    status: formData.get("status") || TaskStatus.WAITING_TO_START,
    priority: formData.get("priority") || 0,
    startDate: formData.get("startDate"),
    dueDate: formData.get("dueDate"),
    duration: formData.get("duration") || "",
    timeLogged: formData.get("timeLogged") || "",
    estimatedCost: formData.get("estimatedCost") || "",
    assigneeId: formData.get("assigneeId"),
    reviewerId: formData.get("reviewerId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "任务信息不完整。" };
  }

  try {
    const prisma = getPrisma();
    await prisma.task.create({
      data: {
        name: parsed.data.name,
        shotId: parsed.data.shotId,
        assetId: parsed.data.assetId,
        status: parsed.data.status,
        priority: parsed.data.priority,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        duration: parsed.data.duration,
        timeLogged: parsed.data.timeLogged,
        estimatedCost: parsed.data.estimatedCost,
        assignments: {
          create: parsed.data.assigneeIds.map((userId) => ({
            userId,
            reviewerId: parsed.data.reviewerId ?? null,
          })),
        },
      },
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "创建任务失败。" };
  }

  revalidatePath(`/app/projects/${projectId}/tasks`);
  return {};
}
