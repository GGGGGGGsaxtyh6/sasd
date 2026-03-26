"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar, type SidebarDocument } from "./Sidebar";
import { TopBar, type BreadcrumbItem } from "./TopBar";
import { cn } from "@/lib/utils";

export type ShellWorkspace = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

type ShellUser = {
  name: string;
  email: string;
  image: string | null;
  role: string;
};

type ToastDetail = { message: string; variant?: "success" | "error" | "info" };

export function DashboardShell({
  user,
  workspaces,
  children,
}: {
  user: ShellUser;
  workspaces: ShellWorkspace[];
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [documents, setDocuments] = useState<SidebarDocument[]>([]);
  const [toast, setToast] = useState<ToastDetail | null>(null);

  const workspaceMatch = pathname.match(/^\/workspace\/([^/]+)/);
  const workspaceId = workspaceMatch?.[1] ?? "";
  const workspace = useMemo(
    () => workspaces.find((w) => w.id === workspaceId),
    [workspaces, workspaceId]
  );
  const workspaceName = workspace?.name ?? "Workspace";

  useEffect(() => {
    function onToast(e: Event) {
      const ce = e as CustomEvent<ToastDetail>;
      if (ce.detail?.message) {
        setToast(ce.detail);
        window.setTimeout(() => setToast(null), 3200);
      }
    }
    window.addEventListener("app-toast", onToast);
    return () => window.removeEventListener("app-toast", onToast);
  }, []);

  const loadDocuments = useCallback(async () => {
    if (!workspaceId) {
      setDocuments([]);
      return;
    }
    try {
      const res = await fetch(`/api/documents?workspaceId=${encodeURIComponent(workspaceId)}`);
      if (res.ok) {
        const data = (await res.json()) as { id: string; title: string; icon: string | null }[];
        setDocuments(
          data.map((d) => ({
            id: d.id,
            title: d.title,
            icon: d.icon,
          }))
        );
      } else {
        setDocuments([]);
      }
    } catch {
      setDocuments([]);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    function onRefresh() {
      loadDocuments();
    }
    window.addEventListener("collabrix:refresh-documents", onRefresh);
    return () => window.removeEventListener("collabrix:refresh-documents", onRefresh);
  }, [loadDocuments]);

  const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
    if (pathname.startsWith("/admin")) {
      return [{ label: "Dashboard", href: "/dashboard" }, { label: "Admin" }];
    }
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return [{ label: "Dashboard" }];
    }
    if (workspaceId) {
      const base = `/workspace/${workspaceId}`;
      const items: BreadcrumbItem[] = [
        { label: "Dashboard", href: "/dashboard" },
        { label: workspaceName, href: base + "/settings" },
      ];
      if (pathname.includes("/documents/")) {
        items.push({ label: "Document" });
      } else if (pathname.includes("/tasks")) {
        items.push({ label: "Tasks" });
      } else if (pathname.includes("/activity")) {
        items.push({ label: "Activity" });
      } else if (pathname.includes("/settings")) {
        items.push({ label: "Settings" });
      }
      return items;
    }
    return [{ label: "Dashboard", href: "/dashboard" }];
  }, [pathname, workspaceId, workspaceName]);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background text-foreground">
      <Sidebar
        workspaceId={workspaceId}
        workspaceName={workspaceName}
        documents={documents}
        currentPath={pathname}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        userName={user.name || user.email || "User"}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          userName={user.name || user.email || "User"}
          userImage={user.image}
          workspaceId={workspaceId}
          workspaceName={workspaceName}
          breadcrumbs={breadcrumbs}
          onMobileMenu={() => setMobileOpen(true)}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>

      {toast ? (
        <div
          className={cn(
            "animate-fade-in fixed bottom-6 left-1/2 z-[100] max-w-md -translate-x-1/2 rounded-lg border px-4 py-3 text-sm shadow-lg",
            toast.variant === "error"
              ? "border-destructive/40 bg-card text-destructive"
              : toast.variant === "success"
                ? "border-success/40 bg-card text-foreground"
                : "border-border bg-card text-card-foreground"
          )}
          role="status"
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
