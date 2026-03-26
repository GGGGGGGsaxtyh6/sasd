import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await db.query.notifications.findMany({
      where: eq(notifications.userId, session.user.id),
      orderBy: [desc(notifications.createdAt)],
      limit: 30,
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    if (id === "all") {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, session.user.id));
    } else if (id) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, id), eq(notifications.userId, session.user.id)));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
