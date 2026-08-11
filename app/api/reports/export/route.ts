import { ensureSecurityData } from "../../../../db/init";
import { getDatabase } from "../../../../db/runtime";
import { recordAudit } from "../../../../lib/audit";
import { createCsv } from "../../../../lib/csv";
import { getRequestActor } from "../../../../lib/security";

export async function GET(request: Request) {
  try {
    const actor = getRequestActor(request);
    if (!actor) return Response.json({ error: "Autenticação necessária para exportar relatórios." }, { status: 401 });

    await ensureSecurityData();
    const d1 = await getDatabase();
    const result = await d1.prepare(`SELECT f.reference, f.title, f.severity, f.score,
      f.status, a.name AS asset, a.owner, f.assigned_to AS assignedTo,
      f.detected_at AS detectedAt, f.due_at AS dueAt
      FROM findings f INNER JOIN assets a ON a.id = f.asset_id
      ORDER BY f.score DESC`).all();
    const header = ["Referência", "Achado", "Severidade", "Score", "Status", "Ativo", "Time", "Responsável", "Detectado em", "Prazo"];
    const rows = result.results.map((row) => [row.reference, row.title, row.severity, row.score, row.status, row.asset, row.owner, row.assignedTo, row.detectedAt, row.dueAt]);
    const csv = createCsv(header, rows);
    await recordAudit(d1, "report_exported", "report", null, actor, `Relatório CSV exportado com ${rows.length} achados`);

    return new Response(`\uFEFF${csv}`, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": "attachment; filename=prioris-riscos.csv",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    console.error("Export report error", error);
    return Response.json({ error: "Não foi possível gerar o relatório." }, { status: 500 });
  }
}
