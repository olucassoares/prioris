const assetTypes = new Set(["api", "application", "database", "server", "cloud"]);
const environments = new Set(["production", "staging", "development"]);
const criticalities = new Set(["critical", "high", "medium", "low"]);
const assetStatuses = new Set(["healthy", "attention", "critical"]);
const findingStatuses = new Set(["open", "in_progress", "resolved", "accepted"]);

export type AssetInput = {
  name: string;
  owner: string;
  type: string;
  environment: string;
  criticality: string;
  status: string;
};

export type FindingInput = {
  title: string;
  description: string;
  remediation: string;
  assignedTo: string;
  source: string;
  severity: string;
  assetId: number;
  score: number;
  dueAt: Date;
};

export type FindingUpdateInput = {
  id: number;
  status: string;
  assignedTo: string;
  dueAt: Date;
};

export function parseAssetInput(body: Record<string, unknown>): AssetInput | null {
  const input = {
    name: String(body.name || "").trim(),
    owner: String(body.owner || "").trim(),
    type: String(body.type || ""),
    environment: String(body.environment || ""),
    criticality: String(body.criticality || ""),
    status: String(body.status || ""),
  };

  if (!input.name || !input.owner || !assetTypes.has(input.type) ||
      !environments.has(input.environment) || !criticalities.has(input.criticality) ||
      !assetStatuses.has(input.status)) return null;

  return input;
}

export function parseFindingInput(body: Record<string, unknown>): FindingInput | null {
  const input = {
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim(),
    remediation: String(body.remediation || "").trim(),
    assignedTo: String(body.assignedTo || "").trim(),
    source: String(body.source || "Avaliação manual").trim(),
    severity: String(body.severity || ""),
    assetId: Number(body.assetId),
    score: Number(body.score),
    dueAt: new Date(String(body.dueAt || "")),
  };

  if (!input.title || !input.description || !input.remediation || !input.assignedTo ||
      !criticalities.has(input.severity) || !Number.isInteger(input.assetId) || input.assetId < 1 ||
      !Number.isFinite(input.score) || input.score < 0 || input.score > 10 ||
      Number.isNaN(input.dueAt.getTime())) return null;

  return input;
}

export function parseFindingUpdate(rawId: string, body: Record<string, unknown>): FindingUpdateInput | null {
  const input = {
    id: Number(rawId),
    status: String(body.status || ""),
    assignedTo: String(body.assignedTo || "").trim(),
    dueAt: new Date(String(body.dueAt || "")),
  };

  if (!Number.isInteger(input.id) || input.id < 1 || !findingStatuses.has(input.status) ||
      !input.assignedTo || Number.isNaN(input.dueAt.getTime())) return null;

  return input;
}
