docs/process/nexora-automation-module-prompt.md — cola o preâmbulo de nexora-vertical-slice-prompts.md antes deste bloco.

Módulo: Workflow & Automation inteiro, /automations. Entrega única, até que nenhuma rota de
/automations abra num placeholder, um workflow ativado corra quando o seu evento acontece e deixe
uma execução que o ecrã mostra, nenhum estado do §33 que caiba a um ecrã fique por desenhar, e nada
fique em aberto no relato.

## Modo de entrega

Uma entrega só, do princípio ao fim, sem paragens. Isto revoga, para esta sessão, o protocolo de
fatia do CLAUDE.md global e a linha de protocolo de fatia do preâmbulo:

- Sem checkpoints em `.claude/progress/current.md` durante o trabalho. Esse ficheiro pertence a
  outra sessão; não o sobrescrevas.
- Sem relatórios intermédios, sem perguntas de confirmação, sem "queres que eu continue".
- A lista de tarefas é tua; corre-a inteira.
- Um único relato, no fim, com tudo feito e verificado.

**Nada fica em aberto.** Cada observação é resolvida do lado a que pertence antes do relato:

- defeito de família → corrigido no pacote (teste que falha antes e passa depois, ambos os
  bindings quando o defeito é do contrato ou da stylesheet, `pnpm demo:refresh`, servidor
  reiniciado);
- erro da demo → corrigido na demo;
- defeito ou lacuna do backend que impede o domínio → corrigido em
  `demos/nexora/backend` com teste em `backend/api/api.test.ts` e `pnpm verify` no pacote do
  backend. Este prompt autoriza a mudança do backend; o seed muda só com o seu namespace de
  aleatoriedade (`context.random('workflows')`) intacto para os outros módulos;
- comportamento que o domínio pede ou permite → a linha do ledger diz "conforms" e cita a secção.

Uma linha do ledger regista cada resolução com o teste que a prova. O relato final só nomeia como
não resolvido o que pertence a trabalho de outra sessão no working tree, com a evidência de que
não é teu.

O working tree tem trabalho por commitar de outras sessões a decorrer em paralelo (pacotes,
docs). Constrói por cima; não revertas, não formates em massa e não faças stage de nada. Um
ficheiro que outra sessão está a mudar (`git diff` mostra alterações que não são tuas) é editado
só no troço que o Automation exige. `pnpm demo:refresh` empacota também o trabalho delas: diz no
relato quando uma falha vem daí.

## O que muda neste módulo

Automation é o primeiro módulo em que a pessoa escreve regras em vez de registos: um workflow é
uma definição (gatilho, árvore de condições, ações) que o sistema executa depois, sem ela à
frente. Fecha a Journey G (`domain.md` §20): Workflows → criar → configurar o gatilho → construir
as condições → acrescentar ações → validar → ativar → o gatilho corre → inspecionar o histórico de
execuções. Domínio: §15 (entidades, estados e "Flagship interfaces": Rule Builder, Workflow
Designer, Execution History), §34.7 (o Rule Builder como benchmark de UI própria), §69.1–§69.5
(gatilhos, árvore de condições e limites, ações e ator de automação, execução idempotente e
limite de cadeia, gatilhos agendados no relógio de demonstração), as rotas de /automations do
"Appendix A — Suggested Initial Route Map" (`workflows`, `workflows/:workflowId`,
`workflows/:workflowId/runs`) e os endpoints de §73 `### Workflows`.

A superfície está em `demos/nexora/backend/backend/api/index.ts` (objeto `workflows`), leituras em
`api/resources/platform.ts` (secção `// Workflows`), comandos em `api/commands/platform.ts`,
tipos e limites em `domain/workflow.ts` (`WORKFLOW_LIMITS`):

