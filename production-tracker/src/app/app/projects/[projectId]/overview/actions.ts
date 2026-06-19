"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { shouldUseDemoData } from "@/lib/demo-data";
import { canManageProjects } from "@/lib/permissions";
import { getPrisma } from "@/lib/prisma";
import { storeUploadedFile } from "@/lib/storage";
import { validateUploadFile } from "@/lib/upload-validation";

export type UpdateProjectState = {
  error?: string;
  success?: string;
};

const projectSettingsSchema = z.object({
  name: z.string().trim().min(2, "请输入项目名称。"),
  code: z
    .string()
    .trim()
    .min(2, "请输入项目代号。")
    .max(16, "项目代号不要超过 16 个字符。")
    .transform((value) => value.toUpperCase().replaceAll(" ", "_")),
  description: z.string().trim().optional(),
  thumbnailUrl: z.string().trim().optional(),
  startDate: z.iso.date("请选择开始日期。"),
  dueDate: z.iso.date("请选择截止日期。"),
  milestone: z.string().trim().optional(),
  milestoneDate: z.iso.date().optional().or(z.literal("")),
});

export async function updateProjectSettingsAction(projectId: string, _: UpdateProjectState, formData: FormData): Promise<UpdateProjectState> {
  const session = await auth();

  if (!session?.user) {
    return { error: "请先登录。" };
  }

  if (!canManageProjects(session.user)) {
    return { error: "只有管理员和制片可以更新项目。" };
  }

  if (shouldUseDemoData()) {
    return { error: "演示模式不可保存项目设置，请连接数据库后再编辑。" };
  }

  const parsed = projectSettingsSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    description: formData.get("description"),
    thumbnailUrl: formData.get("thumbnailUrl"),
    startDate: formData.get("startDate"),
    dueDate: formData.get("dueDate"),
    milestone: formData.get("milestone"),
    milestoneDate: formData.get("milestoneDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "项目信息不完整。" };
  }

  if (new Date(parsed.data.dueDate) < new Date(parsed.data.startDate)) {
    return { error: "截止日期不能早于开始日期。" };
  }

  try {
    const prisma = getPrisma();
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true, code: true, thumbnailUrl: true } });

    if (!project) {
      return { error: "项目不存在。" };
    }

    const existing = await prisma.project.findUnique({ where: { code: parsed.data.code }, select: { id: true } });
    if (existing && existing.id !== projectId) {
      return { error: "这个项目代号已经被其它项目使用。" };
    }

    const thumbnail = formData.get("thumbnail");
    let thumbnailUrl = parsed.data.thumbnailUrl || project.thumbnailUrl;

    if (thumbnail instanceof File && thumbnail.size > 0) {
      const fileValidation = validateUploadFile(thumbnail, "project-thumbnail");
      if (!fileValidation.valid) {
        return { error: fileValidation.message };
      }

      const storedThumbnail = await storeUploadedFile({
        file: thumbnail,
        keyPrefix: `projects/${parsed.data.code}/thumbnail`,
        fileName: thumbnail.name || `${parsed.data.code}-thumbnail`,
      });
      thumbnailUrl = storedThumbnail.publicUrl;
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        name: parsed.data.name,
        code: parsed.data.code,
        description: parsed.data.description || null,
        thumbnailUrl: thumbnailUrl || null,
        startDate: new Date(parsed.data.startDate),
        dueDate: new Date(parsed.data.dueDate),
        milestone: parsed.data.milestone || null,
        milestoneDate: parsed.data.milestoneDate ? new Date(parsed.data.milestoneDate) : null,
      },
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "更新项目失败。" };
  }

  revalidatePath("/app/projects");
  revalidatePath(`/app/projects/${projectId}/overview`);
  return { success: "项目设置已更新。" };
}
