import { desc } from "drizzle-orm";
import { requireSession, requireSystemAdmin } from "@/src/lib/auth";
import { db } from "@/src/lib/db";
import { errorResponse, jsonResponse } from "@/src/lib/http";
import { activities, users, workspaces } from "@/src/lib/schema";

export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    requireSystemAdmin(session);

    const recentUsers = db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(10)
      .all();

    const recentWorkspaces = db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        slug: workspaces.slug,
        plan: workspaces.plan,
        createdAt: workspaces.createdAt,
      })
      .from(workspaces)
      .orderBy(desc(workspaces.createdAt))
      .limit(10)
      .all();

    const latestActivity = db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(20)
      .all();

    return jsonResponse({
      users: recentUsers,
      workspaces: recentWorkspaces,
      activity: latestActivity,
      me: session.user,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