```
Leituras
workflows.list(q)                  GET /workflows                workflows.view
workflows.get(id)                  GET /workflows/:id            workflows.view — traz as execuções,
                                                                  mais recentes primeiro
workflows.runs(id, q)              GET /workflows/:id/runs       workflows.view

Comandos
workflows.create                   workflows.create — name, conditions e ao menos uma ação
                                   obrigatórios; nasce draft; dono = ator
workflows.update                   workflows.edit — recusa archived; um workflow em error passa
                                   a paused ao ser editado
workflows.activate                 workflows.activate — recusa archived
workflows.pause                    workflows.activate — só de active ou error
workflows.archive                  workflows.archive — recusa archived; não há desarquivar
```

Campos de filtro e ordenação: `workflowResource` (status, triggerType, ownerId, ownerName,
runCount, lastRunAt, recentFailures, updatedAt) e a definição local de `listWorkflowRuns`
(status, startedAt, affectedEntityType). Lê-os antes de desenhar uma barra de filtros: um filtro
que o backend não aceita é um controlo que mente.

Regras de negócio que os ecrãs têm de fazer ver antes do erro, não depois:

- Limites de §69.2: nenhum grupo vazio, profundidade até 5, até 50 condições, campo obrigatório
  em cada condição. O backend devolve todas as falhas no campo `conditions` com o código
  `INVALID_CONDITIONS`, sem caminho até ao nó: o construtor marca o nó em falta antes do pedido,
  porque depois do pedido não sabe qual é.
- Operadores de §69.2 por tipo de campo: `gt`/`lt` sobre um campo de texto, ou `in` sem lista, é
  uma combinação que o construtor não oferece, não uma que recusa depois. `is_empty` e
  `is_not_empty` não têm operando.
- Transições: o ecrã desenha os comandos que o estado atual permite (RP-09). Archived é terminal
  e diz-se como tal; um workflow em error diz a falha que o pôs lá e que editar o leva a paused.
- Todo comando exceto create verifica a versão (`STALE_VERSION`): ER-01..ER-04. Uma definição
  por gravar sobrevive a um conflito e a um 503.
- Um workflow ativo corre sem ninguém à frente: editar um workflow ativo muda o que acontece no
  próximo evento. O ecrã di-lo antes de gravar.

## Ecrãs a entregar

O único destino do modelo de navegação (`core/nav/nav.model.ts`, módulo `automations`,
`/automations/workflows`) abre hoje o placeholder. Regista as páginas no mapa `PAGES` de
`app.routes.ts` como `lazyPage`, como o Support, e escreve `pages/automations-routes.spec.ts`
pelo molde de `support-routes.spec.ts`.

1. /automations/workflows — a lista: estado, gatilho, dono, execuções, última execução, falhas
   recentes; vistas por estado (ativos, em erro, rascunhos, pausados, arquivados) como pills da
   barra; o workflow em error lê-se como o que precisa de atenção.
2. O workflow (/automations/workflows/:workflowId) — a definição lida como frase (gatilho, depois
   a árvore de condições, depois as ações), estado e comandos, dono e metadados, as execuções
   recentes; o editor da definição para quem tem `workflows.edit`, o Workflow Designer de §15
   (estruturado: gatilho → condições → ações) com o Rule Builder de §34.7 dentro.
3. Criar workflow (`workflows.create`): o mesmo editor, com a ordem da Journey G; decide e regista
   o endereço (por exemplo `/automations/workflows/new`).
4. Execuções (/automations/workflows/:workflowId/runs) — a Execution History de §15: estado,
   início, duração (`completedAt − startedAt`), registo afetado a abrir o seu ecrã, motivo da
   falha; cada execução abre o resultado ação a ação (`actionResults`) com a mensagem da ação que
   falhou.

Liga o módulo ao que já existe:

- O registo afetado de uma execução (`affectedEntityType`, `affectedEntityId`) abre o seu ecrã
  pelos mesmos endereços canónicos que `core/activity/notifications.store.ts` usa
  (`ROUTE_BY_ENTITY`); um tipo sem ecrã diz-se, não abre um 404.
