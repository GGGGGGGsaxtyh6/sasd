import { requireSession } from "@/src/lib/auth";
import { handleRouteError, jsonOk } from "@/src/lib/http";
import { addWorkspaceMember, listWorkspaceMembers } from "@/src/services/workspaces";
import { addMemberSchema } from "@/src/lib/validation";

type Params = Promise<{ workspaceId: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  try {
    const session = await requireSession();
    const { workspaceId } = await params;
    return jsonOk({ members: listWorkspaceMembers(session, workspaceId) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    const session = await requireSession(request);
    const { workspaceId } = await params;
    const payload = addMemberSchema.parse(await request.json());
    addWorkspaceMember(session, workspaceId, payload);
    return jsonOk({ success: true }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
