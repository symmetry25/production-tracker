import type { VersionStatus } from "@/generated/prisma/enums";

import {
  getDemoProjectReviewTaskOptions,
  getDemoProjectReviewVersions,
  getDemoTaskReviewVersions,
  shouldUseDemoData,
} from "@/lib/demo-data";
import { getPrisma } from "@/lib/prisma";

export type ReviewNote = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    department: string | null;
  };
};

export type ReviewVersionItem = {
  id: string;
  number: number;
  name: string;
  status: VersionStatus;
  fileUrl: string;
  fileType: string;
  thumbnailUrl: string | null;
  description: string | null;
  frameCount: number | null;
  fps: number | null;
  createdAt: string;
  uploadedBy: {
    id: string;
    name: string;
    department: string | null;
  };
  task: {
    id: string;
    name: string;
    contextLabel: string;
    contextType: "shot" | "asset" | "task";
  };
  notes: ReviewNote[];
};

export type ReviewTaskOption = {
  id: string;
  name: string;
  contextLabel: string;
};

export async function getProjectReviewVersions(projectId: string): Promise<ReviewVersionItem[]> {
  if (shouldUseDemoData()) {
    return getDemoProjectReviewVersions(projectId);
  }

  const prisma = getPrisma();
  const versions = await prisma.version.findMany({
    where: {
      task: {
        OR: [{ shot: { projectId } }, { asset: { projectId } }],
      },
    },
    orderBy: [{ createdAt: "desc" }, { number: "desc" }],
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
          department: true,
        },
      },
      task: {
        include: {
          shot: { select: { code: true } },
          asset: { select: { name: true } },
        },
      },
      notes: {
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              department: true,
            },
          },
        },
      },
    },
  });

  return versions.map(mapVersion);
}

export async function getProjectReviewTaskOptions(projectId: string): Promise<ReviewTaskOption[]> {
  if (shouldUseDemoData()) {
    return getDemoProjectReviewTaskOptions(projectId);
  }

  const prisma = getPrisma();
  const tasks = await prisma.task.findMany({
    where: {
      OR: [{ shot: { projectId } }, { asset: { projectId } }],
    },
    orderBy: [{ shot: { code: "asc" } }, { asset: { name: "asc" } }, { name: "asc" }],
    include: {
      shot: { select: { code: true } },
      asset: { select: { name: true } },
    },
  });

  return tasks.map((task) => ({
    id: task.id,
    name: task.name,
    contextLabel: task.shot?.code ?? task.asset?.name ?? "Task",
  }));
}

export async function getTaskReviewVersions(taskId: string): Promise<ReviewVersionItem[]> {
  if (shouldUseDemoData()) {
    return getDemoTaskReviewVersions(taskId);
  }

  const prisma = getPrisma();
  const versions = await prisma.version.findMany({
    where: { taskId },
    orderBy: [{ number: "desc" }],
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
          department: true,
        },
      },
      task: {
        include: {
          shot: { select: { code: true } },
          asset: { select: { name: true } },
        },
      },
      notes: {
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              department: true,
            },
          },
        },
      },
    },
  });

  return versions.map(mapVersion);
}

export async function getReviewVersion(versionId: string): Promise<ReviewVersionItem | null> {
  if (shouldUseDemoData()) {
    return getDemoProjectReviewVersions("demo-mkali-mission").find((version) => version.id === versionId) ?? null;
  }

  const prisma = getPrisma();
  const version = await prisma.version.findUnique({
    where: { id: versionId },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
          department: true,
        },
      },
      task: {
        include: {
          shot: { select: { code: true } },
          asset: { select: { name: true } },
        },
      },
      notes: {
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              department: true,
            },
          },
        },
      },
    },
  });

  return version ? mapVersion(version) : null;
}

function mapVersion(version: {
  id: string;
  number: number;
  name: string;
  status: VersionStatus;
  fileUrl: string;
  fileType: string;
  thumbnailUrl: string | null;
  description: string | null;
  frameCount: number | null;
  fps: number | null;
  createdAt: Date;
  uploadedBy: { id: string; name: string; department: string | null };
  task: {
    id: string;
    name: string;
    shot: { code: string } | null;
    asset: { name: string } | null;
  };
  notes: {
    id: string;
    content: string;
    createdAt: Date;
    author: { id: string; name: string; department: string | null };
  }[];
}): ReviewVersionItem {
  const contextType = version.task.shot ? "shot" : version.task.asset ? "asset" : "task";

  return {
    id: version.id,
    number: version.number,
    name: version.name,
    status: version.status,
    fileUrl: version.fileUrl,
    fileType: version.fileType,
    thumbnailUrl: version.thumbnailUrl,
    description: version.description,
    frameCount: version.frameCount,
    fps: version.fps,
    createdAt: version.createdAt.toISOString(),
    uploadedBy: version.uploadedBy,
    task: {
      id: version.task.id,
      name: version.task.name,
      contextLabel: version.task.shot?.code ?? version.task.asset?.name ?? "Task",
      contextType,
    },
    notes: version.notes.map((note) => ({
      id: note.id,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
      author: note.author,
    })),
  };
}
