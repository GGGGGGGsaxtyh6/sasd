"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Upload, Trash2, Shield, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type WorkspaceData = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
};

type MemberRow = {
  id: string;
  role: string;
  user: { id: string; name: string; email: string; avatarUrl: string | null } | null;
};

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;

  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [currentRole, setCurrentRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${encodeURIComponent(workspaceId)}`);
      if (!res.ok) {
        setWorkspace(null);
        return;
      }
      const data = await res.json();
      setWorkspace(data.workspace);
      setMembers(data.members ?? []);
      setCurrentRole(data.currentUserRole ?? "");
      setName(data.workspace.name ?? "");
      setDescription(data.workspace.description ?? "");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSaveWorkspace(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/workspaces/${encodeURIComponent(workspaceId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Could not save");
      }
      await load();
      router.refresh();
      window.dispatchEvent(
        new CustomEvent("app-toast", { detail: { message: "Workspace updated", variant: "success" } })
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("app-toast", {
          detail: {
            message: err instanceof Error ? err.message : "Save failed",
            variant: "error",
          },
        })
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("workspaceId", workspaceId);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Upload failed");
      }
      window.dispatchEvent(
        new CustomEvent("app-toast", { detail: { message: "File uploaded", variant: "success" } })
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("app-toast", {
          detail: {
            message: err instanceof Error ? err.message : "Upload failed",
            variant: "error",
          },
        })
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteWorkspace() {
    if (deleteConfirm !== workspace?.name) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/workspaces/${encodeURIComponent(workspaceId)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Could not delete");
      }
      window.dispatchEvent(
        new CustomEvent("app-toast", { detail: { message: "Workspace deleted", variant: "success" } })
      );
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("app-toast", {
          detail: {
            message: err instanceof Error ? err.message : "Delete failed",
            variant: "error",
          },
        })
      );
    } finally {
      setDeleting(false);
    }
  }

  const canEditWorkspace = ["owner", "admin"].includes(currentRole);
  const isOwner = currentRole === "owner";

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <div className="skeleton h-10 w-1/2 rounded-lg" />
        <div className="skeleton h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Workspace not found or you don&apos;t have access.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 p-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Workspace settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage how this workspace appears to your team.</p>
      </div>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
          <Shield className="h-5 w-5 text-primary" aria-hidden />
          General
        </h2>
        <form onSubmit={handleSaveWorkspace} className="mt-4 space-y-4">
          <div>
            <label htmlFor="ws-name" className="text-sm font-medium text-foreground">
              Workspace name
            </label>
            <input
              id="ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canEditWorkspace}
              className={cn(
                "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm",
                "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                !canEditWorkspace && "cursor-not-allowed opacity-60"
              )}
            />
          </div>
          <div>
            <label htmlFor="ws-desc" className="text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              id="ws-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!canEditWorkspace}
              rows={3}
              className={cn(
                "mt-1.5 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm",
                "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                !canEditWorkspace && "cursor-not-allowed opacity-60"
              )}
            />
          </div>
          {canEditWorkspace ? (
            <button
              type="submit"
              disabled={saving || name.trim().length < 2}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save changes
            </button>
          ) : (
            <p className="text-sm text-muted-foreground">Only owners and admins can edit workspace details.</p>
          )}
        </form>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
          <Users className="h-5 w-5 text-primary" aria-hidden />
          Members
        </h2>
        <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
          {members.length === 0 ? (
            <li className="px-4 py-6 text-sm text-muted-foreground">No members loaded.</li>
          ) : (
            members.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {m.user?.name
                      ? m.user.name
                          .split(/\s+/)
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-card-foreground">{m.user?.name ?? "Unknown"}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.user?.email}</p>
                  </div>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold capitalize text-muted-foreground">
                  {m.role}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
          <Upload className="h-5 w-5 text-primary" aria-hidden />
          Files
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload files to this workspace (max 10MB). They are stored on the server under{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">/uploads</code>.
        </p>
        <label
          className={cn(
            "mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 px-6 py-12 transition hover:border-primary/40 hover:bg-muted/40",
            (!canEditWorkspace || uploading) && "pointer-events-none opacity-50"
          )}
        >
          <input type="file" className="hidden" onChange={handleUpload} disabled={!canEditWorkspace || uploading} />
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" aria-hidden />
              <span className="mt-2 text-sm font-medium text-foreground">Click to upload</span>
              <span className="mt-1 text-xs text-muted-foreground">or drag and drop (browser dependent)</span>
            </>
          )}
        </label>
      </section>

      {isOwner ? (
        <section className="rounded-xl border border-destructive/40 bg-destructive/5 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-destructive">
            <Trash2 className="h-5 w-5" aria-hidden />
            Danger zone
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Deleting a workspace removes its documents, tasks, and activity. This cannot be undone.
          </p>
          <div className="mt-4 space-y-3">
            <p className="text-sm text-foreground">
              Type <strong>{workspace.name}</strong> to confirm deletion.
            </p>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full max-w-md rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder={workspace.name}
            />
            <button
              type="button"
              onClick={handleDeleteWorkspace}
              disabled={deleting || deleteConfirm !== workspace.name}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-destructive px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete workspace
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
