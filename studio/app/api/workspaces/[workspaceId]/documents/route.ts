import { requireSession } from "@/src/lib/auth";
import { handleRouteError, jsonOk, parseJson } from "@/src/lib/http";
import {
  createDocumentSchema,
  documentMetadataSchema,
} from "@/src/lib/validation";
import {
  createDocument,
  getDocument,
  listDocuments,
  updateDocumentMetadata,
} from "@/src/services/documents";

export async function GET(
  request: Request,
  ctx: RouteContext<"/api/workspaces/[workspaceId]/documents">,
) {
  try {
    const session = await requireSession(request);
    const { workspaceId } = await ctx.params;
    const documentId = new URL(request.url).searchParams.get("documentId");

    if (documentId) {
      return jsonOk(getDocument(workspaceId, documentId, session.user.id));
    }

    return jsonOk(listDocuments(workspaceId, session.user.id));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/workspaces/[workspaceId]/documents">,
) {
  try {
    const session = await requireSession(request);
    const { workspaceId } = await ctx.params;
    const input = createDocumentSchema.parse(await parseJson(request));
    return jsonOk(
      createDocument({
        workspaceId,
        userId: session.user.id,
        title: input.title,
        summary: input.summary,
        kind: input.kind,
      }),
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/workspaces/[workspaceId]/documents">,
) {
  try {
    const session = await requireSession(request);
    const { workspaceId } = await ctx.params;
    const input = documentMetadataSchema.parse(await parseJson(request));
    return jsonOk(
      updateDocumentMetadata({
        workspaceId,
        documentId: input.documentId,
        userId: session.user.id,
        title: input.title,
        summary: input.summary,
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
