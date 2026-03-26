"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Loader2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type TaskStatus = "backlog" | "todo" | "in_progress" | "in_review" | "done" | "cancelled";
type TaskPriority = "none" | "low" | "medium" | "high" | "urgent";

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  assignee: { id: string; name: string; avatarUrl: string | null } | null;
};

type MemberUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

const COLUMNS: { id: TaskStatus; label: string; headerClass: string }[] = [
  { id: "backlog", label: "Backlog", headerClass: "border-t-4 border-slate-400" },
  { id: "todo", label: "Todo", headerClass: "border-t-4 border-blue-500" },
  { id: "in_progress", label: "In Progress", headerClass: "border-t-4 border-amber-500" },
  { id: "in_review", label: "In Review", headerClass: "border-t-4 border-violet-500" },
  { id: "done", label: "Done", headerClass: "border-t-4 border-emerald-500" },
];

function priorityStyles(p: TaskPriority) {
  switch (p) {
    case "urgent":
      return "bg-red-500/15 text-red-700 dark:text-red-400";
    case "high":
      return "bg-orange-500/15 text-orange-700 dark:text-orange-400";
    case "medium":
      return "bg-yellow-500/15 text-yellow-800 dark:text-yellow-300";
    case "low":
      return "bg-blue-500/15 text-blue-700 dark:text-blue-300";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function priorityLabel(p: TaskPriority) {
  if (p === "none") return "None";
  return p.replace("_", " ");
}

export default function TasksPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [members, setMembers] = useState<MemberUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("none");
  const [newStatus, setNewStatus] = useState<TaskStatus>("todo");
  const [newAssignee, setNewAssignee] = useState<string>("");

  const [detailTask, setDetailTask] = useState<TaskRow | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<TaskStatus>("todo");
  const [editPriority, setEditPriority] = useState<TaskPriority>("none");
  const [editAssignee, setEditAssignee] = useState<string>("");
  const [savingDetail, setSavingDetail] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?workspaceId=${encodeURIComponent(workspaceId)}`);
      if (res.ok) setTasks(await res.json());
      else setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  const loadMembers = useCallback(async () => {
    try {
      const res = await fetch(`/api/workspaces/${encodeURIComponent(workspaceId)}`);
      if (!res.ok) return;
      const data = await res.json();
      const list = (data.members ?? []) as { user: MemberUser | null }[];
      setMembers(list.map((m) => m.user).filter(Boolean) as MemberUser[]);
    } catch {
      setMembers([]);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadTasks();
    loadMembers();
  }, [loadTasks, loadMembers]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          title: newTitle.trim(),
          status: newStatus,
          priority: newPriority,
          assigneeId: newAssignee || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Failed to create task");
      }
      setCreateOpen(false);
      setNewTitle("");
      setNewPriority("none");
      setNewStatus("todo");
      setNewAssignee("");
      await loadTasks();
      window.dispatchEvent(
        new CustomEvent("app-toast", { detail: { message: "Task created", variant: "success" } })
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("app-toast", {
          detail: {
            message: err instanceof Error ? err.message : "Create failed",
            variant: "error",
          },
        })
      );
    } finally {
      setCreating(false);
    }
  }

  function openDetail(t: TaskRow) {
    setDetailTask(t);
    setEditTitle(t.title);
    setEditDescription(t.description ?? "");
    setEditStatus(t.status);
    setEditPriority(t.priority);
    setEditAssignee(t.assigneeId ?? "");
  }

  async function saveDetail(e: React.FormEvent) {
    e.preventDefault();
    if (!detailTask) return;
    setSavingDetail(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: detailTask.id,
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          status: editStatus,
          priority: editPriority,
          assigneeId: editAssignee || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Update failed");
      }
      setDetailTask(null);
      await loadTasks();
      window.dispatchEvent(
        new CustomEvent("app-toast", { detail: { message: "Task updated", variant: "success" } })
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("app-toast", {
          detail: {
            message: err instanceof Error ? err.message : "Update failed",
            variant: "error",
          },
        })
      );
    } finally {
      setSavingDetail(false);
    }
  }

  function tasksInColumn(status: TaskStatus) {
    if (status === "backlog") {
      return tasks.filter((t) => t.status === "backlog" || t.status === "cancelled");
    }
    return tasks.filter((t) => t.status === status);
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="skeleton mb-6 h-10 w-48 rounded-lg" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-96 w-72 shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col p-4 pb-10 lg:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground">Kanban board for this workspace.</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New task
        </button>
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto pb-2">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className="flex w-[min(100vw-2rem,18rem)] shrink-0 flex-col rounded-xl border border-border bg-muted/20"
          >
            <div
              className={cn(
                "rounded-t-xl border-b border-border bg-card px-3 py-3",
                col.headerClass
              )}
            >
              <h2 className="text-sm font-semibold text-card-foreground">{col.label}</h2>
              <p className="text-xs text-muted-foreground">{tasksInColumn(col.id).length} tasks</p>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-2">
              {tasksInColumn(col.id).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => openDetail(t)}
                  className="rounded-lg border border-border bg-card p-3 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-card-foreground">{t.title}</span>
                    <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                        priorityStyles(t.priority)
                      )}
                    >
                      {priorityLabel(t.priority)}
                    </span>
                    <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-border bg-primary/10 text-[10px] font-bold text-primary">
                      {t.assignee?.name
                        ? t.assignee.name
                            .split(/\s+/)
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : "—"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {createOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-card-foreground">Create task</h2>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Title</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    {COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    {(["none", "low", "medium", "high", "urgent"] as TaskPriority[]).map((p) => (
                      <option key={p} value={p}>
                        {priorityLabel(p)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Assignee</label>
                <select
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="h-10 rounded-lg border border-border px-4 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
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

      {detailTask ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-card-foreground">Task details</h2>
            <form onSubmit={saveDetail} className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Title</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="mt-1 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    {COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    {(["none", "low", "medium", "high", "urgent"] as TaskPriority[]).map((p) => (
                      <option key={p} value={p}>
                        {priorityLabel(p)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Assignee</label>
                <select
                  value={editAssignee}
                  onChange={(e) => setEditAssignee(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDetailTask(null)}
                  className="h-10 rounded-lg border border-border px-4 text-sm font-medium"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={savingDetail}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {savingDetail ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
