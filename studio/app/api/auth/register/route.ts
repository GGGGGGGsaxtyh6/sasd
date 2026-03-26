import { eq } from "drizzle-orm";
import { db } from "@/src/lib/db";
import { users } from "@/src/lib/schema";
import { createErrorResponse, createJsonResponse } from "@/src/lib/http";
import { hashPassword, createSession } from "@/src/lib/auth";
import { createId } from "@/src/lib/utils";
import { registerSchema, withParsedBody } from "@/src/lib/validation";

export async function POST(request: Request) {
  try {
    const input = await withParsedBody(request, registerSchema);
    const existing = db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, input.email))
      .get();

    if (existing) {
      return createErrorResponse("Ya existe una cuenta con este email", 409);
    }

    const now = Date.now();
    const userId = createId("usr");
    const passwordHash = await hashPassword(input.password);

    db.insert(users)
      .values({
        id: userId,
        email: input.email,
        name: input.name,
        passwordHash,
        avatarColor: "#6366f1",
        locale: "es",
        isAdmin: false,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    await createSession(userId, request);

    return createJsonResponse({
      ok: true,
      user: {
        id: userId,
        email: input.email,
        name: input.name,
      },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
