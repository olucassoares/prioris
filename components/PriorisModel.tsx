import { Boxes, Cloud, Database, Hexagon, Server } from "lucide-react";

export type Severity = "critical" | "high" | "medium" | "low";
export type FindingStatus = "open" | "in_progress" | "resolved" | "accepted";
export type View = "overview" | "findings" | "assets" | "remediation" | "governance" | "reports";

export type Finding = {
  id: number;
  reference: string;
  title: string;
  description: string;
  severity: Severity;
  score: number;
  status: FindingStatus;
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

export type Asset = {
  id: number;
  name: string;
  type: "api" | "application" | "database" | "server" | "cloud";
  environment: string;
  owner: string;
  criticality: Severity;
  status: "healthy" | "attention" | "critical";
  lastSeenAt: string;
};

export type AuditEvent = {
  id: number;
  action: string;
  entityType: "finding" | "asset" | "report";
  entityId: number | null;
  actor: string;
  details: string;
  createdAt: string;
};

export type DashboardData = {
  findings: Finding[];
  assets: Asset[];
  auditEvents: AuditEvent[];
  summary: {
    riskScore: number;
    open: number;
    critical: number;
    overdue: number;
    slaCompliance: number;
    monitoredAssets: number;
    severity: Record<Severity, number>;
  };
};

export const severityLabel: Record<Severity, string> = { critical: "Crítica", high: "Alta", medium: "Média", low: "Baixa" };
export const statusLabel: Record<FindingStatus, string> = { open: "Aberta", in_progress: "Em correção", resolved: "Resolvida", accepted: "Risco aceito" };
export const viewCopy: Record<View, { eyebrow: string; title: string; description: string }> = {
  overview: { eyebrow: "NUVORA / POSTURA ATUAL", title: "Risco sob controle", description: "4 achados críticos exigem resposta · cobertura ativa em 8 serviços." },
  findings: { eyebrow: "GESTÃO DE EXPOSIÇÃO", title: "Vulnerabilidades", description: "Investigue, priorize e acompanhe todos os achados em um único fluxo." },
  assets: { eyebrow: "SUPERFÍCIE MONITORADA", title: "Inventário de ativos", description: "Conheça os serviços, responsáveis e níveis de criticidade da organização." },
  remediation: { eyebrow: "EXECUÇÃO E CONTROLE", title: "Central de remediação", description: "Acompanhe responsabilidades, prazos e evolução das correções defensivas." },
  governance: { eyebrow: "GOVERNANÇA E CONFORMIDADE", title: "Controles de segurança", description: "Meça a cobertura dos controles e acompanhe as evidências de auditoria." },
  reports: { eyebrow: "PRESTAÇÃO DE CONTAS", title: "Relatórios", description: "Consolide riscos, prazos e responsáveis em uma leitura auditável." },
};
export const trends = {
  "7 dias": [88, 86, 83, 81, 77, 75, 72],
  "30 dias": [91, 90, 87, 88, 84, 82, 81, 78, 79, 76, 74, 72],
  "90 dias": [96, 94, 91, 93, 89, 87, 85, 86, 81, 80, 77, 78, 75, 72],
};

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(value));
}
export function relativeDue(value: string) {
  const days = Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);
  if (days < 0) return `${Math.abs(days)}d atrasada`;
  if (days === 0) return "vence hoje";
  return `${days}d restantes`;
}

export function assetIcon(type: Asset["type"], size = 17) {
  if (type === "database") return <Database size={size} />;
  if (type === "cloud") return <Cloud size={size} />;
  if (type === "server") return <Server size={size} />;
  return type === "api" ? <Hexagon size={size} /> : <Boxes size={size} />;
}
