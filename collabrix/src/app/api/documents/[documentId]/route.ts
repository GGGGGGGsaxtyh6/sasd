import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { documents, workspaceMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: Request,
  context: { params: Promise<{ documentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await context.params;
    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, documentId),
    });
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, doc.workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      ),
    });
    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
