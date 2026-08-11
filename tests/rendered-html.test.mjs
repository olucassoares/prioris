import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("declares the Prioris document metadata in the App Router", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

  assert.match(layout, /<html\s+lang="pt-BR">/);
  assert.match(layout, /title:\s*"Prioris \| Gestão de riscos digitais"/);
  assert.match(layout, /description:\s*"Visibilidade e priorização para a gestão de riscos digitais\."/);
  assert.match(layout, /icon:\s*"\/favicon\.svg"/);
});
