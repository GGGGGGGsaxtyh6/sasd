"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Search, Settings, Shield, Sparkles, SunMedium } from "lucide-react";
import { APP_NAME } from "@/src/lib/constants";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { useTheme } from "@/src/components/providers/theme-provider";
import { cn } from "@/src/lib/utils";

export function AppShell({
  children,
  user,
  workspaces,
  currentWorkspaceId,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; isAdmin: boolean } | null;
  workspaces?: Array<{ id: string; name: string; role?: string }>;
  currentWorkspaceId?: string;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const navItems = currentWorkspaceId
    ? [
        { href: `/workspaces/${currentWorkspaceId}`, label: "Overview" },
        { href: `/workspaces/${currentWorkspaceId}/documents/${currentWorkspaceId}`, label: "Documento" },
        { href: `/workspaces/${currentWorkspaceId}/tasks`, label: "Tareas" },
        { href: `/workspaces/${currentWorkspaceId}/search`, label: "Buscar" },
        { href: `/workspaces/${currentWorkspaceId}/settings`, label: "Ajustes" },
      ]
    : [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/onboarding", label: "Nuevo workspace" },
      ];

  const activeWorkspace = workspaces?.find((workspace) => workspace.id === currentWorkspaceId);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 text-sm font-semibold">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950">
                <Sparkles className="h-4 w-4" />
              </div>
              <span>{APP_NAME}</span>
            </Link>
            <nav className="hidden items-center gap-2 md:flex">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white",
                    pathname === item.href && "bg-white/10 text-white",
                  )}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-10 w-10 rounded-full p-0"
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button type="button" variant="ghost" className="hidden md:inline-flex">
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
            {activeWorkspace ? (
              <Badge variant="secondary" className="hidden md:inline-flex">
                {activeWorkspace.name}
              </Badge>
            ) : null}
            {user?.isAdmin ? (
              <Link href="/admin">
                <Button type="button" variant="ghost" className="hidden md:inline-flex">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </Link>
            ) : null}
            <Link href={currentWorkspaceId ? `/workspaces/${currentWorkspaceId}/settings` : "/dashboard"}>
              <Button type="button" variant="ghost" className="hidden md:inline-flex">
                <Settings className="mr-2 h-4 w-4" />
                Ajustes
              </Button>
            </Link>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-right">
              <p className="text-sm font-medium text-white">{user?.name ?? "Invitado"}</p>
              <p className="text-xs text-slate-400">{user?.email ?? "Sin sesión"}</p>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
