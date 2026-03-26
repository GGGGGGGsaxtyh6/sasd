import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { workspaces, workspaceMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { workspaceSchema } from "@/lib/validations";
import { generateId, slugify } from "@/lib/utils";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberships = await db.query.workspaceMembers.findMany({
      where: eq(workspaceMembers.userId, session.user.id),
      with: { workspace: true },
    });

    return NextResponse.json(memberships.map((m) => ({
      ...m.workspace,
      role: m.role,
    })));
  } catch (error) {
    console.error("Error fetching workspaces:", error);
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
    const parsed = workspaceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, description } = parsed.data;
    const id = generateId();
    const slug = slugify(name) + "-" + id.substring(0, 8);

    await db.insert(workspaces).values({
      id,
      name,
      slug,
      description: description || null,
      ownerId: session.user.id,
    });

    await db.insert(workspaceMembers).values({
      id: generateId(),
      workspaceId: id,
      userId: session.user.id,
      role: "owner",
    });

    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.id, id),
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
