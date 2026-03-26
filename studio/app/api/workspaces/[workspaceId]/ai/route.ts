import OpenAI from "openai";
import { eq } from "drizzle-orm";
import { requireSession } from "@/src/lib/auth";
import { db } from "@/src/lib/db";
import { env } from "@/src/lib/env";
import { errorResponse } from "@/src/lib/http";
import { aiActionSchema } from "@/src/lib/validation";
import { aiGenerations, documentSnapshots, documents } from "@/src/lib/schema";
import { createId, nowTs } from "@/src/lib/utils";
import { getWorkspaceMembership } from "@/src/lib/auth";

const client = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

function localFallback(action: string, prompt: string, contextText: string) {
  const short = contextText.slice(0, 800).trim();

  switch (action) {
    case "summarize":
      return `Resumen local:\n\n${short || prompt}`.slice(0, 1200);
    case "rewrite":
      return `Reescritura sugerida:\n\n${prompt.trim()}\n\nContexto:\n${short}`.slice(0, 1200);
    case "classify":
      return JSON.stringify(
        {
          prioridad: short.toLowerCase().includes("riesgo") ? "alta" : "media",
          categoria: short.toLowerCase().includes("lanzamiento") ? "go-to-market" : "general",
        },
        null,
        2,
      );
    case "generate":
      return `Borrador generado:\n\n# ${prompt.trim()}\n\n- Objetivo\n- Riesgos\n- Proximos pasos\n\nContexto:\n${short}`.slice(0, 1200);
    default:
      return `Respuesta local:\n\nBasado en el contenido disponible, la mejor respuesta inicial es:\n${short || prompt}`.slice(0, 1200);
  }
}

async function getContextText(workspaceId: string) {
  const docs = db
    .select({
      title: documents.title,
      summary: documents.summary,
      jsonPreview: documentSnapshots.jsonPreview,
    })
    .from(documents)
    .leftJoin(documentSnapshots, eq(documentSnapshots.documentId, documents.id))
    .where(eq(documents.workspaceId, workspaceId))
    .limit(8)
    .all();

  return docs
    .map((doc) => [doc.title, doc.summary, doc.jsonPreview ?? ""].filter(Boolean).join("\n"))
    .join("\n\n---\n\n");
}

export async function POST(
  request: Request,
  context: RouteContext<"/api/workspaces/[workspaceId]/ai">,
) {
  try {
    const session = await requireSession(request);
    const { workspaceId } = await context.params;
    const membership = getWorkspaceMembership(workspaceId, session.user.id);

    if (!membership) {
      return errorResponse("No perteneces a este workspace", 403);
    }

    const body = aiActionSchema.parse(await request.json());
    const contextText = await getContextText(workspaceId);
    const prompt = body.instruction || body.text || `Accion ${body.action} sobre el workspace`;
    const targetType = body.documentId ? "document" : "workspace";
    const targetId = body.documentId ?? workspaceId;

    if (!client) {
      const output = localFallback(body.action, prompt, contextText);
      db.insert(aiGenerations)
        .values({
          id: createId("ai"),
          workspaceId,
          userId: session.user.id,
          targetType,
          targetId,
          prompt,
          output,
          createdAt: nowTs(),
        })
        .run();

      return Response.json({
        mode: "fallback",
        output,
      });
    }

    const fullPrompt = [
      `Accion: ${body.action}`,
      `Objetivo del usuario: ${prompt}`,
      `Workspace context:\n${contextText || "Sin contexto adicional."}`,
    ].join("\n\n");

    const stream = await client.responses.create({
      model: env.OPENAI_MODEL,
      stream: true,
      input: fullPrompt,
    });

    const encoder = new TextEncoder();
    let fullText = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "response.output_text.delta") {
              fullText += event.delta;
              controller.enqueue(
                encoder.encode(`event: delta\ndata: ${JSON.stringify({ delta: event.delta })}\n\n`),
              );
            }
          }

          db.insert(aiGenerations)
            .values({
              id: createId("ai"),
              workspaceId,
              userId: session.user.id,
              targetType,
              targetId,
              prompt,
              output: fullText,
              createdAt: nowTs(),
            })
            .run();

          controller.enqueue(
            encoder.encode(`event: done\ndata: ${JSON.stringify({ done: true })}\n\n`),
          );
          controller.close();
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({
                message: error instanceof Error ? error.message : "Error en IA",
              })}\n\n`,
            ),
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
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
