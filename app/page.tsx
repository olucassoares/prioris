"use client";

import {
  Activity,
  AlertTriangle,
  Bell,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock3,
  Download,
  FileBarChart,
  Filter,
  Gauge,
  History,
  LayoutDashboard,
  ListChecks,
  LoaderCircle,
  Menu,
  Plus,
  Radar,
  Save,
  Search,
  Server,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Target,
  X,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { PriorisMark } from "../components/PriorisMark";
import { PriorityRationale } from "../components/PriorityRationale";
import {
  assetIcon,
  formatDate,
  relativeDue,
  severityLabel,
  statusLabel,
  trends,
  viewCopy,
  type Asset,
  type DashboardData,
  type Finding,
  type FindingStatus,
  type Severity,
  type View,
} from "../components/PriorisModel";
import { findTopPriority } from "../lib/prioritization";

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState<keyof typeof trends>("30 dias");
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<"all" | Severity>("all");
  const [selected, setSelected] = useState<Finding | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeView, setActiveView] = useState<View>("overview");
  const [assetCreateOpen, setAssetCreateOpen] = useState(false);
  const [defaultDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().slice(0, 10);
  });

  async function loadDashboard(selectedId?: number) {
    const response = await fetch("/api/dashboard", { cache: "no-store" });
    const payload = await response.json() as DashboardData & { error?: string };
    if (!response.ok) throw new Error(payload.error || "Não foi possível carregar os dados.");
    setData(payload);
    setError("");
    if (selectedId) setSelected(payload.findings.find((finding) => finding.id === selectedId) || null);
  }

  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as DashboardData & { error?: string };
        if (!response.ok) throw new Error(payload.error || "Não foi possível carregar os dados.");
        setData(payload);
      })
      .catch((caught: Error) => setError(caught.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredFindings = useMemo(() => (data?.findings || []).filter((finding) => {
    const term = query.trim().toLowerCase();
    const matchesSearch = !term || `${finding.reference} ${finding.title} ${finding.assetName}`.toLowerCase().includes(term);
    return matchesSearch && (severity === "all" || finding.severity === severity);
  }), [data, query, severity]);
  const topPriority = data ? findTopPriority(data.findings, data.assets) : null;
  const activeDescription = activeView === "overview" && data
    ? `${data.summary.critical} ${data.summary.critical === 1 ? "risco crítico exige" : "riscos críticos exigem"} resposta · cobertura ativa em ${data.summary.monitoredAssets} ativos.`
    : viewCopy[activeView].description;

  const filteredAssets = useMemo(() => (data?.assets || []).filter((asset) => {
    const term = query.trim().toLowerCase();
    return !term || `${asset.name} ${asset.owner} ${asset.environment} ${asset.type}`.toLowerCase().includes(term);
  }), [data, query]);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2400);
  }

  async function createFinding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const response = await fetch("/api/findings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const payload = await response.json() as { id?: number; error?: string };
      if (!response.ok || !payload.id) throw new Error(payload.error || "Não foi possível registrar o achado.");
      setCreateOpen(false);
      await loadDashboard(payload.id);
      showNotice("Achado registrado e adicionado à fila.");
    } catch (caught) {
      showNotice(caught instanceof Error ? caught.message : "Falha ao registrar o achado.");
    } finally {
      setSaving(false);
    }
  }

  async function updateFinding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const response = await fetch(`/api/findings/${selected.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Não foi possível atualizar o plano.");
      await loadDashboard(selected.id);
      showNotice("Plano de correção atualizado com sucesso.");
    } catch (caught) {
      showNotice(caught instanceof Error ? caught.message : "Falha ao atualizar o plano.");
    } finally {
      setSaving(false);
    }
  }

  async function createAsset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Não foi possível cadastrar o ativo.");
      setAssetCreateOpen(false);
      await loadDashboard();
      showNotice("Ativo cadastrado e incluído no monitoramento.");
    } catch (caught) {
      showNotice(caught instanceof Error ? caught.message : "Falha ao cadastrar o ativo.");
    } finally {
      setSaving(false);
    }
  }

  function openView(view: View) {
    setActiveView(view);
    setSeverity("all");
    setQuery("");
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const points = trends[period].map((value, index, values) => `${(index / (values.length - 1)) * 100},${95 - value}`).join(" ");

  return (
    <main className="security-shell">
      <aside className={`security-sidebar ${mobileNav ? "nav-open" : ""}`}>
        <div className="security-brand"><span><PriorisMark /></span><div><strong>Prioris</strong><small>Gestão de riscos digitais</small></div><button onClick={() => setMobileNav(false)} aria-label="Fechar menu"><X size={19} /></button></div>
        <nav aria-label="Navegação principal">
          <p>OPERAÇÕES</p>
          <button className={activeView === "overview" ? "active" : ""} onClick={() => openView("overview")}><LayoutDashboard size={18} /> Visão geral</button>
          <button className={activeView === "findings" ? "active" : ""} onClick={() => openView("findings")}><ShieldAlert size={18} /> Vulnerabilidades <span>{data?.summary.open ?? 0}</span></button>
          <button className={activeView === "assets" ? "active" : ""} onClick={() => openView("assets")}><Server size={18} /> Ativos</button>
          <button className={activeView === "remediation" ? "active" : ""} onClick={() => openView("remediation")}><ListChecks size={18} /> Remediação</button>
          <p>GOVERNANÇA</p>
          <button className={activeView === "governance" ? "active" : ""} onClick={() => openView("governance")}><Target size={18} /> Controles</button>
          <button className={activeView === "reports" ? "active" : ""} onClick={() => openView("reports")}><FileBarChart size={18} /> Relatórios</button>
        </nav>
        <div className="sidebar-security-status"><div><Radar size={18} /><span><strong>Nuvora Sistemas</strong><small>{data?.summary.monitoredAssets ?? "—"} ativos na base</small></span></div><i><span style={{width:data ? "100%" : "18%"}} /></i><small>Base demonstrativa · coleta manual</small></div>
        <div className="security-user"><div>LS</div><span><strong>Lucas Soares</strong><small>Analista · Nuvora</small></span><ChevronDown size={15} /></div>
      </aside>

      {mobileNav && <button className="security-backdrop" onClick={() => setMobileNav(false)} aria-label="Fechar navegação" />}

      <section className="security-workspace" id="overview">
        <header className="security-topbar">
          <button className="mobile-menu" onClick={() => setMobileNav(true)} aria-label="Abrir menu"><Menu size={20} /></button>
          <label className="global-security-search"><Search size={17} /><input aria-label="Pesquisar" placeholder={activeView === "assets" ? "Pesquisar ativos e responsáveis..." : "Pesquisar ativos, CVEs e responsáveis..."} value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <div className="topbar-security-actions"><span className="system-live"><i /> Base carregada</span><button aria-label="Notificações" onClick={() => showNotice(`${data?.summary.critical ?? 0} riscos críticos pendentes.`)}><Bell size={19} /><span /></button><button aria-label="Configurações" onClick={() => showNotice("As regras de prioridade usam CVSS, criticidade do ativo e prazo.")}><Settings size={19} /></button></div>
        </header>

        <div className="security-content">
          <div className="security-heading"><div><p><Target size={13} /> {viewCopy[activeView].eyebrow}</p><h1>{viewCopy[activeView].title}</h1><span>{activeDescription}</span></div><div className="heading-actions"><button onClick={() => loadDashboard().then(() => showNotice("Base atualizada com sucesso.")).catch((caught: Error) => showNotice(caught.message))}><Activity size={16} /> Atualizar base</button>{activeView === "assets" ? <button className="primary-security-action" onClick={() => setAssetCreateOpen(true)}><Plus size={16} /> Novo ativo</button> : activeView === "reports" ? <a className="primary-security-action" href="/api/reports/export"><Download size={16} /> Exportar CSV</a> : activeView !== "governance" ? <button className="primary-security-action" onClick={() => setCreateOpen(true)}><Plus size={16} /> Novo achado</button> : null}</div></div>

          {loading ? <section className="security-loading"><LoaderCircle className="spin" size={28} /><strong>Calculando a postura de segurança...</strong></section> : error || !data ? <section className="security-loading error"><AlertTriangle size={28} /><strong>{error}</strong></section> : <>
            {activeView === "overview" && <>
            <section className="security-metrics" aria-label="Indicadores de segurança">
              <article className="risk-score-card"><div className="metric-label"><Gauge size={17} /> Score de risco <span>Alto</span></div><div className="score-content"><div className="score-ring" style={{ "--score": `${data.summary.riskScore * 3.6}deg` } as React.CSSProperties}><div><strong>{data.summary.riskScore}</strong><small>/100</small></div></div><div><span>Escala consolidada</span><small>CVSS, ativo e prazo</small><p>Quanto menor, melhor</p></div></div></article>
              <article><div className="metric-label"><ShieldAlert size={17} /> Riscos críticos</div><strong className="metric-number critical-number">{data.summary.critical}</strong><div className="metric-foot"><span>{data.summary.overdue} fora do SLA</span><small>exigem ação imediata</small></div></article>
              <article><div className="metric-label"><CircleDot size={17} /> Achados abertos</div><strong className="metric-number">{data.summary.open}</strong><div className="metric-foot positive"><span>{data.summary.open - data.summary.overdue} dentro do prazo</span><small>em {data.summary.monitoredAssets} ativos</small></div></article>
              <article><div className="metric-label"><Clock3 size={17} /> Conformidade SLA</div><strong className="metric-number">{data.summary.slaCompliance}<small>%</small></strong><div className="metric-progress"><i><span style={{ width: `${data.summary.slaCompliance}%` }} /></i><small>meta: 90%</small></div></article>
            </section>

            <PriorityRationale reference={topPriority?.reference} title={topPriority?.title} asset={topPriority?.assetName} due={topPriority ? relativeDue(topPriority.dueAt) : undefined} onOpen={topPriority ? () => setSelected(topPriority) : undefined} />

            <section className="security-main-grid">
              <article className="security-panel trend-panel">
                <div className="security-panel-heading"><div><h2>Evolução do risco</h2><p>Score consolidado da organização</p></div><div className="period-switch">{Object.keys(trends).map((item) => <button key={item} onClick={() => setPeriod(item as keyof typeof trends)} className={period === item ? "active" : ""}>{item}</button>)}</div></div>
                <div className="risk-chart"><div className="chart-labels"><span>100</span><span>80</span><span>60</span><span>40</span></div><div className="chart-plot"><div className="target-line"><span>Meta 55</span></div><svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-label={`Score atual ${data.summary.riskScore}`}><defs><linearGradient id="riskArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6b7cff" stopOpacity=".28"/><stop offset="100%" stopColor="#6b7cff" stopOpacity="0"/></linearGradient></defs><polygon points={`0,40 ${points} 100,40`} fill="url(#riskArea)"/><polyline points={points} fill="none" stroke="#6b7cff" strokeWidth="1.3" vectorEffect="non-scaling-stroke"/><circle cx="100" cy={95 - trends[period][trends[period].length - 1]} r="1.8" fill="#8792ff" stroke="white" strokeWidth=".8"/></svg><div className="chart-days"><span>Início</span><span>Hoje</span></div></div></div>
              </article>

              <article className="security-panel severity-panel">
                <div className="security-panel-heading"><div><h2>Por gravidade</h2><p>Achados ativos</p></div><button onClick={() => setSeverity("all")}>Ver todos</button></div>
                <div className="severity-content"><div className="severity-donut" style={{ "--critical": `${(data.summary.severity.critical / Math.max(data.summary.open, 1)) * 100}%`, "--high": `${((data.summary.severity.critical + data.summary.severity.high) / Math.max(data.summary.open, 1)) * 100}%`, "--medium": `${((data.summary.severity.critical + data.summary.severity.high + data.summary.severity.medium) / Math.max(data.summary.open, 1)) * 100}%` } as React.CSSProperties}><div><strong>{data.summary.open}</strong><span>abertos</span></div></div><div className="severity-legend">{(["critical", "high", "medium", "low"] as Severity[]).map((item) => <button key={item} onClick={() => setSeverity(item)}><i className={`severity-${item}`} /><span>{severityLabel[item]}</span><strong>{data.summary.severity[item]}</strong></button>)}</div></div>
              </article>
            </section>

            <section className="security-lower-grid">
              <article className="security-panel findings-panel" id="findings">
                <div className="security-panel-heading"><div><h2>Fila de prioridades</h2><p>Achados ordenados por risco e prazo</p></div><div className="panel-actions"><button className="filter-trigger" onClick={() => setSeverity(severity === "all" ? "critical" : "all")}><Filter size={14} /> {severity === "all" ? "Filtrar" : severityLabel[severity]}</button><button className="add-finding" onClick={() => setCreateOpen(true)}><Plus size={14} /> Registrar</button></div></div>
                <div className="findings-toolbar"><label><Search size={15} /><input aria-label="Buscar vulnerabilidades" placeholder="Buscar por referência, risco ou ativo" value={query} onChange={(event) => setQuery(event.target.value)} /></label><span>{filteredFindings.length} achados</span></div>
                <div className="security-table-wrap"><table