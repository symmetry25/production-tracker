"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#181713",
          border: "1px solid #34322b",
          color: "#f4f1e8",
          borderRadius: 0,
        },
      }}
    />
  );
}
