import { getDatabase } from "./runtime";

let initialization: Promise<void> | null = null;

export function ensureSecurityData() {
  initialization ??= initializeSecurityData();
  return initialization;
}

async function initializeSecurityData() {
  const d1 = await getDatabase();
  await d1.batch([
    d1.prepare(`CREATE TABLE IF NOT EXISTS assets (
      id SERIAL PRIMARY KEY,
      name text NOT NULL,
      type text NOT NULL,
      environment text NOT NULL,
      owner text NOT NULL,
      criticality text NOT NULL,
      status text NOT NULL,
      last_seen_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`),
    d1.prepare("CREATE INDEX IF NOT EXISTS assets_status_idx ON assets (status)"),
    d1.prepare(`CREATE TABLE IF NOT EXISTS findings (
      id SERIAL PRIMARY KEY,
      reference text NOT NULL UNIQUE,
      title text NOT NULL,
      description text NOT NULL,
      severity text NOT NULL,
      score real NOT NULL,
      status text DEFAULT 'open' NOT NULL,
      source text NOT NULL,
      asset_id integer NOT NULL,
      assigned_to text,
      remediation text NOT NULL,
      detected_at TIMESTAMPTZ NOT NULL,
      due_at TIMESTAMPTZ NOT NULL,
      resolved_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (asset_id) REFERENCES assets(id)
    )`),
    d1.prepare("CREATE INDEX IF NOT EXISTS findings_severity_idx ON findings (severity)"),
    d1.prepare("CREATE INDEX IF NOT EXISTS findings_status_idx ON findings (status)"),
    d1.prepare("CREATE INDEX IF NOT EXISTS findings_asset_idx ON findings (asset_id)"),
    d1.prepare(`CREATE TABLE IF NOT EXISTS audit_events (
      id SERIAL PRIMARY KEY,
      action text NOT NULL,
      entity_type text NOT NULL,
      entity_id integer,
      actor text NOT NULL,
      details text NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`),
    d1.prepare("CREATE INDEX IF NOT EXISTS audit_events_created_idx ON audit_events (created_at)"),
  ]);

  const assetCount = await d1.prepare("SELECT COUNT(*) AS total FROM assets").first<{ total: number }>();
  if ((assetCount?.total ?? 0) === 0) {
    const assets = [
      ["API Gateway", "api", "production", "Platform Team", "critical", "critical", "-4 minutes"],
      ["Checkout API", "api", "production", "Commerce Team", "critical", "attention", "-7 minutes"],
      ["Identity Worker", "application", "production", "Security Team", "critical", "healthy", "-2 minutes"],
      ["Primary Database", "database", "production", "Data Platform", "critical", "attention", "-5 minutes"],
      ["Corporate Portal", "application", "production", "Web Team", "high", "attention", "-11 minutes"],
      ["Bastion Host", "server", "production", "Infrastructure", "critical", "healthy", "-3 minutes"],
      ["Analytics Worker", "cloud", "staging", "Data Platform", "medium", "healthy", "-18 minutes"],
      ["DNS Edge", "cloud", "production", "Infrastructure", "high", "healthy", "-1 minute"],
    ] as const;
    await d1.batch(assets.map((asset) => d1.prepare(`INSERT INTO assets
      (name, type, environment, owner, criticality, status, last_seen_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP + (?::interval))`).bind(...asset)));
  }

  const findingCount = await d1.prepare("SELECT COUNT(*) AS total FROM findings").first<{ total: number }>();
  if ((findingCount?.total ?? 0) === 0) {
    const rows = [
      ["CVE-2024-3094", "Dependência XZ comprometida", "Versão de dependência associada a risco de cadeia de suprimentos.", "critical", 10, "open", "SCA", "API Gateway", "Marina Alves", "Atualizar a imagem base para uma versão validada e recriar o serviço.", "-2 days", "-1 day"],
      ["CVE-2023-44487", "Proteção HTTP/2 desatualizada", "O componente de borda precisa receber a atualização de proteção recomendada.", "critical", 9.8, "in_progress", "Infrastructure scan", "API Gateway", "Diego Ramos", "Aplicar a atualização do fornecedor e validar limites de conexão.", "-5 days", "+2 days"],
      ["SEC-2026-014", "Configuração TLS legada", "O serviço ainda aceita uma configuração criptográfica fora do padrão atual.", "critical", 9.1, "open", "Cloud posture", "Corporate Portal", "Ana Lima", "Aplicar a política TLS moderna e validar clientes compatíveis.", "-1 day", "+3 days"],
      ["SEC-2026-019", "Credencial de serviço sem rotação", "Uma credencial técnica ultrapassou o prazo interno de rotação.", "critical", 9, "open", "Identity audit", "Primary Database", "Lucas Soares", "Rotacionar a credencial e revisar o ciclo automático de expiração.", "-3 days", "-2 hours"],
      ["CVE-2023-38545", "Biblioteca de rede desatualizada", "Biblioteca presente na imagem do serviço possui correção de segurança disponível.", "high", 8.1, "in_progress", "SCA", "Checkout API", "Marina Alves", "Atualizar a biblioteca e executar os testes de regressão.", "-6 days", "+4 days"],
      ["SEC-2026-023", "Política de acesso excessiva", "Um papel técnico possui permissões acima das necessárias para a função.", "high", 7.8, "open", "IAM review", "Analytics Worker", "Diego Ramos", "Reduzir o papel ao conjunto mínimo de permissões e revisar dependências.", "-4 days", "+5 days"],
      ["SEC-2026-027", "Cabeçalhos de segurança incompletos", "A aplicação não envia todos os cabeçalhos definidos no baseline web.", "medium", 5.6, "open", "DAST", "Corporate Portal", "Ana Lima", "Aplicar o baseline de cabeçalhos na camada de borda.", "-2 days", "+9 days"],
      ["SEC-2026-031", "Log de auditoria com retenção curta", "A retenção atual não atende à política interna de investigação.", "medium", 4.9, "resolved", "Control review", "Identity Worker", "Lucas Soares", "Estender a retenção e confirmar a política de armazenamento.", "-12 days", "-2 days"],
      ["SEC-2026-034", "Backup sem teste recente", "O backup está ativo, mas o teste de restauração está fora da janela definida.", "medium", 4.7, "open", "Resilience review", "Primary Database", "Marina Alves", "Executar restauração controlada e registrar evidências.", "-8 days", "+6 days"],
      ["SEC-2026-039", "Tag de proprietário ausente", "Um recurso de nuvem não possui responsável técnico identificado.", "low", 2.4, "resolved", "Cloud posture", "Analytics Worker", "Diego Ramos", "Adicionar metadados obrigatórios e atualizar a política de provisionamento.", "-15 days", "-4 days"],
    ] as const;
    for (const row of rows) {
      await d1.prepare(`INSERT INTO findings
        (reference, title, description, severity, score, status, source, asset_id, assigned_to, remediation, detected_at, due_at, resolved_at)
        SELECT ?, ?, ?, ?, ?, ?, ?, id, ?, ?, CURRENT_TIMESTAMP + (?::interval), CURRENT_TIMESTAMP + (?::interval),
        CASE WHEN ? = 'resolved' THEN CURRENT_TIMESTAMP - INTERVAL '1 day' ELSE NULL END FROM assets WHERE name = ?`)
        .bind(row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[8], row[9], row[10], row[11], row[5], row[7]).run();
    }
  }

  const auditCount = await d1.prepare("SELECT COUNT(*) AS total FROM audit_events").first<{ total: number }>();
  if ((auditCount?.total ?? 0) === 0) {
    await d1.batch([
      d1.prepare("INSERT INTO audit_events (action, entity_type, entity_id, actor, details, created_at) VALUES (?, 'finding', 2, ?, ?, CURRENT_TIMESTAMP - INTERVAL '2 hours')").bind("status_changed", "Marina Alves", "Proteção HTTP/2 movida para Em correção"),
      d1.prepare("INSERT INTO audit_events (action, entity_type, entity_id, actor, details, created_at) VALUES (?, 'finding', 8, ?, ?, CURRENT_TIMESTAMP - INTERVAL '1 day')").bind("finding_resolved", "Lucas Soares", "Retenção do log de auditoria validada"),
      d1.prepare("INSERT INTO audit_events (action, entity_type, entity_id, actor, details, created_at) VALUES (?, 'asset', 4, ?, ?, CURRENT_TIMESTAMP - INTERVAL '2 days')").bind("asset_reviewed", "Data Platform", "Postura do Primary Database revisada"),
    ]);
  }
}
