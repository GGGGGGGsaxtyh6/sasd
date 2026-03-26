import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, workspaces, documents, tasks } from "@/db/schema";
import { count } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
    });

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const [userCount] = await db.select({ count: count() }).from(users);
    const [workspaceCount] = await db.select({ count: count() }).from(workspaces);
    const [documentCount] = await db.select({ count: count() }).from(documents);
    const [taskCount] = await db.select({ count: count() }).from(tasks);

    const allUsers = await db.query.users.findMany({
      columns: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({
      stats: {
        users: userCount.count,
        workspaces: workspaceCount.count,
        documents: documentCount.count,
        tasks: taskCount.count,
      },
      users: allUsers,
    });
  } catch (error) {
    console.error("Admin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
