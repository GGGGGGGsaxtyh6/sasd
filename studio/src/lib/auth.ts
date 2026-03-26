import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { SESSION_COOKIE_NAME, roleRank, sessionDurationMs } from "@/src/lib/constants";
import { db } from "@/src/lib/db";
import { env, isProd } from "@/src/lib/env";
import { sessions, users, workspaceMembers } from "@/src/lib/schema";

const secret = new TextEncoder().encode(env.JWT_SECRET);

export type WorkspaceRole = keyof typeof roleRank;

export class AuthError extends Error {
  constructor(message: string, public status = 401) {
    super(message);
  }
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
};

export type ActiveSession = {
  sessionId: string;
  user: SessionUser;
};

function derivePasswordKey(password: string, salt: string) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password,
      salt,
      64,
      {
        N: 2 ** 15,
        r: 8,
        p: 1,
        maxmem: 128 * 1024 * 1024,
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      },
    );
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await derivePasswordKey(password, salt);
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) {
    return false;
  }

  const derived = await derivePasswordKey(password, salt);

  return timingSafeEqual(Buffer.from(hash, "hex"), derived);
}

function requestFingerprint(request: Request) {
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const forwarded = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  return createHmac("sha256", env.JWT_SECRET)
    .update(`${userAgent}:${forwarded}`)
    .digest("hex");
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function resolveSessionFromToken(
  token: string,
  requestFingerprintValue?: string,
): Promise<ActiveSession | null> {
  try {
    const verified = await jwtVerify(token, secret);
    const sid = verified.payload.sid;
    const fp = verified.payload.fp;
    const sessionToken = verified.payload.st;

    if (
      typeof sid !== "string" ||
      typeof fp !== "string" ||
      typeof sessionToken !== "string"
    ) {
      return null;
    }

    if (requestFingerprintValue && requestFingerprintValue !== fp) {
      return null;
    }

    const row = db
      .select({
        sessionId: sessions.id,
        expiresAt: sessions.expiresAt,
        storedTokenHash: sessions.tokenHash,
        userId: users.id,
        email: users.email,
        name: users.name,
        isAdmin: users.isAdmin,
      })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(eq(sessions.id, sid))
      .get();

    if (!row) {
      return null;
    }

    if (row.expiresAt < Date.now()) {
      db.delete(sessions).where(eq(sessions.id, sid)).run();
      return null;
    }

    if (row.storedTokenHash !== tokenHash(sessionToken)) {
      return null;
    }

    db.update(sessions)
      .set({ lastSeenAt: Date.now() })
      .where(eq(sessions.id, sid))
      .run();

    return {
      sessionId: row.sessionId,
      user: {
        id: row.userId,
        email: row.email,
        name: row.name,
        isAdmin: Boolean(row.isAdmin),
      },
    };
  } catch {
    return null;
  }
}

export async function createSession(userId: string, request: Request) {
  const sessionId = crypto.randomUUID();
  const rawToken = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + sessionDurationMs;
  const userAgent = request.headers.get("user-agent");
  const ipAddress = request.headers.get("x-forwarded-for") ?? null;

  db.insert(sessions)
    .values({
      id: sessionId,
      userId,
      tokenHash: tokenHash(rawToken),
      expiresAt,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      userAgent,
      ipAddress,
    })
    .run();

  const token = await new SignJWT({
    sid: sessionId,
    fp: requestFingerprint(request),
    st: rawToken,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });

  return { sessionId, expiresAt };
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getActiveSession(request?: Request): Promise<ActiveSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  return resolveSessionFromToken(token, request ? requestFingerprint(request) : undefined);
}

export async function getSessionFromCookieValue(
  token: string | null | undefined,
  request?: Request,
) {
  if (!token) {
    return null;
  }

  return resolveSessionFromToken(token, request ? requestFingerprint(request) : undefined);
}

export async function validateSessionToken(
  token: string | null | undefined,
  fingerprint?: { userAgent?: string; forwardedFor?: string | null },
) {
  const expectedFingerprint = fingerprint
    ? createHmac("sha256", env.JWT_SECRET)
        .update(`${fingerprint.userAgent ?? "unknown"}:${fingerprint.forwardedFor ?? "127.0.0.1"}`)
        .digest("hex")
    : undefined;

  if (!token) {
    return null;
  }

  return resolveSessionFromToken(token, expectedFingerprint);
}

export async function requireSession(request?: Request) {
  const session = await getActiveSession(request);
  if (!session) {
    throw new AuthError("No autenticado", 401);
  }
  return session;
}

export function requireSystemAdmin(session: ActiveSession) {
  if (!session.user.isAdmin) {
    throw new AuthError("Acceso restringido", 403);
  }
}

export function requireMembershipRole(role: WorkspaceRole, membership?: { role: string }) {
  if (!membership) {
    throw new AuthError("No perteneces a este workspace", 403);
  }

  const membershipRole = membership.role as WorkspaceRole;
  if (roleRank[membershipRole] < roleRank[role]) {
    throw new AuthError("No tienes permisos suficientes", 403);
  }
}

export function getWorkspaceMembership(workspaceId: string, userId: string) {
  return db
    .select({
      id: workspaceMembers.id,
      role: workspaceMembers.role,
      workspaceId: workspaceMembers.workspaceId,
      userId: workspaceMembers.userId,
    })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId),
      ),
    )
    .get();
}
