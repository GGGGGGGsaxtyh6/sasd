import { createWorkspace, listUserWorkspaces } from "@/src/services/workspaces";
import { handleRouteError, jsonOk } from "@/src/lib/http";
import { requireSession } from "@/src/lib/auth";
import { workspaceCreateSchema } from "@/src/lib/validation";

export async function GET() {
  try {
    const session = await requireSession();
    return jsonOk({ workspaces: listUserWorkspaces(session) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const body = workspaceCreateSchema.parse(await request.json());
    const workspace = createWorkspace(session, body);
    return jsonOk({ workspace }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
