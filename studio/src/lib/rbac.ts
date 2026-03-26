import { and, eq } from "drizzle-orm";
import { roleRank } from "@/src/lib/constants";
import { db } from "@/src/lib/db";
import { workspaceMembers, users } from "@/src/lib/schema";
import type { SessionUser, WorkspaceRole } from "@/src/lib/auth";

export async function getUserById(userId: string): Promise<SessionUser | null> {
  const row = db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      isAdmin: users.isAdmin,
    })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  return row ?? null;
}

export async function getWorkspaceRole(
  userId: string,
  workspaceId: string,
): Promise<WorkspaceRole | null> {
  const membership = db
    .select({ role: workspaceMembers.role })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.userId, userId),
        eq(workspaceMembers.workspaceId, workspaceId),
      ),
    )
    .get();

  return (membership?.role as WorkspaceRole | undefined) ?? null;
}

export function hasWorkspaceAccess(
  role: WorkspaceRole | null,
  minimum: WorkspaceRole,
) {
  return role ? roleRank[role] >= roleRank[minimum] : false;
}

export function isPlatformAdmin(user: SessionUser | null) {
  return Boolean(user?.isAdmin);
}