- As notificações e tarefas que uma ação `send_notification` ou `create_task` produz chegam ao
  centro de notificações e ao popover de tarefas do banner (`shell/banner/tasks-popover.ts`) e
  levam ao registo do evento; confirma com spec.
- A pesquisa global (`SearchHit` em `resources/platform.ts`) não devolve workflows. Decide pelo
  domínio se devolve; se sim, o backend acrescenta o tipo e a pesquisa e o command palette abrem o
  workflow.

## As armadilhas deste módulo

- **O motor não corre.** `workflows.execute` em `commands/platform.ts` existe e nenhum código o
  chama: nenhum evento de §69.1 avalia workflows, e as execuções que a lista mostra são todas do
  seed. É a lacuna central do módulo e é do backend: cada gatilho de §69.1 dispara a avaliação a
  partir do comando que produz o evento (confirmar encomenda, escalar ticket, fatura vencida,
  stock abaixo do ponto de encomenda, estado do cliente), e os agendados correm na inicialização e
  quando o relógio de demonstração avança (§69.5), com a recuperação colapsada a uma execução por
  workflow e dia. `api.test.ts` prova cada gatilho, a idempotência `workflowId:eventId` e o
  colapso.
- **Ações que fingem.** `assign_user`, `request_approval` e `create_purchase_order_draft` não
  fazem nada e registam-se como `succeeded`. §69.3 pede que as ações invoquem os mesmos serviços
  de domínio que os comandos interativos. Uma execução que diz sucesso sem efeito é um ecrã que
  mente: o backend executa a ação ou recusa-a com falha visível.
- **Ator de automação.** §69.3 nomeia `usr_system_automation` (`AUTOMATION_ACTOR_ID` em
  `domain/common.ts`) com só as permissões das ações suportadas; `runAction` executa como o ator
  da transação que produziu o evento. O que a automação faz aparece na atividade e na auditoria
  como automação, não como a pessoa que confirmou a encomenda.
- **Cadeia.** `WORKFLOW_LIMITS.maxChainDepth` e `WORKFLOW_RECURSION_LIMIT` existem e nada os lê.
  Uma ação que produz um evento que dispara outro workflow (por exemplo `place_order_on_hold`)
  conta profundidade; à sexta, a execução para com o código, e o histórico mostra-o.
- **Códigos de falha.** O seed escreve `ACTION_TARGET_NOT_FOUND`; o motor escreve `ACTION_FAILED`;
  nenhum dos dois está em `domain/errors.ts`. Um código de execução é dito ao leitor em texto; fica
  um vocabulário, declarado num sítio, e o ecrã traduz cada código dele.
- **Validação que o backend não faz.** `create` e `update` não validam o tipo de gatilho, a
  configuração do gatilho agendado nem a configuração das ações (alvo de notificação, utilizador,
  título). `activate` não valida nada. Decide o que é validado onde: o que impede uma execução de
  ter sucesso é recusado ao ativar, não descoberto na primeira falha.
- **Campos das condições.** `evaluateConditions` lê caminhos com pontos sobre o sujeito do evento
  (`customer.creditUtilizationBps`, `order.total` em unidades menores). O construtor oferece os
  campos que o sujeito de cada gatilho tem, com o tipo e a unidade certos (dinheiro em moeda, não
  em menores; pontos base como percentagem); um campo que o sujeito não tem é uma condição que
  nunca casa. Se o backend não declara o sujeito de cada gatilho, declara-o lá e o ecrã lê-o.
- **Rule Builder e filter-bar.** `packages/core/src/filter/group.ts` já modela grupos aninhados
  de regras com junção `and`/`or`, e a filter-bar desenha-os. A árvore de §69.2 tem outros
  operadores e limites. Decide pelo skill `demo-triage` se o Rule Builder compõe a família
  (e o que lhe falta é defeito do pacote, corrigido com teste) ou se é UI própria da demo; regista
  a decisão no ledger. Nenhuma das duas escolhas duplica o modelo de condição no cliente.
