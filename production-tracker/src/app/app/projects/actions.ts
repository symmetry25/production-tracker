"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { canManageProjects } from "@/lib/permissions";
import { bootstrapProjectWorkspace } from "@/lib/project-bootstrap";
import { getPrisma } from "@/lib/prisma";

export type CreateProjectState = {
  error?: string;
};

const projectFormSchema = z.object({
  name: z.string().trim().min(2, "请输入项目名称。"),
  code: z
    .string()
    .trim()
    .min(2, "请输入项目代号。")
    .max(16, "项目代号不要超过 16 个字符。")
    .transform((value) => value.toUpperCase().replaceAll(" ", "_")),
  description: z.string().trim().optional(),
  startDate: z.iso.date("请选择开始日期。"),
  dueDate: z.iso.date("请选择截止日期。"),
  milestone: z.string().trim().optional(),
  milestoneDate: z.iso.date().optional().or(z.literal("")),
  bootstrap: z.boolean().default(true),
});

export async function createProjectAction(_: CreateProjectState, formData: FormData): Promise<CreateProjectState> {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!canManageProjects(session.user)) {
    return { error: "只有管理员和制片可以创建项目。" };
  }

  const parsed = projectFormSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    description: formData.get("description"),
    startDate: formData.get("startDate"),
    dueDate: formData.get("dueDate"),
    milestone: formData.get("milestone"),
    milestoneDate: formData.get("milestoneDate"),
    bootstrap: formData.get("bootstrap") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "项目信息不完整。" };
  }

  try {
    const prisma = getPrisma();
    const existing = await prisma.project.findUnique({ where: { code: parsed.data.code }, select: { id: true } });

    if (existing) {
      return { error: "这个项目代号已经存在，请换一个。" };
    }

    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        code: parsed.data.code,
        description: parsed.data.description || null,
        startDate: new Date(parsed.data.startDate),
        dueDate: new Date(parsed.data.dueDate),
        milestone: parsed.data.milestone || null,
        milestoneDate: parsed.data.milestoneDate ? new Date(parsed.data.milestoneDate) : null,
      },
    });

    if (parsed.data.bootstrap) {
      await bootstrapProjectWorkspace(prisma, project);
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "创建项目失败。" };
  }

  revalidatePath("/app/projects");
  redirect("/app/projects");
}
