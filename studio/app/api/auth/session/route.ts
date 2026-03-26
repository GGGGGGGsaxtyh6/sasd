import { getActiveSession } from "@/src/lib/auth";
import { jsonOk } from "@/src/lib/http";

export async function GET(request: Request) {
  const session = await getActiveSession(request);
  return jsonOk({ session });
}
