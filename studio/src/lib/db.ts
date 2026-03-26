import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { env } from "@/src/lib/env";
import { ensureDir } from "@/src/lib/server-utils";

ensureDir("data");
const sqlite = new Database(env.DATABASE_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const rawDb = sqlite;
export const db = drizzle(sqlite);
