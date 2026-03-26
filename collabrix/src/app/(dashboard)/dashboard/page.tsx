"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  FileText,
  CheckSquare,
  Plus,
  ArrowRight,
  LayoutGrid,
  Loader2,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

type Workspace = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  role?: string;
};

type ActivityRow = {
  id: string;
  action: string;
  entityType: string;
  entityTitle: string | null;
  createdAt: string;
  user: { name: string } | null;
};

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="skeleton mb-4 h-6 w-2/3 rounded-md" />
      <div className="skeleton mb-2 h-4 w-full rounded-md" />
      <div className="skeleton h-4 w-1/2 rounded-md" />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [stats, setStats] = useState<{ docs: number; tasks: number }>({ docs: 0, tasks: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const loadWorkspaces = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workspaces");
      if (res.ok) {
        setWorkspaces(await res.json());
      } else {
        setWorkspaces([]);
        window.dispatchEvent(
          new CustomEvent("app-toast", { detail: { message: "Could not load workspaces", variant: "error" } })
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  useEffect(() => {
    async function loadStatsAndActivity() {
      setStatsLoading(true);
      setActivityLoading(true);
      try {
        const wsRes = await fetch("/api/workspaces");
        if (!wsRes.ok) {
          setStats({ docs: 0, tasks: 0 });
          setActivity([]);
          return;
        }
        const ws = (await wsRes.json()) as Workspace[];
        const slice = ws.slice(0, 12);
        let docs = 0;
        let tasks = 0;
        const actBuckets: ActivityRow[] = [];

        await Promise.all(
          slice.map(async (w) => {
            const [dr, tr, ar] = await Promise.all([
              fetch(`/api/documents?workspaceId=${encodeURIComponent(w.id)}`),
              fetch(`/api/tasks?workspaceId=${encodeURIComponent(w.id)}`),
              fetch(`/api/activity?workspaceId=${encodeURIComponent(w.id)}`),
            ]);
            if (dr.ok) docs += (await dr.json()).length;
            if (tr.ok) tasks += (await tr.json()).length;
            if (ar.ok) actBuckets.push(...(await ar.json()));
          })
        );

        actBuckets.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setStats({ docs, tasks });
        setActivity(actBuckets.slice(0, 10));
      } finally {
        setStatsLoading(false);
        setActivityLoading(false);
      }
    }
    loadStatsAndActivity();
  }, [workspaces.length]);

  async function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault();
    if (createName.trim().length < 2) return;
    setCreating(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          description: createDesc.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Failed to create workspace");
      }
      const w = (await res.json()) as Workspace;
      window.dispatchEvent(
        new CustomEvent("app-toast", { detail: { message: "Workspace created", variant: "success" } })
      );
      setModalOpen(false);
      setCreateName("");
      setCreateDesc("");
      await loadWorkspaces();
      router.push(`/workspace/${w.id}/tasks`);
      router.refresh();
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("app-toast", {
          detail: { message: err instanceof Error ? err.message : "Create failed", variant: "error" },
        })
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 p-6 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage workspaces, documents, and tasks in one place.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New workspace
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Documents
              </p>
              {statsLoading ? (
                <div className="skeleton mt-1 h-8 w-16 rounded-md" />
              ) : (
                <p className="text-2xl font-bold text-card-foreground">{stats.docs}</p>
              )}
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CheckSquare className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tasks</p>
              {statsLoading ? (
                <div className="skeleton mt-1 h-8 w-16 rounded-md" />
              ) : (
                <p className="text-2xl font-bold text-card-foreground">{stats.tasks}</p>
              )}
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LayoutGrid className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Workspaces
              </p>
              {loading ? (
                <div className="skeleton mt-1 h-8 w-16 rounded-md" />
              ) : (
                <p className="text-2xl font-bold text-card-foreground">{workspaces.length}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Your workspaces</h2>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground" aria-hidden />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Create your first workspace</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Workspaces hold documents, tasks, and team activity. Start by naming your first space.
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Create workspace
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((w) => (
              <Link
                key={w.id}
                href={`/workspace/${w.id}/tasks`}
                className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-card-foreground group-hover:text-primary">
                      {w.name}
                    </h3>
                    {w.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{w.description}</p>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">No description</p>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                {w.role ? (
                  <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Role: {w.role}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Recent activity</h2>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          {activityLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No recent activity across your workspaces yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {activity.map((a) => (
                <li key={a.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3 first:pt-0 last:pb-0">
                  <p className="text-sm text-card-foreground">
                    <span className="font-medium">{a.user?.name ?? "Someone"}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>{" "}
                    <span className="font-medium">{a.entityType}</span>
                    {a.entityTitle ? (
                      <>
                        {" "}
                        <span className="text-muted-foreground">&ldquo;{a.entityTitle}&rdquo;</span>
                      </>
                    ) : null}
                  </p>
                  <time className="text-xs text-muted-foreground" dateTime={a.createdAt}>
                    {formatRelativeTime(a.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-ws-title"
        >
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <h2 id="create-ws-title" className="text-lg font-semibold text-card-foreground">
              New workspace
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose a name your team will recognize.</p>
            <form onSubmit={handleCreateWorkspace} className="mt-6 space-y-4">
              <div>
                <label htmlFor="ws-name" className="text-sm font-medium text-foreground">
                  Name
                </label>
                <input
                  id="ws-name"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  required
                  minLength={2}
                  className={cn(
                    "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm",
                    "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  )}
                  placeholder="e.g. Product, Marketing"
                />
              </div>
              <div>
                <label htmlFor="ws-desc" className="text-sm font-medium text-foreground">
                  Description (optional)
                </label>
                <textarea
                  id="ws-desc"
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  rows={3}
                  className={cn(
                    "mt-1.5 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm",
                    "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  )}
                  placeholder="What is this workspace for?"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-10 rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || createName.trim().length < 2}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
