import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { canUploadVersions } from "@/lib/permissions";
import { getPrisma } from "@/lib/prisma";
import { getTaskReviewVersions } from "@/lib/review-data";
import { validateUploadFile } from "@/lib/upload-validation";

const versionMetadataSchema = z.object({
  description: z.string().trim().optional(),
  frameCount: z.coerce.number().int().min(0).optional().or(z.literal("")),
  fps: z.coerce.number().min(1).max(240).optional().or(z.literal("")),
});

type TaskRouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function GET(_: Request, ctx: TaskRouteContext) {
  const session = await auth();

  if (!session?.user) {
    return fail("Unauthorized", 401);
  }

  const { taskId } = await ctx.params;

  try {
    return ok(await getTaskReviewVersions(taskId));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to load versions.", 500);
  }
}

export async function POST(request: Request, ctx: TaskRouteContext) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return fail("Unauthorized", 401);
  }

  if (!canUploadVersions(session.user)) {
    return fail("Only artists, supervisors, producers, and admins can upload versions.", 403);
  }

  const { taskId } = await ctx.params;
  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return fail("Invalid multipart payload.", 422);
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return fail("File is required.", 422);
  }

  const fileValidation = validateUploadFile(file, "review-version");
  if (!fileValidation.valid) {
    return fail(fileValidation.message, 422);
  }

  const parsed = versionMetadataSchema.safeParse({
    description: formData.get("description") ?? "",
    frameCount: formData.get("frameCount") ?? "",
    fps: formData.get("fps") ?? "",
  });

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid version metadata.", 422);
  }

  try {
    const prisma = getPrisma();
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        shot: { select: { code: true } },
        asset: { select: { name: true } },
        _count: { select: { versions: true } },
      },
    });

    if (!task) {
      return fail("Task not found.", 404);
    }

    const nextNumber = task._count.versions + 1;
    const extension = path.extname(file.name) || extensionForMime(file.type);
    const safeBaseName = `${resolveTaskBaseName(task)}_${task.name}_v${String(nextNumber).padStart(3, "0")}`
      .replace(/[^a-zA-Z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "");
    const fileName = `${safeBaseName}${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "versions", taskId);
    const publicUrl = `/uploads/versions/${taskId}/${fileName}`;

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), Buffer.from(await file.arrayBuffer()));

    const version = await prisma.version.create({
      data: {
        number: nextNumber,
        name: safeBaseName,
        taskId,
        uploadedById: userId,
        fileUrl: publicUrl,
        fileType: file.type,
        thumbnailUrl: file.type.startsWith("image/") ? publicUrl : null,
        description: parsed.data.description || null,
        frameCount: parsed.data.frameCount === "" ? null : parsed.data.frameCount,
        fps: parsed.data.fps === "" ? 24 : parsed.data.fps,
      },
    });

    return ok(version);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to upload version.", 500);
  }
}

function extensionForMime(type: string) {
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/jpeg") return ".jpg";
  if (type === "video/quicktime") return ".mov";
  return ".mp4";
}

function resolveTaskBaseName(task: { shot: { code: string } | null; asset: { name: string } | null }) {
  return task.shot?.code ?? task.asset?.name ?? "task";
}
