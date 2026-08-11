import { getDatabase } from "../db/runtime";

type Database = Awaited<ReturnType<typeof getDatabase>>;

export function recordAudit(
  d1: Database,
  action: string,
  entityType: "finding" | "asset" | "report",
  entityId: number | null,
  actor: string,
  details: string,
) {
  return d1.prepare(`INSERT INTO audit_events
    (action, entity_type, entity_id, actor, details)
    VALUES (?, ?, ?, ?, ?)`)
    .bind(action, entityType, entityId, actor, details)
    .run();
}
