"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  FileText,
  CheckSquare,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

type AdminPayload = {
  stats: { users: number; workspaces: number; documents: number; tasks: number };
  users: { id: string; name: string; email: string; role: string; createdAt: string }[];
};

export default function AdminPage() {
  const [data, setData] = useState<AdminPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin");
      if (res.status === 403) {
        setError("forbidden");
        setData(null);
        return;
      }
      if (!res.ok) {
        setError("failed");
        setData(null);
        return;
      }
      setData(await res.json());
    } catch {
      setError("failed");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 p-6">
        <div className="skeleton h-10 w-48 rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
        <div className="skeleton h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error === "forbidden") {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-6 py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-6 text-xl font-bold text-foreground">Admin only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This area is restricted to users with the admin role. If you need access, contact an administrator.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-card-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (error === "failed" || !data) {
    return (
      <div className="mx-auto max-w-lg p-10 text-center">
        <p className="text-muted-foreground">Could not load admin data.</p>
        <button
          type="button"
          onClick={load}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  const { stats, users } = data;

  return (
    <div className="mx-auto max-w-6xl space-y-10 p-6 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin</h1>
          <p className="text-sm text-muted-foreground">Platform overview and user directory.</p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 self-start rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Dashboard
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Users className="h-9 w-9 text-primary" aria-hidden />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Users</p>
              <p className="text-2xl font-bold text-card-foreground">{stats.users}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Building2 className="h-9 w-9 text-primary" aria-hidden />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Workspaces</p>
              <p className="text-2xl font-bold text-card-foreground">{stats.workspaces}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <FileText className="h-9 w-9 text-primary" aria-hidden />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Documents</p>
              <p className="text-2xl font-bold text-card-foreground">{stats.documents}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-9 w-9 text-primary" aria-hidden />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tasks</p>
              <p className="text-2xl font-bold text-card-foreground">{stats.tasks}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-card-foreground">Users</h2>
          <p className="text-sm text-muted-foreground">All registered accounts.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Email</th>
                <th className="px-6 py-3 font-semibold">Role</th>
                <th className="px-6 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20">
                  <td className="px-6 py-3 font-medium text-card-foreground">{u.name}</td>
                  <td className="px-6 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-6 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                        u.role === "admin"
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
