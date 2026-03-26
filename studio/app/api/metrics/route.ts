import { metricsRegistry } from "@/src/lib/metrics";

export async function GET() {
  return new Response(await metricsRegistry.metrics(), {
    headers: {
      "Content-Type": metricsRegistry.contentType,
      "Cache-Control": "no-store",
    },
  });
}
