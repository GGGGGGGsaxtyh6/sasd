import { z } from "zod";
import { requireSession } from "@/src/lib/auth";
import { handleRouteError, jsonOk } from "@/src/lib/http";
import { validateBody } from "@/src/lib/validation";
import { getDocument, updateDocumentMetadata } from "@/src/services/documents";

const updateSchema = z.object({
  title: z.string().min(2).max(120),
  summary: z.string().max(1000).default(""),
});

export async function GET(
  request: Request,
  context: RouteContext<"/api/workspaces/[workspaceId]/documents/[documentId]">,
) {
  try {
    const session = await requireSession(request);
    const { workspaceId, documentId } = await context.params;
    const document = getDocument(workspaceId, documentId, session.user.id);
    return jsonOk(document);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/workspaces/[workspaceId]/documents/[documentId]">,
) {
  try {
    const session = await requireSession(request);
    const body = await validateBody(request, updateSchema);
    const { workspaceId, documentId } = await context.params;
    const document = updateDocumentMetadata({
      workspaceId,
      documentId,
      userId: session.user.id,
      title: body.title,
      summary: body.summary,
    });
    return jsonOk(document);
  } catch (error) {
    return handleRouteError(error);
  }
}
