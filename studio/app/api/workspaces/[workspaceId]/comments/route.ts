import { requireSession } from "@/src/lib/auth";
import { badRequest, handleRouteError, json } from "@/src/lib/http";
import { commentInputSchema } from "@/src/lib/validation";
import { createComment } from "@/src/services/workspaces";

export async function POST(
  request: Request,
  context: RouteContext<"/api/workspaces/[workspaceId]/comments">,
) {
  try {
    const session = await requireSession(request);
    const { workspaceId } = await context.params;
    const body = await request.json();
    const input = commentInputSchema.safeParse(body);

    if (!input.success) {
      return badRequest("Comentario invalido", input.error.flatten());
    }

    const result = createComment(session, workspaceId, input.data);
    return json(result, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
