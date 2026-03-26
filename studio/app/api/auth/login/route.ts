import { eq } from "drizzle-orm";
import { db } from "@/src/lib/db";
import { jsonError, jsonOk } from "@/src/lib/http";
import { createSession, verifyPassword } from "@/src/lib/auth";
import { users } from "@/src/lib/schema";
import { loginSchema } from "@/src/lib/validation";

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    const user = db.select().from(users).where(eq(users.email, input.email.toLowerCase())).get();

    if (!user) {
      return jsonError("Credenciales invalidas", 401);
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      return jsonError("Credenciales invalidas", 401);
    }

    await createSession(user.id, request);
    return jsonOk({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: Boolean(user.isAdmin),
      },
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "No se pudo iniciar sesion", 400);
  }
}
