import type { Role } from "@/generated/prisma/enums";

type SessionUser = {
  id?: string;
  role?: Role;
} | null | undefined;

const producerRoles = ["ADMIN", "PRODUCER"] satisfies Role[];
const supervisorRoles = ["ADMIN", "PRODUCER", "SUPERVISOR"] satisfies Role[];
const reviewRoles = ["ADMIN", "PRODUCER", "SUPERVISOR", "REVIEWER"] satisfies Role[];
const uploadRoles = ["ADMIN", "PRODUCER", "SUPERVISOR", "ARTIST"] satisfies Role[];

export function hasAnyRole(user: SessionUser, roles: readonly Role[]) {
  return Boolean(user?.role && roles.includes(user.role));
}

export function canManageProjects(user: SessionUser) {
  return hasAnyRole(user, producerRoles);
}

export function canDeleteProjects(user: SessionUser) {
  return user?.role === "ADMIN";
}

export function canManagePipeline(user: SessionUser) {
  return hasAnyRole(user, supervisorRoles);
}

export function canManageAssignments(user: SessionUser) {
  return hasAnyRole(user, supervisorRoles);
}

export function canManageSchedule(user: SessionUser) {
  return hasAnyRole(user, supervisorRoles);
}

export function canReviewVersions(user: SessionUser) {
  return hasAnyRole(user, reviewRoles);
}

export function canUploadVersions(user: SessionUser) {
  return hasAnyRole(user, uploadRoles);
}

export function canDeleteVersions(user: SessionUser) {
  return hasAnyRole(user, supervisorRoles);
}

export function canPatchTaskFields(user: SessionUser, fields: Iterable<string>) {
  if (canManagePipeline(user)) {
    return true;
  }

  if (user?.role !== "ARTIST") {
    return false;
  }

  const artistEditableFields = new Set(["status", "timeLogged"]);
  return Array.from(fields).every((field) => artistEditableFields.has(field));
}
