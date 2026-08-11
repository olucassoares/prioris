# Case study — Prioris

## O problema

Times pequenos costumam espalhar informações de segurança entre planilhas, mensagens e ferramentas diferentes. Isso dificulta responder perguntas simples: quais riscos são prioritários, quem é responsável, qual prazo venceu e o que mudou recentemente?

## A solução

O Prioris centraliza o inventário de ativos e o ciclo de correção de achados em um único produto. O dashboard transforma dados operacionais em indicadores de risco, enquanto o quadro de remediação organiza o trabalho e a trilha de auditoria preserva o histórico.

## O que foi construído

- dashboard executivo com score, severidade e SLA;
- inventário pesquisável de ativos;
- cadastro e atualização de achados;
- workflow de remediação com responsável e prazo;
- matriz demonstrativa de governança;
- trilha de auditoria persistente;
- relatórios por severidade e equipe;
- exportação CSV;
- validação, autenticação do ambiente e testes automatizados.

## Principais desafios

### Transformar dados em prioridade

Um número isolado não ajuda o analista. A interface combina severidade, score, estado e prazo para mostrar o que precisa de atenção primeiro.

### Preservar o histórico

Atualizar apenas a linha do achado apagaria o contexto da mudança. Por isso, cada ação relevante também cria um evento independente de auditoria.

### Validar na fronteira correta

Os formulários possuem regras de experiência, mas a API repete a validação. Isso evita depender do navegador para proteger os dados.

## Resultado

O projeto demonstra um fluxo full-stack completo: interface, API, regras de negócio, banco relacional, migrations, autenticação, auditoria, exportação, testes e publicação em ambiente serverless.

## Próximas evoluções possíveis

- papéis e permissões por equipe;
- comentários e anexos como evidências;
- notificações de vencimento;
- integração com scanner defensivo e ferramenta de tickets;
- testes end-to-end do fluxo completo.
