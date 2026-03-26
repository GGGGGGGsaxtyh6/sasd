"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Activity,
  Settings,
  Plus,
  LogOut,
  Sparkles,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SidebarDocument = { id: string; title: string; icon?: string | null };

type SidebarProps = {
  workspaceId: string;
  workspaceName: string;
  documents: SidebarDocument[];
  currentPath: string;
  mobileOpen: boolean;
  onMobileClose: () => void;
  userName: string;
};

function docIcon(icon?: string | null) {
  if (icon?.trim()) {
    return (
      <span className="flex h-4 w-5 shrink-0 items-center justify-center text-base leading-none" aria-hidden>
        {icon}
      </span>
    );
  }
  return <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />;
}

function NavLink({
  href,
  active,
  children,
  onClick,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}

export function Sidebar({
  workspaceId,
  workspaceName,
  documents,
  currentPath,
  mobileOpen,
  onMobileClose,
  userName,
}: SidebarProps) {
  const router = useRouter();
  const base = workspaceId ? `/workspace/${workspaceId}` : "";
  const dashboardActive = currentPath === "/dashboard" || currentPath === "/dashboard/";
  const tasksActive = currentPath.startsWith(`${base}/tasks`);
  const activityActive = currentPath.startsWith(`${base}/activity`);
  const settingsActive = currentPath.startsWith(`${base}/settings`);
  async function handleNewDocument() {
    if (!workspaceId) return;
    onMobileClose();
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          title: "Untitled",
          content: "",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Failed to create document");
      }
      const doc = (await res.json()) as { id: string };
      router.push(`${base}/documents/${doc.id}`);
      router.refresh();
    } catch {
      window.dispatchEvent(
        new CustomEvent("app-toast", { detail: { message: "Could not create document", variant: "error" } })
      );
    }
  }

  const sidebarInner = (
    <div className="flex h-full min-h-0 flex-col border-r border-border bg-card">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <Link
          href="/dashboard"
          onClick={onMobileClose}
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <span>Collabrix</span>
        </Link>
        <button
          type="button"
          onClick={onMobileClose}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden"
          aria-label="Close menu"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
        <NavLink href="/dashboard" active={dashboardActive} onClick={onMobileClose}>
          <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />
          Dashboard
        </NavLink>

        {workspaceId ? (
          <>
            <div className="pt-4">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Workspace
              </p>
              <p className="truncate px-3 text-sm font-medium text-foreground" title={workspaceName}>
                {workspaceName}
              </p>
            </div>

            <div className="pt-2">
              <div className="mb-2 flex items-center justify-between px-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Documents
                </span>
                <button
                  type="button"
                  onClick={handleNewDocument}
                  className="flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  New
                </button>
              </div>
              <div className="space-y-0.5">
                {documents.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-muted-foreground">No documents yet</p>
                ) : (
                  documents.map((doc) => {
                    const href = `${base}/documents/${doc.id}`;
                    const active = currentPath.includes(`/documents/${doc.id}`);
                    return (
                      <NavLink key={doc.id} href={href} active={active} onClick={onMobileClose}>
                        {docIcon(doc.icon)}
                        <span className="truncate">{doc.title || "Untitled"}</span>
                      </NavLink>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-4">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Navigate
              </p>
              <div className="space-y-0.5">
                <NavLink href={`${base}/tasks`} active={tasksActive} onClick={onMobileClose}>
                  <CheckSquare className="h-4 w-4 shrink-0" aria-hidden />
                  Tasks
                </NavLink>
                <NavLink href={`${base}/activity`} active={activityActive} onClick={onMobileClose}>
                  <Activity className="h-4 w-4 shrink-0" aria-hidden />
                  Activity
                </NavLink>
                <NavLink href={`${base}/settings`} active={settingsActive} onClick={onMobileClose}>
                  <Settings className="h-4 w-4 shrink-0" aria-hidden />
                  Settings
                </NavLink>
              </div>
            </div>
          </>
        ) : (
          <p className="px-3 pt-4 text-xs text-muted-foreground">
            Open a workspace from the dashboard to see documents and tools.
          </p>
        )}
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
            {userName
              .split(/\s+/)
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{userName}</p>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="mt-0.5 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3 w-3" aria-hidden />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!mobileOpen}
        onClick={onMobileClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(100vw-3rem,18rem)] flex-col transition-transform duration-200 ease-out md:static md:z-0 md:w-64 md:translate-x-0 md:flex-shrink-0",
          mobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full md:translate-x-0"
        )}
      >
        {sidebarInner}
      </aside>
    </>
  );
}

export function SidebarMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
