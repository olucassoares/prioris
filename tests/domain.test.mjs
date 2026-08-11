import assert from "node:assert/strict";
import test from "node:test";

import { createCsv, csvCell } from "../lib/csv.ts";
import { getRequestActor } from "../lib/security.ts";
import { parseAssetInput, parseFindingInput, parseFindingUpdate } from "../lib/validation.ts";

test("identifica o usuário encaminhado pelo proxy confiável", () => {
  const request = new Request("https://prioris.example/", {
    headers: {
      "x-user-name": "Lucas Soares",
      "x-user-email": "lucas@example.com",
    },
  });
  assert.equal(getRequestActor(request), "Lucas Soares");
});

test("recusa operação remota sem identidade", () => {
  assert.equal(getRequestActor(new Request("https://prioris.example/")), null);
});

test("permite a identidade de demonstração somente no ambiente local", () => {
  assert.equal(getRequestActor(new Request("http://localhost/")), "Usuário de demonstração");
});

test("valida e normaliza um ativo", () => {
  assert.deepEqual(parseAssetInput({
    name: "  API de Pagamentos ", owner: " Plataforma ", type: "api",
    environment: "production", criticality: "critical", status: "attention",
  }), {
    name: "API de Pagamentos", owner: "Plataforma", type: "api",
    environment: "production", criticality: "critical", status: "attention",
  });
  assert.equal(parseAssetInput({ name: "API", owner: "Time", type: "desconhecido" }), null);
});

test("valida limites do score e vínculo do achado", () => {
  const valid = parseFindingInput({
    title: "Configuração insegura", description: "Descrição", remediation: "Corrigir política",
    assignedTo: "Marina", severity: "high", assetId: 2, score: 8.4, dueAt: "2026-09-01",
  });
  assert.equal(valid?.source, "Avaliação manual");
  assert.equal(valid?.assetId, 2);
  assert.equal(parseFindingInput({
    title: "Inválido", description: "Descrição", remediation: "Correção", assignedTo: "Marina",
    severity: "high", assetId: 0, score: 11, dueAt: "sem-data",
  }), null);
});

test("valida a transição informada para o workflow", () => {
  assert.equal(parseFindingUpdate("3", { status: "resolved", assignedTo: "Lucas", dueAt: "2026-09-10" })?.id, 3);
  assert.equal(parseFindingUpdate("0", { status: "removed", assignedTo: "", dueAt: "x" }), null);
});

test("escapa células e gera CSV válido", () => {
  assert.equal(csvCell('Achado "crítico", revisar'), '"Achado ""crítico"", revisar"');
  assert.equal(createCsv(["Nome", "Score"], [["API, Core", 9.8]]), '"Nome","Score"\n"API, Core","9.8"');
});
