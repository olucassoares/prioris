type Severity = "critical" | "high" | "medium" | "low";
type FindingLike = { status: string; severity: Severity; score: number; dueAt: string; assetId: number };
type AssetLike = { id: number; criticality: Severity };

const weight: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };

export function priorityScore(finding: FindingLike, asset: AssetLike | undefined, now = new Date()) {
  const dueAt = new Date(finding.dueAt).getTime();
  const overdueBoost = Number.isFinite(dueAt) && dueAt < now.getTime() ? 160 : 0;
  const dueSoonBoost = Number.isFinite(dueAt) && dueAt >= now.getTime() && dueAt - now.getTime() <= 86_400_000 ? 80 : 0;
  return weight[finding.severity] * 100 + (asset ? weight[asset.criticality] * 35 : 0) + finding.score * 10 + overdueBoost + dueSoonBoost;
}

export function findTopPriority<TFinding extends FindingLike>(findings: TFinding[], assets: AssetLike[], now = new Date()) {
  const assetById = new Map(assets.map((asset) => [asset.id, asset]));
  return findings
    .filter((finding) => finding.status !== "resolved" && finding.status !== "accepted")
    .map((finding) => ({ finding, score: priorityScore(finding, assetById.get(finding.assetId), now) }))
    .sort((a, b) => b.score - a.score)[0]?.finding ?? null;
}
