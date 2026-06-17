import type { TaskStatus } from "@/generated/prisma/enums";

export const STATUS_COLORS: Record<
  TaskStatus,
  {
    bg: string;
    text: string;
    dot: string;
    label: string;
  }
> = {
  WAITING_TO_START: { bg: "#2A2A28", text: "#888780", dot: "#888780", label: "Waiting to Start" },
  READY_TO_START: { bg: "#1A2233", text: "#378ADD", dot: "#378ADD", label: "Ready to Start" },
  IN_PROGRESS: { bg: "#1A2D1A", text: "#4EC94E", dot: "#639922", label: "In Progress" },
  PENDING_REVIEW: { bg: "#2D2300", text: "#C88A00", dot: "#EF9F27", label: "Pending Review" },
  APPROVED: { bg: "#1A2D1A", text: "#1D9E75", dot: "#1D9E75", label: "Approved" },
  FINAL: { bg: "#3A3A38", text: "#E0DFD6", dot: "#E0DFD6", label: "Final" },
  ON_HOLD: { bg: "#1E1B33", text: "#7F77DD", dot: "#7F77DD", label: "On Hold" },
  OMIT: { bg: "#2D1A1A", text: "#E24B4A", dot: "#E24B4A", label: "Omit" },
};

export const PIPELINE_COLORS: Record<string, string> = {
  LAY: "#EF9F27",
  ANM: "#378ADD",
  CFX: "#17D4E0",
  FX: "#639922",
  LGT: "#F9CB42",
  CMP: "#7F77DD",
  ART: "#D85A30",
  MDL: "#E24B4A",
  RIG: "#D4537E",
  TXT: "#EF9F27",
};

export const PIPELINE_STEPS = ["LAY", "ANM", "CFX", "FX", "LGT", "CMP"] as const;
