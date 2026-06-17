"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type CommandItem = {
  title: string;
  subtitle: string;
  href: string;
  keywords: string[];
  shortcut?: string;
};

type CommandPaletteProps = {
  items: CommandItem[];
};

export function CommandPalette({ items }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);

    if (!normalizedQuery) return items;

    return items.filter((item) => {
      const haystack = normalizeSearch([item.title, item.subtitle, item.href, ...item.keywords].join(" "));
      return haystack.includes(normalizedQuery);
    });
  }, [items, query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
        return;
      }

      if (open && event.key === "Escape") {
        event.preventDefault();
        close();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const id = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    close();
  }, [pathname]);

  function close() {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }

  function openItem(item: CommandItem | undefined) {
    if (!item) return;

    router.push(item.href);
    close();
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, filteredItems.length - 1));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    }

    if (event.key === "Enter") {
      event.preventDefault();
      openItem(filteredItems[activeIndex]);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-8 min-w-40 items-center justify-between border border-[#3f3c33] bg-[#11110f] px-3 text-xs text-[#8f8a7e] transition hover:border-[#d8b46a] hover:text-[#e8c678] lg:flex"
        title="Command palette"
      >
        <span>Search</span>
        <kbd className="font-mono text-[10px] text-[#6e6e69]">⌘K</kbd>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/55 p-6 backdrop-blur-sm" onMouseDown={close}>
          <div className="mx-auto mt-[8vh] w-full max-w-2xl border border-[#4a463d] bg-[#151410] shadow-2xl shadow-black/50" onMouseDown={(event) => event.stopPropagation()}>
            <div className="border-b border-[#34322b] p-3">
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onInputKeyDown}
                placeholder="搜索页面、镜头、任务、资源..."
                className="h-11 w-full bg-transparent px-2 text-sm text-[#f4f1e8] outline-none placeholder:text-[#6e6e69]"
              />
            </div>
            <div className="max-h-[420px] overflow-auto p-2">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <Link
                    key={`${item.title}-${item.href}`}
                    href={item.href}
                    onClick={close}
                    className={[
                      "grid grid-cols-[1fr_auto] gap-4 px-3 py-3 text-sm transition",
                      index === activeIndex ? "bg-[#2b2924] text-[#f4f1e8]" : "text-[#c9c3b5] hover:bg-[#22201c]",
                    ].join(" ")}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{item.title}</span>
                      <span className="mt-1 block truncate text-xs text-[#8f8a7e]">{item.subtitle}</span>
                    </span>
                    {item.shortcut ? <kbd className="self-center font-mono text-[10px] text-[#7f7a70]">{item.shortcut}</kbd> : null}
                  </Link>
                ))
              ) : (
                <div className="px-3 py-10 text-center text-sm text-[#8f8a7e]">没有找到匹配项。</div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-[#34322b] px-4 py-2 text-[11px] text-[#6e6e69]">
              <span>↑↓ 选择 · Enter 打开 · Esc 关闭</span>
              <span>输入 g p / g r / g t 快速跳转</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export type { CommandItem };

function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}