- **Quem edita.** Só `administrator` (maya-chen) tem `workflows.create`, `edit`, `activate` e
  `archive`. sofia-ramirez e priya-shah são donas de workflows semeados e só os leem; marcus-lee é
  dono de workflows semeados e não tem `workflows.view`. Decide pelo domínio (§15 "owner", §55.5) o
  que ser dono significa e resolve do lado certo: autoridade do dono no backend, dono reatribuído
  no seed, ou "conforms" com a secção citada.
- **Cancelar encomenda.** O §30 ("Cancel sales order") diz "Related workflow runs may be cancelled".
  Decide se se aplica a uma execução `queued` ou `running` e regista-o.
- **Relógio.** Avança o relógio de demonstração e confirma: o diário corre uma vez por dia, o
  semanal no seu dia e hora, e um salto de várias semanas não cria uma execução por ocorrência
  perdida.
- **Seed.** Lê as linhas `seed` do ledger antes de confiar numa contagem.

## Estados, permissões e cenários

Cada ecrã responde aos estados do §33 que lhe cabem: pendente ≠ vazio; vazio ≠ vazio-por-filtro;
erro com repetição; leitura-apenas por permissão; confirmação destrutiva ou irreversível (arquivar,
ativar, editar um ativo); validação antes do pedido; conflito de versão; um workflow aberto no ecrã
que outra pessoa mudou ou que o motor pôs em error.

Fixtures a abrir antes de dar o ecrã por feito (`data/seed/cross-cutting.ts`):
`edge.workflow.nested_conditions` (árvore aninhada: o construtor e a leitura em frase aguentam-na)
e `edge.workflow.failed_run` (a execução falhada: motivo, ação que falhou, registo afetado). O seed
semeia um workflow em cada estado de §15; abre cada um.

Personas obrigatórias: maya-chen (tudo), evan-brooks e owen-price (leitura), sofia-ramirez e
priya-shah (leitura de workflows de que são donas), os stand-ins procurement-lead e support-lead
(leitura), noah-bennett, marcus-lee, jordan-wells e aisha-grant (sem `workflows.view`: o módulo
diz-lho, não abre vazio).

Cenários: healthy; `new_tenant` (confirma o que o seed semeia e desenha o vazio que daí resulta,
com o caminho para criar quando a persona pode); `restricted_user`; `system_degraded` (700–1600
ms, 5% das escritas falham: uma definição não se perde); `support_incident` (escalamentos
disparam `ticket.escalated` depois de o motor existir: o histórico enche-se e lê-se).

## Qualidade visual — a barra desta entrega

- O Rule Builder de §34.7: grupos aninhados lidos pela indentação e pela junção dita em texto em
  cada nível, não só por cor ou borda; acrescentar, mover e remover condição e grupo por teclado
  e por ponteiro; a profundidade e a contagem restantes ditas antes do limite; a 570 px e no
  telemóvel, a árvore não rola na horizontal.
- O §15 pede menus, popovers, fronteiras de drag-and-drop, overlays e navegação por teclado neste
  ecrã: cada um tem o seu teste de comportamento, e um popover de operador não sai do viewport em
  telemóvel.
- A definição lê-se como frase antes de se editar como formulário: um leitor sem `workflows.edit`
  percebe o que o workflow faz sem abrir um editor desligado.
- Durações e datas legíveis ("há 3 h", "1,2 s"); o estado de uma execução dito por texto e não só
  por cor; datas relativas acompanham o relógio de demonstração.
- CP-02, CP-05 (o guarda `specs/demo-screen-tokens.test.mjs`), CP-06.
- Esqueletos pelo skill `loading-states`, medidos com
  `PERSONA=<key> [TOUCH=1] node tools/jump.mjs <rota> '<seletor>' [w] [h]`: `top` a 0 em 1280,
  570 e telemóvel com toque. O esqueleto da definição é a anatomia de gatilho, árvore e ações; o
  esqueleto do histórico é a anatomia de uma linha de execução.
