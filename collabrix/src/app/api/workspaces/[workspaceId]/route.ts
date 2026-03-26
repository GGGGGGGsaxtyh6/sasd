import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { workspaces, workspaceMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { workspaceSchema } from "@/lib/validations";

export async function GET(
  _req: Request,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId } = await context.params;

    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      ),
    });
    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.id, workspaceId),
    });
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const members = await db.query.workspaceMembers.findMany({
      where: eq(workspaceMembers.workspaceId, workspaceId),
      with: { user: true },
    });

    const sanitizedMembers = members.map((m) => ({
      id: m.id,
      role: m.role,
      joinedAt: m.joinedAt,
      user: m.user
        ? {
            id: m.user.id,
            name: m.user.name,
            email: m.user.email,
            avatarUrl: m.user.avatarUrl,
          }
        : null,
    }));

    return NextResponse.json({
      workspace,
      members: sanitizedMembers,
      currentUserRole: membership.role,
    });
  } catch (error) {
    console.error("Error fetching workspace:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId } = await context.params;

    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      ),
    });
    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = workspaceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid workspace name or description" }, { status: 400 });
    }

    const updates: Record<string, string | null> = {
      name: parsed.data.name,
      updatedAt: new Date().toISOString(),
    };
    if (parsed.data.description !== undefined) {
      updates.description = parsed.data.description ?? null;
    }

    await db.update(workspaces).set(updates).where(eq(workspaces.id, workspaceId));

    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.id, workspaceId),
    });

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Error updating workspace:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId } = await context.params;

    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.id, workspaceId),
    });
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    if (workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Only the workspace owner can delete it" }, { status: 403 });
    }

    await db.delete(workspaces).where(eq(workspaces.id, workspaceId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
