import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import fs from "fs";

const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const sqlite = new Database(path.join(dbDir, "collabrix.db"));
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite);

console.log("Running migrations...");
migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
console.log("Migrations complete!");

sqlite.close();
