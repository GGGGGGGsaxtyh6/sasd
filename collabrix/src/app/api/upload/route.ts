import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { files, workspaceMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateId } from "@/lib/utils";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const workspaceId = formData.get("workspaceId") as string;

    if (!file || !workspaceId) {
      return NextResponse.json({ error: "file and workspaceId required" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      ),
    });
    if (!membership || membership.role === "viewer") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const id = generateId();
    const ext = path.extname(file.name) || "";
    const filename = `${id}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    await db.insert(files).values({
      id,
      name: file.name,
      path: `/uploads/${filename}`,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      workspaceId,
      uploadedById: session.user.id,
    });

    return NextResponse.json({
      id,
      name: file.name,
      path: `/uploads/${filename}`,
      mimeType: file.type,
      size: file.size,
    }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
