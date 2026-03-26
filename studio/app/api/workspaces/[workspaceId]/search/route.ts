import { requireSession } from "@/src/lib/auth";
import { badRequest, handleRouteError, ok } from "@/src/lib/http";
import { querySchema } from "@/src/lib/validation";
import { searchWorkspace } from "@/src/services/workspaces";

export async function GET(
  request: Request,
  context: RouteContext<"/api/workspaces/[workspaceId]/search">,
) {
  try {
    const session = await requireSession(request);
    const { workspaceId } = await context.params;
    const url = new URL(request.url);
    const parsed = querySchema.safeParse({
      q: url.searchParams.get("q") ?? "",
    });

    if (!parsed.success) {
      return badRequest("Consulta invalida", parsed.error.flatten());
    }

    const results = searchWorkspace(session, workspaceId, parsed.data.q);
    return ok({ results });
  } catch (error) {
    return handleRouteError(error);
  }
}
