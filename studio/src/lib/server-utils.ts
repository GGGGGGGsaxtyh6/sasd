import fs from "node:fs";

export function ensureDir(target: string) {
  fs.mkdirSync(target, { recursive: true });
}
