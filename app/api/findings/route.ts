import { ensureSecurityData } from "../../../db/init";
import { getDatabase } from "../../../db/runtime";
import { recordAudit } from "../../../lib/audit";
import { getRequestActor } from "../../../lib/security";
import { parseFindingInput } from "../../../lib/validation";

export async function POST(request: Request) {
  try {
    const actor = getRequestActor(request);
    if (!actor) return Response.json({ error: "Autenticação necessária para registrar achados." }, { status: 401 });
    const body = await request.json() as Record<string, unknown>;
    const input = parseFindingInput(body);
    if (!input) return Response.json({ error: "Os dados de risco informados são inválidos." }, { status: 400 });
    const { title, description, remediation, assignedTo, source, severity, assetId, score, dueAt } = input;

    await ensureSecurityData();
    const d1 = await getDatabase();
    const asset = await d1.prepare("SELECT id FROM assets WHERE id = ?").bind(assetId).first();
    if (!asset) return Response.json({ error: "Ativo não encontrado." }, { status: 404 });

    const reference = `SEC-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const result = await d1.prepare(`INSERT INTO findings
      (reference, title, description, severity, score, status, source, asset_id,
       assigned_to, remediation, detected_at, due_at)
      VALUES (?, ?, ?, ?, ?, 'open', ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`)
      .bind(reference, title, description, severity, score, source, assetId, assignedTo, remediation, dueAt.toISOString())
      .run();
    await recordAudit(d1, "finding_created", "finding", Number(result.meta.last_row_id), actor, `${reference} registrado com severidade ${severity}`);

    return Response.json({ id: result.meta.last_row_id, reference }, { status: 201 });
  } catch (error) {
    console.error("Create finding error", error);
    return Response.json({ error: "Não foi possível registrar o achado." }, { status: 500 });
  }
}
