import { requireSession } from "@/src/lib/auth";
import { handleApiError, jsonOk } from "@/src/lib/http";
import { createTaskInputSchema } from "@/src/lib/validation";
import { createTask, listWorkspaceTasks } from "@/src/services/workspaces";

export async function GET(
  request: Request,
  context: RouteContext<"/api/workspaces/[workspaceId]/tasks">,
) {
  try {
    const session = await requireSession(request);
    const { workspaceId } = await context.params;

    return jsonOk({
      tasks: listWorkspaceTasks(session, workspaceId),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: Request,
  context: RouteContext<"/api/workspaces/[workspaceId]/tasks">,
) {
  try {
    const session = await requireSession(request);
    const { workspaceId } = await context.params;
    const body = createTaskInputSchema.parse(await request.json());

    const created = createTask(session, workspaceId, body);
    return jsonOk(created, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