- Dois esquemas e três densidades; em toque, as ferramentas da lista numa linha (LP-11).
- O bundle inicial não passa o orçamento de 3.75 MB de `angular.json`: confirma depois de cada
  import.

## Decisões que provavelmente nascem aqui

- Como uma regra aninhada se lê como frase e se edita como árvore, e onde muda de uma para a
  outra.
- Como um limite estrutural (profundidade, contagem) se diz antes de ser atingido.
- Como um editor de definição se reduz a 570 px e a telemóvel.
- Como uma ação feita pelo sistema se distingue, na atividade e na auditoria, de uma feita por uma
  pessoa.

Cria regra nova pelo esquema de `demos/nexora/guidelines/writing-rules.md` quando a decisão é do
produto; emenda a existente quando a redação melhora (mesmo número) e retira-a quando o sentido
muda. Um tópico novo (por exemplo "builders") entra no `index.md` e no `README.md` das
guidelines.

## Verificação por ecrã, antes de o dar por feito

- 1280, 570 e telemóvel emulado (390×844 e 360×780):
  `node tools/look.mjs <url> <png> <w> <h> <persona> <cenário> phone` — lista de elementos mais
  largos que o viewport vazia (um elemento dentro de um contentor que rola por si não conta);
  controlos a 44px com ponteiro grosso.
- `jump.mjs` com persona e toque, como acima.
- Transporte normal e degradado pelo painel de demonstração (ou `SCENARIO=system_degraded`).
- Percurso da Journey G no telemóvel escrito como `tools/journey-g.mjs`, pelo molde de
  `tools/journey-d.mjs` (uma sessão de browser, persona trocada pelo painel de demonstração, um
  PASS ou FAIL por passo): maya-chen abre Workflows → cria um workflow `ticket.escalated` → uma
  árvore com um grupo `or` dentro de um `and` → um grupo vazio é marcado antes de gravar → ações
  `send_notification` e `create_task` → grava → ativa → aisha-grant escala um ticket → maya-chen
  abre o histórico e vê a execução `succeeded` com o ticket afetado → o ticket abre-se → a
  notificação chegou ao alvo → voltar com o gesto do sistema ao histórico → owen-price lê o
  workflow sem editor → jordan-wells é recusado. Corre-o a 390×844 e a 360×780; todos os passos
  passam.
- `api.test.ts`: cada gatilho de §69.1 avalia os workflows ativos e só esses; idempotência por
  `workflowId:eventId`; condições que não casam dão `skipped`; ação que falha dá
  `partially_failed` ou `failed` e um workflow `failed` passa a error; cadeia parada com
  `WORKFLOW_RECURSION_LIMIT`; agendados no avanço do relógio, colapsados; o ator de automação na
  auditoria; cada ação de §69.3 com o efeito do comando interativo equivalente.
- `ng test` na demo com specs por comportamento prometido — em particular os comandos por estado,
  os limites de §69.2 marcados no nó antes do pedido, os operadores por tipo de campo, a definição
  preservada num 503 e num conflito, o registo afetado aberto no endereço canónico, a leitura sem
  editor para quem não edita.
- `pnpm --filter @slotted/<pkg> verify` e `pnpm check` quando tocas um pacote; `pnpm verify` no
  backend quando o tocas; `pnpm demo:refresh` e servidor reiniciado antes de capturar.

## Fecho

Não commites. No fim — e só no fim — um relato: veredictos (pacote / demo / backend / conforms)
por observação, ficheiros, linhas do ledger, regras novas ou emendadas, e a evidência de cada
verificação. O módulo termina quando nenhuma rota de /automations abrir num placeholder, cada
gatilho de §69.1 produzir uma execução que o histórico mostra, nenhuma execução disser sucesso sem
efeito, a Journey G passar inteira no telemóvel, e nenhuma observação ficar sem resolução.
