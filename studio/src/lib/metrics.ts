import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from "prom-client";

const globalMetrics = globalThis as typeof globalThis & {
  __studio_metrics_registry__?: Registry;
  __studio_metrics_initialized__?: boolean;
};

export const metricsRegistry =
  globalMetrics.__studio_metrics_registry__ ?? new Registry();

if (!globalMetrics.__studio_metrics_initialized__) {
  collectDefaultMetrics({ register: metricsRegistry, prefix: "studio_" });
  globalMetrics.__studio_metrics_initialized__ = true;
  globalMetrics.__studio_metrics_registry__ = metricsRegistry;
}

export const httpRequestDuration = new Histogram({
  name: "studio_http_request_duration_ms",
  help: "Duracion de peticiones HTTP en ms.",
  labelNames: ["route", "method", "status"] as const,
  buckets: [10, 25, 50, 100, 250, 500, 1000, 2500],
  registers: [metricsRegistry],
});

export const aiRequestCounter = new Counter({
  name: "studio_ai_requests_total",
  help: "Numero de invocaciones IA.",
  labelNames: ["status"] as const,
  registers: [metricsRegistry],
});

export const activeRealtimeConnections = new Gauge({
  name: "studio_realtime_connections",
  help: "Conexiones websocket activas de colaboración.",
  registers: [metricsRegistry],
});

