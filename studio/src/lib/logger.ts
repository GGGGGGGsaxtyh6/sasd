import pino from "pino";

const level = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "development" ? "debug" : "info");

export const logger = pino({
  level,
  base: {
    service: "studio-ai-native",
    env: process.env.NODE_ENV ?? "development",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
