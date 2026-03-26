"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Moon,
  Sun,
  ChevronRight,
  X,
  Loader2,
  FileText,
  CheckSquare,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { SidebarMenuButton } from "./Sidebar";

export type BreadcrumbItem = { label: string; href?: string };

type TopBarProps = {
  userName: string;
  userImage?: string | null;
  workspaceId: string;
  workspaceName: string;
  breadcrumbs: BreadcrumbItem[];
  onMobileMenu: () => void;
};

type SearchHit =
  | ({ type: "document" } & { id: string; title: string; workspaceId: string })
  | ({ type: "task" } & { id: string; title: string; workspaceId: string });

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

export function TopBar({
  userName,
  userImage,
  workspaceId,
  workspaceName,
  breadcrumbs,
  onMobileMenu,
}: TopBarProps) {
  const pathname = usePathname();
  const searchDialogId = useId();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [results, setResults] = useState<{ documents: SearchHit[]; tasks: SearchHit[] } | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    async function load() {
      setNotifLoading(true);
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) setNotifications(await res.json());
      } finally {
        setNotifLoading(false);
      }
    }
    load();
  }, [pathname]);

  useEffect(() => {
    if (!searchOpen) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [searchOpen]);

  const runSearch = useCallback(async () => {
    const q = query.trim();
    if (!workspaceId || !q) {
      setResults(null);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q)}&workspaceId=${encodeURIComponent(workspaceId)}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults({
          documents: (data.documents ?? []).map((d: { id: string; title: string; workspaceId: string }) => ({
            ...d,
            type: "document" as const,
          })),
          tasks: (data.tasks ?? []).map((t: { id: string; title: string; workspaceId: string }) => ({
            ...t,
            type: "task" as const,
          })),
        });
      } else {
        setResults({ documents: [], tasks: [] });
      }
    } finally {
      setSearchLoading(false);
    }
  }, [query, workspaceId]);

  useEffect(() => {
    if (!searchOpen || !workspaceId) return;
    const h = window.setTimeout(runSearch, 280);
    return () => window.clearTimeout(h);
  }, [query, searchOpen, workspaceId, runSearch]);

  function toggleDark() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    if (next) root.classList.add("dark");
    else root.classList.remove("dark");
    setDark(next);
    window.dispatchEvent(
      new CustomEvent("app-toast", {
        detail: { message: next ? "Dark mode on" : "Light mode on", variant: "success" },
      })
    );
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "all" }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  async function markOneRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  const initials = userName
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <SidebarMenuButton onClick={onMobileMenu} />

        <nav aria-label="Breadcrumb" className="hidden min-w-0 flex-1 items-center gap-1 text-sm md:flex">
          {breadcrumbs.map((item, i) => (
            <span key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-1">
              {i > 0 ? <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden /> : null}
              {item.href ? (
                <Link
                  href={item.href}
                  className="truncate text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="truncate font-medium text-foreground">{item.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div className="flex flex-1 items-center md:hidden">
          <span className="truncate text-sm font-medium text-foreground">
            {breadcrumbs[breadcrumbs.length - 1]?.label ?? "Collabrix"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className={cn(
              "hidden h-9 w-full max-w-xs items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 text-left text-sm text-muted-foreground sm:flex",
              "hover:border-primary/30 hover:bg-muted/60"
            )}
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden />
            <span>Search…</span>
            <kbd className="ml-auto hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium lg:inline">
              /
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted sm:hidden"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((o) => !o)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </button>

            {notifOpen ? (
              <>
                <div className="fixed inset-0 z-40" aria-hidden onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-[min(calc(100vw-2rem),22rem)] rounded-xl border border-border bg-card p-2 shadow-lg">
                  <div className="mb-2 flex items-center justify-between px-2">
                    <span className="text-sm font-semibold text-card-foreground">Notifications</span>
                    {unreadCount > 0 ? (
                      <button
                        type="button"
                        onClick={markAllRead}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                    ) : null}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <p className="px-2 py-6 text-center text-sm text-muted-foreground">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={cn(
                            "rounded-lg px-2 py-2 text-sm",
                            !n.isRead ? "bg-accent/40" : "hover:bg-muted/60"
                          )}
                        >
                          {n.link ? (
                            <Link
                              href={n.link}
                              onClick={() => {
                                markOneRead(n.id);
                                setNotifOpen(false);
                              }}
                              className="block"
                            >
                              <p className="font-medium text-card-foreground">{n.title}</p>
                              <p className="text-muted-foreground">{n.message}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {formatRelativeTime(n.createdAt)}
                              </p>
                            </Link>
                          ) : (
                            <button
                              type="button"
                              className="w-full text-left"
                              onClick={() => markOneRead(n.id)}
                            >
                              <p className="font-medium text-card-foreground">{n.title}</p>
                              <p className="text-muted-foreground">{n.message}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {formatRelativeTime(n.createdAt)}
                              </p>
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          <button
            type="button"
            onClick={toggleDark}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="hidden h-9 w-9 overflow-hidden rounded-full border border-border sm:block">
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/15 text-xs font-bold text-primary">
                {initials || "?"}
              </div>
            )}
          </div>
        </div>
      </header>

      {searchOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-background/80 p-4 pt-[12vh] backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby={searchDialogId}
        >
          <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                id={searchDialogId}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  workspaceId
                    ? `Search in ${workspaceName}…`
                    : "Open a workspace to search documents and tasks"
                }
                className="h-12 flex-1 bg-transparent text-sm text-card-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                  setResults(null);
                }}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto p-2">
              {!workspaceId ? (
                <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                  Select a workspace from the dashboard to use search.
                </p>
              ) : searchLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : results ? (
                <>
                  {(results.documents.length === 0 && results.tasks.length === 0) || !query.trim() ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      {query.trim() ? "No results" : "Type to search"}
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {results.documents.map((d) => (
                        <li key={d.id}>
                          <Link
                            href={`/workspace/${d.workspaceId}/documents/${d.id}`}
                            onClick={() => {
                              setSearchOpen(false);
                              setQuery("");
                            }}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"
                          >
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-card-foreground">{d.title}</span>
                            <span className="ml-auto text-xs text-muted-foreground">Document</span>
                          </Link>
                        </li>
                      ))}
                      {results.tasks.map((t) => (
                        <li key={t.id}>
                          <Link
                            href={`/workspace/${t.workspaceId}/tasks`}
                            onClick={() => {
                              setSearchOpen(false);
                              setQuery("");
                            }}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"
                          >
                            <CheckSquare className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-card-foreground">{t.title}</span>
                            <span className="ml-auto text-xs text-muted-foreground">Task</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">Type to search</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
