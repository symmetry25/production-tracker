import { PrismaClient, Role, AssetType, TaskStatus, CalendarExceptionType } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the production tracker database.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const pipelineSteps = [
  { name: "LAY", duration: 3, cost: 120 },
  { name: "ANM", duration: 4, cost: 160 },
  { name: "CFX", duration: 3, cost: 120 },
  { name: "FX", duration: 3, cost: 120 },
  { name: "LGT", duration: 3, cost: 120 },
  { name: "CMP", duration: 2, cost: 80 },
];

async function main() {
  const hash = (password: string) => bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@studio.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@studio.com",
      password: await hash("admin123"),
      role: Role.ADMIN,
      department: "Production",
      capacity: 5,
    },
  });

  const crew = [
    { name: "Alfred Yardley", email: "ay@studio.com", dept: "Layout", role: Role.ARTIST },
    { name: "Andrea Martinez", email: "am@studio.com", dept: "Animation", role: Role.ARTIST },
    { name: "Brian Harley", email: "bh@studio.com", dept: "FX", role: Role.SUPERVISOR },
    { name: "Carlton Sotelo", email: "cs@studio.com", dept: "Comp", role: Role.ARTIST },
    { name: "Carole Vasquez", email: "cv@studio.com", dept: "Lighting", role: Role.ARTIST },
    { name: "Kyle Jones", email: "kj@studio.com", dept: "Art", role: Role.SUPERVISOR },
    { name: "Lucas May", email: "lm@studio.com", dept: "Model", role: Role.ARTIST },
  ];

  const users = [admin];

  for (const member of crew) {
    const user = await prisma.user.upsert({
      where: { email: member.email },
      update: {},
      create: {
        name: member.name,
        email: member.email,
        password: await hash("pass123"),
        role: member.role,
        department: member.dept,
        capacity: 5,
      },
    });

    users.push(user);
  }

  const project = await prisma.project.upsert({
    where: { code: "MKALI" },
    update: {},
    create: {
      name: "Mkali's Mission",
      code: "MKALI",
      startDate: new Date("2022-01-01"),
      dueDate: new Date("2022-06-30"),
      milestone: "Siggraph",
      milestoneDate: new Date("2022-08-08"),
      description: "Sample project for testing production tracking, review, resource planning, and budget flow.",
    },
  });

  const seq = await prisma.sequence.upsert({
    where: { projectId_code: { projectId: project.id, code: "RAID" } },
    update: {},
    create: { code: "RAID", projectId: project.id, description: "Mountain raid sequence" },
  });

  const shotCodes = [
    "RAID_0010",
    "RAID_0020",
    "RAID_0030",
    "RAID_0040",
    "RAID_0050",
    "RAID_0060",
    "RAID_0080",
    "RAID_0090",
    "RAID_0110",
  ];

  for (let index = 0; index < shotCodes.length; index += 1) {
    const code = shotCodes[index];
    const shot = await prisma.shot.upsert({
      where: { projectId_code: { projectId: project.id, code } },
      update: {},
      create: {
        code,
        projectId: project.id,
        sequenceId: seq.id,
        cutIn: 101,
        cutOut: 101 + 100 + index * 30,
        cutDuration: 100 + index * 30,
        status: index < 2 ? TaskStatus.IN_PROGRESS : TaskStatus.WAITING_TO_START,
      },
    });

    for (const [stepIndex, step] of pipelineSteps.entries()) {
      const existingTask = await prisma.task.findFirst({
        where: { shotId: shot.id, name: step.name },
        select: { id: true },
      });

      if (!existingTask) {
        const task = await prisma.task.create({
          data: {
            name: step.name,
            shotId: shot.id,
            duration: step.duration,
            estimatedCost: step.cost,
            startDate: new Date(2022, 0, 3 + index * 2 + stepIndex),
            dueDate: new Date(2022, 0, 6 + index * 2 + stepIndex),
            status:
              index === 0 && stepIndex < 2
                ? TaskStatus.IN_PROGRESS
                : index === 1 && stepIndex === 0
                  ? TaskStatus.READY_TO_START
                  : TaskStatus.WAITING_TO_START,
          },
        });

        await prisma.assignment.create({
          data: {
            taskId: task.id,
            userId: users[(stepIndex % (users.length - 1)) + 1].id,
            reviewerId: admin.id,
          },
        });
      }
    }
  }

  const assets = [
    { name: "mkali", type: AssetType.CHARACTER, desc: "Main character" },
    { name: "suluwo", type: AssetType.CHARACTER, desc: "Wolf sidekick" },
    { name: "mountain", type: AssetType.ENVIRONMENT, desc: "Mountain range" },
    { name: "bunker", type: AssetType.PROP, desc: "Enemy bunker" },
    { name: "goggles", type: AssetType.PROP, desc: "Snow goggles" },
    { name: "visor", type: AssetType.PROP, desc: "Mkali's visor" },
  ];

  for (const asset of assets) {
    const existingAsset = await prisma.asset.findFirst({
      where: { projectId: project.id, name: asset.name },
      select: { id: true },
    });

    if (!existingAsset) {
      await prisma.asset.create({
        data: {
          name: asset.name,
          type: asset.type,
          description: asset.desc,
          projectId: project.id,
        },
      });
    }
  }

  const firstCompTask = await prisma.task.findFirst({
    where: { name: "CMP", shot: { projectId: project.id } },
    include: { versions: true },
  });

  if (firstCompTask && firstCompTask.versions.length === 0) {
    const version = await prisma.version.create({
      data: {
        number: 1,
        name: "RAID_0010_CMP_v001",
        taskId: firstCompTask.id,
        uploadedById: admin.id,
        fileUrl: "/uploads/demo/RAID_0010_CMP_v001.mp4",
        fileType: "video/mp4",
        description: "Demo review version for notes, approvals, and media flow.",
        frameCount: 120,
        fps: 24,
      },
    });

    await prisma.note.create({
      data: {
        content: "Check snow interaction on the foreground edge before final approval.",
        versionId: version.id,
        taskId: firstCompTask.id,
        authorId: admin.id,
      },
    });
  }

  const phases = [
    { name: "Pre-production", startDate: "2022-01-01", endDate: "2022-01-31" },
    { name: "Shot Production", startDate: "2022-02-01", endDate: "2022-05-31" },
    { name: "Final Review", startDate: "2022-06-01", endDate: "2022-06-30" },
  ];

  for (const phase of phases) {
    const exists = await prisma.phase.findFirst({
      where: { projectId: project.id, name: phase.name },
      select: { id: true },
    });

    if (!exists) {
      await prisma.phase.create({
        data: {
          name: phase.name,
          projectId: project.id,
          startDate: new Date(phase.startDate),
          endDate: new Date(phase.endDate),
        },
      });
    }
  }

  const workOrder = await prisma.workOrder.findFirst({
    where: { projectId: project.id, title: "Deliver RAID teaser package" },
    select: { id: true },
  });

  if (!workOrder) {
    await prisma.workOrder.create({
      data: {
        title: "Deliver RAID teaser package",
        description: "Editorial selects, comp finals, and director review package.",
        projectId: project.id,
      },
    });
  }

  const holiday = await prisma.calendarException.findFirst({
    where: {
      projectId: project.id,
      date: new Date("2022-12-25"),
      type: CalendarExceptionType.HOLIDAY,
    },
    select: { id: true },
  });

  if (!holiday) {
    await prisma.calendarException.create({
      data: {
        date: new Date("2022-12-25"),
        type: CalendarExceptionType.HOLIDAY,
        description: "Christmas Day",
        hoursWorked: 0,
        projectId: project.id,
        inheritedFrom: "studio",
      },
    });
  }

  console.log("Seed completed: demo project, shots, assets, tasks, assignments, version, notes, phases, work order, and calendar exception are ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
