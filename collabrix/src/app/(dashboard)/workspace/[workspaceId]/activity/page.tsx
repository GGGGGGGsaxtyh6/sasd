"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Activity as ActivityIcon, Clock } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

type ActivityRow = {
  id: string;
  action: string;
  entityType: string;
  entityTitle: string | null;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null } | null;
};

export default function ActivityPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [items, setItems] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/activity?workspaceId=${encodeURIComponent(workspaceId)}`);
      if (res.ok) setItems(await res.json());
      else setItems([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-3xl p-6 pb-16">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ActivityIcon className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Activity</h1>
          <p className="text-sm text-muted-foreground">Recent actions in this workspace.</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-20 text-center">
          <Clock className="h-10 w-10 text-muted-foreground" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold text-foreground">No activity yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            When you and your team create documents, tasks, and comments, they will show up here.
          </p>
        </div>
      ) : (
        <ol className="relative border-l border-border pl-6">
          {items.map((a) => (
            <li key={a.id} className="mb-8 ml-1 last:mb-0">
              <span className="absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full border-2 border-background bg-primary" />
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <p className="text-sm text-card-foreground">
                  <span className="font-semibold">{a.user?.name ?? "Someone"}</span>{" "}
                  <span className="text-muted-foreground">{a.action}</span>{" "}
                  <span className="font-medium capitalize">{a.entityType}</span>
                  {a.entityTitle ? (
                    <>
                      {" "}
                      <span className="text-muted-foreground">&ldquo;{a.entityTitle}&rdquo;</span>
                    </>
                  ) : null}
                </p>
                <time
                  className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"
                  dateTime={a.createdAt}
                >
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {formatRelativeTime(a.createdAt)}
                </time>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
