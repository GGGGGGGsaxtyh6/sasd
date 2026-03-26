import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getActiveSession } from "@/src/lib/auth";
import { env } from "@/src/lib/env";
import { SESSION_COOKIE_NAME } from "@/src/lib/constants";
import { getDocumentDetail } from "@/src/services/workspaces";
import { DocumentEditor } from "@/src/components/workspace/document-editor";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ workspaceId: string; documentId: string }>;
}) {
  const { workspaceId, documentId } = await params;
  const session = await getActiveSession();

  if (!session) {
    redirect("/login");
  }

  const detail = getDocumentDetail(session, workspaceId, documentId);
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Documento</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{detail.document?.title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Edicion colaborativa con CRDT, comentarios, presencia e IA dentro del mismo workspace.
        </p>
      </div>

      <DocumentEditor
        workspaceId={workspaceId}
        documentId={documentId}
        token={token}
        collabUrl={env.COLLAB_URL}
        user={{ id: session.user.id, name: session.user.name }}
        initialTitle={String(detail.document?.title ?? "Documento")}
        initialSummary={String(detail.document?.summary ?? "")}
        initialComments={detail.comments.map((comment) => ({
          id: comment.id,
          body: comment.body,
          authorId: comment.authorId,
          createdAt: comment.createdAt,
          parentId: comment.parentId,
        }))}
        initialPresence={detail.presence.map((item) => ({
          userId: item.userId,
          lastSeenAt: item.lastSeenAt,
        }))}
      />
    </div>
  );
}
