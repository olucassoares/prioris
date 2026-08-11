# API do Prioris

Todas as operações de escrita e exportação exigem identidade fornecida pelo ambiente autenticado. Erros seguem o formato `{ "error": "mensagem" }`.

## Endpoints

| Método | Rota | Função | Respostas principais |
| --- | --- | --- | --- |
| `GET` | `/api/dashboard` | Retorna resumo, ativos, achados e auditoria | `200`, `500` |
| `POST` | `/api/assets` | Cadastra um ativo | `201`, `400`, `401`, `409`, `500` |
| `POST` | `/api/findings` | Registra um achado | `201`, `400`, `401`, `404`, `500` |
| `PATCH` | `/api/findings/:id` | Atualiza responsável, prazo e status | `200`, `400`, `401`, `404`, `500` |
| `GET` | `/api/reports/export` | Exporta os riscos em CSV | `200`, `401`, `500` |

## Exemplo: cadastrar um ativo

```json
{
  "name": "API de Pagamentos",
  "owner": "Plataforma",
  "type": "api",
  "environment": "production",
  "criticality": "critical",
  "status": "attention"
}
```

## Exemplo: registrar um achado

```json
{
  "title": "Política de acesso desatualizada",
  "description": "A política precisa ser revisada para o padrão atual.",
  "remediation": "Revisar a política e registrar a evidência da aprovação.",
  "severity": "high",
  "score": 8.1,
  "assetId": 1,
  "assignedTo": "Time de Plataforma",
  "source": "Revisão interna",
  "dueAt": "2026-09-30"
}
```

## Regras importantes

- `score` deve estar entre 0 e 10;
- um achado precisa estar vinculado a um ativo existente;
- nomes de ativos não podem ser duplicados, ignorando maiúsculas e minúsculas;
- status de achados aceitos: `open`, `in_progress`, `resolved` e `accepted`;
- alterações e exportações geram eventos de auditoria.
