import { describe, expect, it } from "vitest";
import { createId, safeJsonParse, slugify } from "@/src/lib/utils";

describe("utils", () => {
  it("slugify normaliza texto a kebab-case", () => {
    expect(slugify("Workspace QA Demo")).toBe("workspace-qa-demo");
  });

  it("createId crea prefijos estables", () => {
    const value = createId("ws");
    expect(value.startsWith("ws_")).toBe(true);
    expect(value.length).toBeGreaterThan(10);
  });

  it("safeJsonParse devuelve fallback si el JSON es inválido", () => {
    expect(safeJsonParse("no-json", { ok: false })).toEqual({ ok: false });
  });
});
