# Prioris

Plataforma defensiva de gestão de riscos de segurança. O produto centraliza ativos, achados, prioridades de correção e indicadores executivos em um painel operacional.

![Painel de riscos do Prioris](public/screenshots/dashboard.jpg)

## Contexto do produto

A **Nuvora Sistemas** é a empresa fictícia usada nos dados de exemplo. Seus oito serviços monitorados acumulam achados com severidade, score, criticidade, prazo e responsável diferentes. O painel usa esses fatores para ordenar o trabalho de correção; ele não faz varreduras nem executa ataques.

## Problema resolvido

Informações de segurança espalhadas em planilhas e mensagens dificultam a priorização e a responsabilização. O Prioris reúne inventário, riscos, prazos, responsáveis, histórico e relatórios em um fluxo único.

## Visão operacional

- score consolidado de risco e acompanhamento de SLA;
- distribuição de achados por severidade;
- visão de ativos monitorados e sua postura de segurança;
- tabela pesquisável e filtrável de prioridades;
- painel lateral com contexto e recomendação de correção;
- gráficos interativos para períodos de 7, 30 e 90 dias;
- dados persistidos em PostgreSQL;
- interface responsiva em português.

## Workflow de vulnerabilidades

- cadastro de novos achados com validação;
- vínculo entre achado e ativo monitorado;
- atribuição de responsável e prazo;
- transições entre aberta, em correção, resolvida e risco aceito;
- registro automático da data de resolução;
- atualização dos indicadores após cada mudança;
- persistência confirmada após recarregar a aplicação.

## Inventário e remediação

- navegação real entre visão geral, vulnerabilidades, ativos e remediação;
- catálogo completo e pesquisável de vulnerabilidades;
- inventário visual com responsável, ambiente, criticidade e saúde;
- cadastro persistente de novos ativos;
- relacionamento entre ativos e achados abertos;
- quadro de remediação dividido por etapa do workflow;
- abertura e atualização do plano diretamente pelo quadro.

## Governança, auditoria e relatórios

- matriz de controles com cobertura e estado de conformidade;
- trilha de auditoria persistente para cadastros e mudanças de workflow;
- identificação do usuário responsável pelas alterações;
- visão executiva com risco, SLA, correções e exposição por severidade;
- relatório de risco por time responsável;
- exportação dos achados em CSV;
- proteção das operações de escrita e exportação no servidor.

## Stack

- React + TypeScript
- Next.js App Router
- Vercel Functions e PostgreSQL
- Drizzle ORM
- Lucide Icons
- CSS responsivo sem biblioteca visual pronta

## Estrutura principal

- `app/page.tsx`: dashboard e interações do produto
- `app/api/dashboard/route.ts`: agregação dos indicadores e dados
- `app/api/reports/export/route.ts`: exportação auditada do relatório CSV
- `lib/validation.ts`: regras de entrada independentes da interface
- `lib/security.ts`: validação do usuário para operações protegidas
- `db/schema.ts`: modelo relacional de ativos, achados e auditoria
- `db/init.ts`: inicialização e dados de demonstração
- `drizzle/`: migrations versionadas
- `tests/`: testes de regras de negócio, segurança, CSV e renderização

## Documentação

- [Arquitetura e decisões técnicas](docs/ARCHITECTURE.md)
- [Documentação da API](docs/API.md)
- [Case study do produto](docs/CASE_STUDY.md)
- [Decisões de produto e engenharia](docs/DECISIONS.md)

## Executar localmente

Requisitos: Node.js 22.13 ou superior.

```bash
npm ci
cp .env.example .env.local
npm run db:migrate
npm run dev
```

## Qualidade

```bash
npm run lint
npm test
npm run test:e2e
npm run typecheck
npm run build
```

Os testes cobrem identidade nas operações protegidas, validação de ativos e achados, regras do workflow, geração de CSV e resposta das principais rotas. A jornada de navegador cadastra um ativo e confirma a persistência depois de recarregar.

## Roadmap

1. papéis de acesso por equipe;
2. integrações com tickets e scanners defensivos;
3. notificações de SLA e testes end-to-end.

O Prioris é um sistema demonstrativo focado em prevenção, visibilidade e correção defensiva. Ele não executa exploração ou ataques.
