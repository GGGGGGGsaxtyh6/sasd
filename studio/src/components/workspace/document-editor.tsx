"use client";

import { useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";

type CommentItem = {
  id: string;
  body: string;
  authorId: string;
  createdAt: number;
  parentId: string | null;
};

type PresenceItem = {
  userId: string;
  lastSeenAt: number;
};

type Props = {
  workspaceId: string;
  documentId: string;
  token: string;
  collabUrl: string;
  user: { id: string; name: string };
  initialTitle: string;
  initialSummary: string;
  initialComments: CommentItem[];
  initialPresence: PresenceItem[];
};

const palette = ["#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#22c55e"];

function colorFromId(id: string) {
  const sum = [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return palette[sum % palette.length];
}

export function DocumentEditor(props: Props) {
  const [title, setTitle] = useState(props.initialTitle);
  const [summary, setSummary] = useState(props.initialSummary);
  const [comments, setComments] = useState<CommentItem[]>(props.initialComments);
  const [presence, setPresence] = useState<PresenceItem[]>(props.initialPresence);
  const [commentBody, setCommentBody] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);
  const [aiOutput, setAiOutput] = useState("");

  const provider = useMemo(() => {
    const document = new Y.Doc();
    return new HocuspocusProvider({
      url: props.collabUrl,
      name: props.documentId,
      document,
      token: props.token,
    });
  }, [props.collabUrl, props.documentId, props.token]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ undoRedo: false }),
      Collaboration.configure({ document: provider.document }),
      CollaborationCaret.configure({
        provider,
        user: {
          name: props.user.name,
          color: colorFromId(props.user.id),
        },
      }),
    ],
  });

  useEffect(() => {
    const awareness = provider.awareness;
    if (!awareness) {
      return () => {
        provider.destroy();
      };
    }

    const updatePresence = () => {
      const states = Array.from(awareness.getStates().entries()).map(([key, value]) => ({
        userId: String(value.user?.id ?? key),
        lastSeenAt: Date.now(),
      }));
      setPresence(states);
    };

    awareness.setLocalStateField("user", {
      id: props.user.id,
      name: props.user.name,
      color: colorFromId(props.user.id),
    });
    awareness.on("change", updatePresence);
    updatePresence();

    return () => {
      awareness.off("change", updatePresence);
      provider.destroy();
    };
  }, [props.user.id, props.user.name, provider]);

  async function saveMetadata() {
    setSavingMeta(true);
    try {
      const response = await fetch(`/api/workspaces/${props.workspaceId}/documents/${props.documentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, summary }),
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar");
      }

      toast.success("Metadatos guardados");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar");
    } finally {
      setSavingMeta(false);
    }
  }

  async function submitComment() {
    if (!commentBody.trim()) return;

    const response = await fetch(`/api/workspaces/${props.workspaceId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentId: props.documentId,
        body: commentBody,
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      toast.error(payload.error ?? "No se pudo crear el comentario");
      return;
    }

    setComments((current) => [
      ...current,
      {
        id: payload.id,
        body: payload.body,
        authorId: props.user.id,
        createdAt: Date.now(),
        parentId: null,
      },
    ]);
    setCommentBody("");
    toast.success("Comentario enviado");
  }

  async function runAi(action: "summarize" | "rewrite" | "classify" | "generate" | "ask") {
    const response = await fetch(`/api/workspaces/${props.workspaceId}/ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        documentId: props.documentId,
        instruction:
          action === "ask"
            ? "Responde una pregunta corta sobre este documento."
            : "Aplica la acción sobre el documento actual.",
        text: editor?.getText() ?? summary,
      }),
    });

    if (!response.ok) {
      const payload = await response.json();
      toast.error(payload.error ?? "No se pudo ejecutar IA");
      return;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("text/event-stream")) {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let text = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value);
        }
      }
      setAiOutput(text);
      toast.success(`IA ejecutada (${action})`);
      return;
    }

    const payload = await response.json();
    setAiOutput(payload.output ?? "");
    toast.success(`IA ejecutada (${payload.mode})`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <Card className="space-y-4 p-5">
          <div className="flex flex-col gap-3 md:flex-row">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            <Button onClick={saveMetadata} disabled={savingMeta}>
              {savingMeta ? "Guardando..." : "Guardar"}
            </Button>
          </div>
          <Textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Resumen del documento"
            rows={3}
          />
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-slate-100">
            <EditorContent editor={editor} className="[&_.ProseMirror]:min-h-[420px] [&_.ProseMirror]:outline-none" />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="space-y-4 p-5">
          <div>
            <p className="text-sm font-semibold text-white">Presencia en vivo</p>
            <p className="mt-1 text-xs text-slate-400">
              {presence.length} usuarios recientes en este documento.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {presence.map((item) => (
              <span
                key={item.userId}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300"
              >
                {item.userId.slice(0, 8)}
              </span>
            ))}
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <p className="text-sm font-semibold text-white">IA integrada</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => runAi("summarize")}>
              Resumir
            </Button>
            <Button variant="secondary" onClick={() => runAi("rewrite")}>
              Reescribir
            </Button>
            <Button variant="secondary" onClick={() => runAi("classify")}>
              Clasificar
            </Button>
            <Button variant="secondary" onClick={() => runAi("generate")}>
              Generar
            </Button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
            {aiOutput || "Las respuestas de IA aparecerán aquí en cuanto ejecutes una acción."}
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <p className="text-sm font-semibold text-white">Comentarios</p>
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
                <p className="text-slate-300">{comment.body}</p>
                <p className="mt-2 text-xs text-slate-500">{comment.authorId.slice(0, 8)}</p>
              </div>
            ))}
          </div>
          <Textarea
            value={commentBody}
            onChange={(event) => setCommentBody(event.target.value)}
            placeholder="Escribe un comentario"
            rows={4}
          />
          <Button onClick={submitComment}>Publicar comentario</Button>
        </Card>
      </div>
    </div>
  );
}
