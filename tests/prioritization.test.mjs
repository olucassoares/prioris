import assert from "node:assert/strict";
import test from "node:test";

import { findTopPriority, priorityScore } from "../lib/prioritization.ts";

const now = new Date("2026-08-08T12:00:00Z");
const assets = [{ id: 1, criticality: "critical" }, { id: 2, criticality: "medium" }];

test("combina severidade, criticidade do ativo e prazo", () => {
  const urgent = { status: "open", severity: "high", score: 8.1, dueAt: "2026-08-07T12:00:00Z", assetId: 1 };
  const routine = { status: "open", severity: "high", score: 8.1, dueAt: "2026-09-01T12:00:00Z", assetId: 2 };
  assert.ok(priorityScore(urgent, assets[0], now) > priorityScore(routine, assets[1], now));
});

test("ignora riscos encerrados ao escolher a próxima ação", () => {
  const resolved = { id: 1, status: "resolved", severity: "critical", score: 10, dueAt: "2026-08-01T12:00:00Z", assetId: 1 };
  const active = { id: 2, status: "in_progress", severity: "high", score: 8.4, dueAt: "2026-08-08T18:00:00Z", assetId: 1 };
  assert.equal(findTopPriority([resolved, active], assets, now)?.id, 2);
});
