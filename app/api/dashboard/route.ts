import { ensureSecurityData } from "../../../db/init";
import { getDatabase } from "../../../db/runtime";

type FindingRow = {
  id: number;
  reference: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  score: number;
  status: "open" | "in_progress" | "resolved" | "accepted";
  source: string;
  assetId: number;
  assetName: string;
  assetType: string;
  environment: string;
  assignedTo: string | null;
  remediation: string;
  detectedAt: string;
  dueAt: string;
};

export async function GET() {
  try {
    await ensureSecurityData();
    const d1 = await getDatabase();
    const [assetsResult, findingsResult, auditResult] = await d1.batch([
      d1.prepare(`SELECT id, name, type, environment, owner, criticality, status,
        last_seen_at AS lastSeenAt FROM assets ORDER BY
        CASE status WHEN 'critical' THEN 1 WHEN 'attention' THEN 2 ELSE 3 END, name ASC`),
      d1.prepare(`SELECT f.id, f.reference, f.title, f.description, f.severity, f.score,
        f.status, f.source, f.asset_id AS assetId, a.name AS assetName, a.type AS assetType,
        a.environment, f.assigned_to AS assignedTo, f.remediation,
        f.detected_at AS detectedAt, f.due_at AS dueAt
        FROM findings f INNER JOIN assets a ON a.id = f.asset_id
        ORDER BY CASE f.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
        f.score DESC, f.due_at ASC`),
      d1.prepare(`SELECT id, action, entity_type AS entityType, entity_id AS entityId,
        actor, details, created_at AS createdAt
        FROM audit_events ORDER BY created_at DESC, id DESC LIMIT 20`),
    ]);
    const findings = findingsResult.results as unknown as FindingRow[];
    const openFindings = findings.filter((finding) => finding.status !== "resolved" && finding.status !== "accepted");
    const severity = {
      critical: openFindings.filter((finding) => finding.severity === "critical").length,
      high: openFindings.filter((finding) => finding.severity === "high").length,
      medium: openFindings.filter((finding) => finding.severity === "medium").length,
      low: openFindings.filter((finding) => finding.severity === "low").length,
    };
    const overdue = openFindings.filter((finding) => new Date(finding.dueAt).getTime() < Date.now()).length;
    return Response.json({
      assets: assetsResult.results,
      findings,
      auditEvents: auditResult.results,
      summary: {
        riskScore: 72,
        open: openFindings.length,
        critical: severity.critical,
        overdue,
        slaCompliance: 81,
        monitoredAssets: assetsResult.results.length,
        severity,
      },
    });
  } catch (error) {
    console.error("Dashboard API error", error);
    return Response.json({ error: "Não foi possível carregar os dados de segurança." }, { status: 500 });
  }
}
