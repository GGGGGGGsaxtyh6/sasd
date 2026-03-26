import { headers } from "next/headers";

import { env } from "@/src/lib/env";

export async function getBaseUrl() {
  return env.APP_URL;
}

export async function getRequestOrigin() {
  const headerList = await headers();
  return headerList.get("origin") ?? env.APP_URL;
}

