import { requireSession } from "@/src/lib/auth";
import { errorResponse } from "@/src/lib/http";
import { getWorkspaceMembership } from "@/src/lib/auth";
import { getWorkspaceEvents } from "@/src/services/workspaces";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: RouteContext<"/api/workspaces/[workspaceId]/stream">,
) {
  try {
    const session = await requireSession(request);
    const { workspaceId } = await context.params;
    const membership = getWorkspaceMembership(workspaceId, session.user.id);

    if (!membership) {
      return errorResponse("No perteneces a este workspace", 403);
    }

    const after = Number(new URL(request.url).searchParams.get("after") ?? "0");
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        let cursor = Number.isFinite(after) ? after : 0;
        let closed = false;

        const send = () => {
          if (closed) return;
          const events = getWorkspaceEvents(workspaceId, cursor);
          for (const event of events) {
            cursor = event.id;
            controller.enqueue(
              encoder.encode(`id: ${event.id}\nevent: ${event.eventType}\ndata: ${event.payloadJson}\n\n`),
            );
          }
        };

        send();
        const interval = setInterval(send, 1500);

        const heartbeat = setInterval(() => {
          if (closed) return;
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        }, 10000);

        request.signal.addEventListener("abort", () => {
          closed = true;
          clearInterval(interval);
          clearInterval(heartbeat);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
