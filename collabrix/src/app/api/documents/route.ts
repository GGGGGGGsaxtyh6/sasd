import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { documents, workspaceMembers, activityLog } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { documentSchema } from "@/lib/validations";
import { generateId } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = req.nextUrl.searchParams.get("workspaceId");
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
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

    const docs = await db.query.documents.findMany({
      where: and(
        eq(documents.workspaceId, workspaceId),
        eq(documents.isArchived, false)
      ),
      orderBy: [desc(documents.updatedAt)],
    });

    return NextResponse.json(docs);
  } catch (error) {
    console.error("Error fetching documents:", error);
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
    const workspaceId = body.workspaceId;
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
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

    const parsed = documentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const id = generateId();
    await db.insert(documents).values({
      id,
      title: parsed.data.title,
      content: parsed.data.content || "",
      icon: parsed.data.icon,
      workspaceId,
      createdById: session.user.id,
    });

    await db.insert(activityLog).values({
      id: generateId(),
      action: "created",
      entityType: "document",
      entityId: id,
      entityTitle: parsed.data.title,
      workspaceId,
      userId: session.user.id,
    });

    const doc = await db.query.documents.findFirst({ where: eq(documents.id, id) });
    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "Document id required" }, { status: 400 });
    }

    const doc = await db.query.documents.findFirst({ where: eq(documents.id, id) });
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, doc.workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      ),
    });
    if (!membership || membership.role === "viewer") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const allowedFields: Record<string, unknown> = {};
    if (updates.title !== undefined) allowedFields.title = updates.title;
    if (updates.content !== undefined) allowedFields.content = updates.content;
    if (updates.icon !== undefined) allowedFields.icon = updates.icon;
    if (updates.isArchived !== undefined) allowedFields.isArchived = updates.isArchived;
    if (updates.coverImage !== undefined) allowedFields.coverImage = updates.coverImage;
    allowedFields.updatedAt = new Date().toISOString();

    await db.update(documents).set(allowedFields).where(eq(documents.id, id));

    const updated = await db.query.documents.findFirst({ where: eq(documents.id, id) });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
