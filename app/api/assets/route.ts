import { ensureSecurityData } from "../../../db/init";
import { getDatabase } from "../../../db/runtime";
import { recordAudit } from "../../../lib/audit";
import { getRequestActor } from "../../../lib/security";
import { parseAssetInput } from "../../../lib/validation";

export async function POST(request: Request) {
  try {
    const actor = getRequestActor(request);
    if (!actor) return Response.json({ error: "Autenticação necessária para cadastrar ativos." }, { status: 401 });
    const body = await request.json() as Record<string, unknown>;
    const input = parseAssetInput(body);
    if (!input) return Response.json({ error: "Os dados do ativo são inválidos." }, { status: 400 });
    const { name, owner, type, environment, criticality, status } = input;

    await ensureSecurityData();
    const d1 = await getDatabase();
    const existing = await d1.prepare("SELECT id FROM assets WHERE lower(name) = lower(?)").bind(name).first();
    if (existing) return Response.json({ error: "Já existe um ativo com esse nome." }, { status: 409 });

    const result = await d1.prepare(`INSERT INTO assets
      (name, type, environment, owner, criticality, status, last_seen_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`)
      .bind(name, type, environment, owner, criticality, status)
      .run();
    await recordAudit(d1, "asset_created", "asset", Number(result.meta.last_row_id), actor, `${name} adicionado ao ambiente ${environment}`);
    return Response.json({ id: result.meta.last_row_id }, { status: 201 });
  } catch (error) {
    console.error("Create asset error", error);
    return Response.json({ error: "Não foi possível cadastrar o ativo." }, { status: 500 });
  }
}
