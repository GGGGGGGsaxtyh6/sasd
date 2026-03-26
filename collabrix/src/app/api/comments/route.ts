import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { comments, documents, tasks, workspaceMembers, activityLog, notifications } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { commentSchema } from "@/lib/validations";
import { generateId } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documentId = req.nextUrl.searchParams.get("documentId");
    const taskId = req.nextUrl.searchParams.get("taskId");

    if (!documentId && !taskId) {
      return NextResponse.json({ error: "documentId or taskId required" }, { status: 400 });
    }

    const where = documentId
      ? eq(comments.documentId, documentId)
      : eq(comments.taskId, taskId!);

    const allComments = await db.query.comments.findMany({
      where,
      orderBy: [desc(comments.createdAt)],
      with: { user: true },
    });

    const sanitized = allComments.map((c) => ({
      ...c,
      user: c.user ? { id: c.user.id, name: c.user.name, email: c.user.email, avatarUrl: c.user.avatarUrl } : null,
    }));

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { documentId, taskId } = body;
    if (!documentId && !taskId) {
      return NextResponse.json({ error: "documentId or taskId required" }, { status: 400 });
    }

    let workspaceId: string;
    if (documentId) {
      const doc = await db.query.documents.findFirst({ where: eq(documents.id, documentId) });
      if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });
      workspaceId = doc.workspaceId;
    } else {
      const task = await db.query.tasks.findFirst({ where: eq(tasks.id, taskId!) });
      if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
      workspaceId = task.workspaceId;
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

    const id = generateId();
    await db.insert(comments).values({
      id,
      content: parsed.data.content,
      documentId: documentId || null,
      taskId: taskId || null,
      userId: session.user.id,
      parentId: parsed.data.parentId || null,
    });

    await db.insert(activityLog).values({
      id: generateId(),
      action: "commented",
      entityType: documentId ? "document" : "task",
      entityId: documentId || taskId!,
      workspaceId,
      userId: session.user.id,
    });

    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, id),
      with: { user: true },
    });

    return NextResponse.json({
      ...comment,
      user: comment?.user ? { id: comment.user.id, name: comment.user.name, email: comment.user.email, avatarUrl: comment.user.avatarUrl } : null,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
