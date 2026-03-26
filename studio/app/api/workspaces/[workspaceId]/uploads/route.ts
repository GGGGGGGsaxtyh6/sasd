import fs from "node:fs";
import path from "node:path";
import { requireSession } from "@/src/lib/auth";
import { env } from "@/src/lib/env";
import { errorResponse, successResponse } from "@/src/lib/http";
import { MAX_UPLOAD_SIZE_BYTES } from "@/src/lib/constants";
import { ensureDir } from "@/src/lib/server-utils";
import { slugify } from "@/src/lib/utils";
import { registerFile } from "@/src/services/workspaces";

export async function POST(
  request: Request,
  context: RouteContext<"/api/workspaces/[workspaceId]/uploads">,
) {
  try {
    const session = await requireSession(request);
    const { workspaceId } = await context.params;
    const formData = await request.formData();
    const file = formData.get("file");
    const documentId = (formData.get("documentId") as string | null) ?? null;

    if (!(file instanceof File)) {
      return errorResponse("Debes adjuntar un archivo", 400);
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return errorResponse("El archivo supera el tamaño máximo permitido", 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeName = slugify(file.name.replace(/\.[^.]+$/, "")) || "archivo";
    const ext = path.extname(file.name).slice(0, 16);
    const targetDir = path.join(env.UPLOAD_DIR, workspaceId);
    ensureDir(targetDir);

    const storedName = `${Date.now()}-${safeName}${ext}`;
    const storagePath = path.join(targetDir, storedName);
    fs.writeFileSync(storagePath, buffer);

    const result = registerFile(session, workspaceId, {
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      storagePath,
      documentId,
    });

    return successResponse({
      id: result.id,
      filename: file.name,
      size: file.size,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
