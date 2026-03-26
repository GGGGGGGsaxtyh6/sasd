import fs from "node:fs";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { requireSession } from "@/src/lib/auth";
import { errorResponse } from "@/src/lib/http";
import { db } from "@/src/lib/db";
import { files, workspaceMembers } from "@/src/lib/schema";

export async function GET(
  request: Request,
  context: RouteContext<"/api/files/[fileId]">,
) {
  try {
    const session = await requireSession(request);
    const { fileId } = await context.params;

    const file = db
      .select({
        id: files.id,
        workspaceId: files.workspaceId,
        filename: files.filename,
        mimeType: files.mimeType,
        storagePath: files.storagePath,
      })
      .from(files)
      .where(eq(files.id, fileId))
      .get();

    if (!file) {
      return errorResponse("Archivo no encontrado", 404);
    }

    const membership = db
      .select({ id: workspaceMembers.id })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, file.workspaceId),
          eq(workspaceMembers.userId, session.user.id),
        ),
      )
      .get();

    if (!membership) {
      return errorResponse("No autorizado", 403);
    }

    if (!fs.existsSync(file.storagePath)) {
      return errorResponse("Archivo no disponible", 404);
    }

    const stream = fs.createReadStream(path.resolve(file.storagePath));
    return new Response(stream as unknown as BodyInit, {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `inline; filename="${file.filename}"`,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
