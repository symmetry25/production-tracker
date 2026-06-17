"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type KeyboardShortcutsProps = {
  shortcuts: Record<string, string>;
};

export function KeyboardShortcuts({ shortcuts }: KeyboardShortcutsProps) {
  const router = useRouter();
  const firstKeyRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    function clearSequence() {
      firstKeyRef.current = null;

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;

      if (isTyping || event.metaKey || event.ctrlKey || event.altKey) return;

      const key = event.key.toLowerCase();

      if (!firstKeyRef.current) {
        if (key === "g") {
          firstKeyRef.current = key;
          timerRef.current = window.setTimeout(clearSequence, 900);
        }
        return;
      }

      const sequence = `${firstKeyRef.current} ${key}`;
      const href = shortcuts[sequence];

      if (href) {
        event.preventDefault();
        router.push(href);
      }

      clearSequence();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      clearSequence();
    };
  }, [router, shortcuts]);

  return null;
}
