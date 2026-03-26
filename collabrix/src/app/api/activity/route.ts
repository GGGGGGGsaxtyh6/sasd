import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { activityLog, workspaceMembers } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

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

    const activities = await db.query.activityLog.findMany({
      where: eq(activityLog.workspaceId, workspaceId),
      orderBy: [desc(activityLog.createdAt)],
      limit: 50,
      with: { user: true },
    });

    const sanitized = activities.map((a) => ({
      ...a,
      user: a.user ? { id: a.user.id, name: a.user.name, avatarUrl: a.user.avatarUrl } : null,
    }));

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
