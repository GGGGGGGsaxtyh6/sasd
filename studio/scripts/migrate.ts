import fs from "node:fs";
import path from "node:path";
import { env } from "@/src/lib/env";
import { rawDb } from "@/src/lib/db";
import { logger } from "@/src/lib/logger";

const migrationDir = path.join(process.cwd(), "drizzle");

function ensureDir(target: string) {
  fs.mkdirSync(target, { recursive: true });
}

function readMigrationFiles() {
  ensureDir(migrationDir);

  return fs
    .readdirSync(migrationDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();
}

function main() {
  ensureDir(path.dirname(env.DATABASE_PATH));

  rawDb.exec(`
    CREATE TABLE IF NOT EXISTS __migrations (
      id TEXT PRIMARY KEY,
      applied_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);

  const files = readMigrationFiles();
  const applied = new Set<string>(
    rawDb
      .prepare("SELECT id FROM __migrations")
      .all()
      .map((row) => String((row as { id: string }).id)),
  );

  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = fs.readFileSync(path.join(migrationDir, file), "utf8");
    const tx = rawDb.transaction(() => {
      rawDb.exec(sql);
      rawDb
        .prepare("INSERT INTO __migrations (id) VALUES (?)")
        .run(file);
    });

    tx();
    logger.info({ file }, "Migracion aplicada");
  }

  logger.info(
    { databasePath: env.DATABASE_PATH, migrations: files.length },
    "Migraciones completadas",
  );
}

main();
