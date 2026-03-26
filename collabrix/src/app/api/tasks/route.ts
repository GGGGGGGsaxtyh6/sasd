import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { tasks, workspaceMembers, activityLog } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { taskSchema } from "@/lib/validations";
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

    const allTasks = await db.query.tasks.findMany({
      where: eq(tasks.workspaceId, workspaceId),
      orderBy: [desc(tasks.updatedAt)],
      with: { assignee: true, createdBy: true },
    });

    return NextResponse.json(allTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
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

    const parsed = taskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const id = generateId();
    await db.insert(tasks).values({
      id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status || "todo",
      priority: parsed.data.priority || "none",
      assigneeId: parsed.data.assigneeId || null,
      dueDate: parsed.data.dueDate || null,
      labels: JSON.stringify(parsed.data.labels || []),
      workspaceId,
      createdById: session.user.id,
    });

    await db.insert(activityLog).values({
      id: generateId(),
      action: "created",
      entityType: "task",
      entityId: id,
      entityTitle: parsed.data.title,
      workspaceId,
      userId: session.user.id,
    });

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
      with: { assignee: true, createdBy: true },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
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
      return NextResponse.json({ error: "Task id required" }, { status: 400 });
    }

    const task = await db.query.tasks.findFirst({ where: eq(tasks.id, id) });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, task.workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      ),
    });
    if (!membership || membership.role === "viewer") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const allowedFields: Record<string, unknown> = {};
    if (updates.title !== undefined) allowedFields.title = updates.title;
    if (updates.description !== undefined) allowedFields.description = updates.description;
    if (updates.status !== undefined) allowedFields.status = updates.status;
    if (updates.priority !== undefined) allowedFields.priority = updates.priority;
    if (updates.assigneeId !== undefined) allowedFields.assigneeId = updates.assigneeId;
    if (updates.dueDate !== undefined) allowedFields.dueDate = updates.dueDate;
    if (updates.labels !== undefined) allowedFields.labels = JSON.stringify(updates.labels);
    allowedFields.updatedAt = new Date().toISOString();

    await db.update(tasks).set(allowedFields).where(eq(tasks.id, id));

    const updated = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
      with: { assignee: true, createdBy: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Task id required" }, { status: 400 });
    }

    const task = await db.query.tasks.findFirst({ where: eq(tasks.id, id) });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, task.workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      ),
    });
    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await db.delete(tasks).where(eq(tasks.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
