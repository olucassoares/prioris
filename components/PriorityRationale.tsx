type PriorityRationaleProps = {
  reference?: string;
  title?: string;
  asset?: string;
  due?: string;
  onOpen?: () => void;
};

export function PriorityRationale({ reference, title, asset, due, onOpen }: PriorityRationaleProps) {
  const hasPriority = Boolean(reference && title);
  return (
    <section className="priority-rationale" aria-label="Critério e próxima ação">
      <div><span>REGRA DE PRIORIDADE</span><strong>CVSS × criticidade do ativo × prazo do SLA</strong><small>A fila não depende apenas da severidade técnica.</small></div>
      <div className="priority-next"><span>PRÓXIMA AÇÃO</span><strong>{hasPriority ? `${reference} · ${title}` : "Nenhum risco ativo"}</strong><small>{hasPriority ? `${asset} · ${due}` : "A fila está concluída."}</small></div>
      {hasPriority && <button onClick={onOpen}>Abrir achado →</button>}
    </section>
  );
}
