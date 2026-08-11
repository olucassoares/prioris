import { ensureSecurityData } from "../../../../db/init";
import { getDatabase } from "../../../../db/runtime";
import { recordAudit } from "../../../../lib/audit";
import { getRequestActor } from "../../../../lib/security";
import { parseFindingUpdate } from "../../../../lib/validation";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = getRequestActor(request);
    if (!actor) return Response.json({ error: "Autenticação necessária para atualizar o plano." }, { status: 401 });
    const { id: rawId } = await context.params;
    const body = await request.json() as Record<string, unknown>;
    const input = parseFindingUpdate(rawId, body);
    if (!input) return Response.json({ error: "Dados de atualização inválidos." }, { status: 400 });
    const { id, status, assignedTo, dueAt } = input;

    await ensureSecurityData();
    const d1 = await getDatabase();
    const result = await d1.prepare(`UPDATE findings
      SET status = ?, assigned_to = ?, due_at = ?,
          resolved_at = CASE WHEN ? = 'resolved' THEN CURRENT_TIMESTAMP ELSE NULL END
      WHERE id = ?`)
      .bind(status, assignedTo, dueAt.toISOString(), status, id)
      .run();

    if (!result.meta.changes) return Response.json({ error: "Achado não encontrado." }, { status: 404 });
    await recordAudit(d1, status === "resolved" ? "finding_resolved" : "status_changed", "finding", id, actor, `Status atualizado para ${status}; responsável: ${assignedTo}`);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Update finding error", error);
    return Response.json({ error: "Não foi possível atualizar o plano." }, { status: 500 });
  }
}
