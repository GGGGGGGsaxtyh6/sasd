import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { documents, tasks, workspaceMembers } from "@/db/schema";
import { eq, and, like, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const q = req.nextUrl.searchParams.get("q");
    const workspaceId = req.nextUrl.searchParams.get("workspaceId");

    if (!q || !workspaceId) {
      return NextResponse.json({ error: "q and workspaceId required" }, { status: 400 });
    }

    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      ),
    });
    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const searchTerm = `%${q}%`;

    const docs = await db.query.documents.findMany({
      where: and(
        eq(documents.workspaceId, workspaceId),
        eq(documents.isArchived, false),
        or(
          like(documents.title, searchTerm),
          like(documents.content, searchTerm)
        )
      ),
      limit: 20,
    });

    const taskResults = await db.query.tasks.findMany({
      where: and(
        eq(tasks.workspaceId, workspaceId),
        or(
          like(tasks.title, searchTerm),
          like(tasks.description, searchTerm)
        )
      ),
      limit: 20,
    });

    return NextResponse.json({
      documents: docs.map((d) => ({ ...d, type: "document" })),
      tasks: taskResults.map((t) => ({ ...t, type: "task" })),
    });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
