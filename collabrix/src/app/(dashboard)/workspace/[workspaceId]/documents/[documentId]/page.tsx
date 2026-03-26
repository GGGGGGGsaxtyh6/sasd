"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  Sparkles,
  Loader2,
  MessageSquare,
  Send,
  FileText,
  Wand2,
  RefreshCw,
  Tags,
  HelpCircle,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

type DocumentRow = {
  id: string;
  title: string;
  content: string;
  workspaceId: string;
  updatedAt: string;
};

type CommentRow = {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null } | null;
};

type AIAction = "summarize" | "rewrite" | "generate" | "classify" | "ask";

const AI_ACTIONS: { action: AIAction; label: string; icon: React.ReactNode }[] = [
  { action: "summarize", label: "Summarize", icon: <FileText className="h-4 w-4" /> },
  { action: "rewrite", label: "Rewrite", icon: <RefreshCw className="h-4 w-4" /> },
  { action: "generate", label: "Generate", icon: <Wand2 className="h-4 w-4" /> },
  { action: "classify", label: "Classify", icon: <Tags className="h-4 w-4" /> },
  { action: "ask", label: "Ask", icon: <HelpCircle className="h-4 w-4" /> },
];

export default function DocumentEditorPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const documentId = params.documentId as string;

  const [doc, setDoc] = useState<DocumentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiStreaming, setAiStreaming] = useState(false);
  const [aiOutput, setAiOutput] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const hydrated = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadDoc = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${encodeURIComponent(documentId)}`);
      if (!res.ok) throw new Error("Failed to load document");
      const d = (await res.json()) as DocumentRow;
      setDoc(d);
      setTitle(d.title);
      setContent(d.content ?? "");
      hydrated.current = true;
    } catch {
      setDoc(null);
      window.dispatchEvent(
        new CustomEvent("app-toast", { detail: { message: "Could not load document", variant: "error" } })
      );
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?documentId=${encodeURIComponent(documentId)}`);
      if (res.ok) setComments(await res.json());
    } catch {
      setComments([]);
    }
  }, [documentId]);

  useEffect(() => {
    loadDoc();
    loadComments();
  }, [loadDoc, loadComments]);

  const patchDocument = useCallback(
    async (payload: { title?: string; content?: string }) => {
      if (!documentId) return;
      setSaveState("saving");
      try {
        const res = await fetch("/api/documents", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: documentId, ...payload }),
        });
        if (!res.ok) throw new Error("Save failed");
        const updated = (await res.json()) as DocumentRow;
        setDoc(updated);
        setSaveState("saved");
        window.dispatchEvent(new Event("collabrix:refresh-documents"));
        window.setTimeout(() => setSaveState("idle"), 2000);
      } catch {
        setSaveState("error");
        window.dispatchEvent(
          new CustomEvent("app-toast", { detail: { message: "Could not save document", variant: "error" } })
        );
      }
    },
    [documentId]
  );

  useEffect(() => {
    if (!hydrated.current || !doc) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (title === doc.title && content === (doc.content ?? "")) return;
      patchDocument({ title, content });
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [title, content, doc, patchDocument]);

  async function runAi(action: AIAction) {
    const bodyContent =
      action === "ask"
        ? window.prompt("What would you like to ask about this document?") || ""
        : content || title;
    if (!bodyContent.trim()) {
      window.dispatchEvent(
        new CustomEvent("app-toast", { detail: { message: "Add some content first", variant: "error" } })
      );
      return;
    }
    setAiOpen(true);
    setAiStreaming(true);
    setAiOutput("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          content: bodyContent,
          context: `Document title: ${title}\n\n${content}`.slice(0, 50000),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "AI request failed");
      }
      if (!res.body) {
        setAiOutput(await res.text());
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setAiOutput(accumulated);
      }
    } catch (e) {
      setAiOutput(e instanceof Error ? e.message : "Something went wrong");
      window.dispatchEvent(
        new CustomEvent("app-toast", { detail: { message: "AI action failed", variant: "error" } })
      );
    } finally {
      setAiStreaming(false);
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    setCommentSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, content: text }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Failed to post comment");
      }
      setCommentText("");
      await loadComments();
      window.dispatchEvent(
        new CustomEvent("app-toast", { detail: { message: "Comment added", variant: "success" } })
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("app-toast", {
          detail: {
            message: err instanceof Error ? err.message : "Comment failed",
            variant: "error",
          },
        })
      );
    } finally {
      setCommentSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="skeleton h-10 w-2/3 rounded-lg" />
        <div className="skeleton h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <p className="text-muted-foreground">Document not found or you don&apos;t have access.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-24 lg:px-6">
      {saveState !== "idle" ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              saveState === "saving" && "bg-muted text-foreground",
              saveState === "saved" && "bg-success/15 text-success",
              saveState === "error" && "bg-destructive/10 text-destructive"
            )}
          >
            {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Save failed"}
          </span>
        </div>
      ) : null}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4 w-full border-none bg-transparent text-3xl font-bold tracking-tight text-foreground outline-none placeholder:text-muted-foreground focus:ring-0"
        placeholder="Untitled"
        aria-label="Document title"
      />

      <div className="mb-4 flex flex-wrap gap-2 rounded-xl border border-border bg-muted/30 p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          AI actions
        </div>
        <div className="flex flex-wrap gap-2">
          {AI_ACTIONS.map(({ action, label, icon }) => (
            <button
              key={action}
              type="button"
              disabled={aiStreaming}
              onClick={() => runAi(action)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-card-foreground hover:bg-accent disabled:opacity-50"
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={18}
        className={cn(
          "mb-8 w-full resize-y rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-card-foreground shadow-sm",
          "placeholder:text-muted-foreground",
          "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        )}
        placeholder="Start writing…"
        aria-label="Document content"
      />

      {aiOpen ? (
        <div className="mb-10 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-card-foreground">AI output</h2>
            <button
              type="button"
              onClick={() => {
                setAiOpen(false);
                setAiOutput("");
              }}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto rounded-lg bg-muted/40 p-3 text-sm text-card-foreground whitespace-pre-wrap">
            {aiStreaming && !aiOutput ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Thinking…
              </span>
            ) : (
              aiOutput || "—"
            )}
          </div>
        </div>
      ) : null}

      <section className="border-t border-border pt-8">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" aria-hidden />
          <h2 className="text-lg font-semibold text-foreground">Comments</h2>
        </div>

        <form onSubmit={submitComment} className="mb-8 flex flex-col gap-2 sm:flex-row">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={2}
            placeholder="Write a comment…"
            className={cn(
              "min-h-[4rem] flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm",
              "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            )}
          />
          <button
            type="submit"
            disabled={commentSubmitting || !commentText.trim()}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-end rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50 sm:self-stretch"
          >
            {commentSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Post
          </button>
        </form>

        <ul className="space-y-4">
          {comments.length === 0 ? (
            <li className="text-sm text-muted-foreground">No comments yet. Start the thread.</li>
          ) : (
            comments.map((c) => (
              <li key={c.id} className="rounded-lg border border-border bg-muted/20 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-foreground">{c.user?.name ?? "Unknown"}</span>
                  <time className="text-xs text-muted-foreground" dateTime={c.createdAt}>
                    {formatRelativeTime(c.createdAt)}
                  </time>
                </div>
                <p className="whitespace-pre-wrap text-sm text-card-foreground">{c.content}</p>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
