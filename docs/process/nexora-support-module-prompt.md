docs/process/nexora-support-module-prompt.md — cola o preâmbulo de nexora-vertical-slice-prompts.md antes deste bloco.

Módulo: Support inteiro, /support. Entrega única, até que nenhuma rota de /support abra num
placeholder, nenhum estado do §33 que caiba a um ecrã fique por desenhar, cada comando que o
backend expõe para tickets tenha o seu caminho no ecrã certo, e nada fique em aberto no relato.

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
  aleatoriedade (`context.random`) intacto para os outros módulos;
- comportamento que o domínio pede ou permite → a linha do ledger diz "conforms" e cita a secção.

Uma linha do ledger regista cada resolução com o teste que a prova. O relato final só nomeia como
não resolvido o que pertence a trabalho de outra sessão no working tree, com a evidência de que
não é teu.

O working tree tem trabalho por commitar de outras sessões a decorrer em paralelo (preferências,
docs). Constrói por cima; não revertas, não formates em massa e não faças stage de nada. Um
ficheiro que outra sessão está a mudar (`git diff` mostra alterações que não são tuas) é editado
só no troço que o Support exige.

## O que muda neste módulo

Support é o primeiro módulo de comunicação: um ticket é uma conversa com relógio, não um documento
com linhas. Fecha a Journey D (`domain.md` §20): inbox → ticket → contexto do cliente → encomenda
relacionada → exceção de envio → escalamento interno → resolução → notificação ao cliente → ticket
fechado. Domínio: §14 (entidades e "UI implications"), §34.6 (o layout da inbox: lista →
conversa → contexto de cliente, encomenda e SLA; split panes, regiões fixas, fronteiras de
scroll), §68.1–§68.6 (estados, prioridades, política e relógio de SLA, operações, visibilidade),
§72.11 (SLA de primeira resposta), §72.12 (o ticket escalado entra na saúde do cliente).

A superfície está em `demos/nexora/backend/backend/api/index.ts` (objeto `support`), leituras em
`api/resources/support.ts`, comandos em `api/commands/support.ts`, alvos de SLA em
`domain/support.ts` (`SLA_TARGETS`):

```
Leituras
support.tickets.list(q)            GET /support/tickets          support.view
support.tickets.get(id)            GET /support/tickets/:id      support.view — mensagens internas
                                                                  só com support.reply ou support.manage
support.metrics()                  GET /support/metrics          support.view (pedido 'analytics')
support.macros()                   GET /support/macros           support.view (o detalhe já traz as ativas)

Comandos
tickets.create                     support.create — subject e description obrigatórios
tickets.update                     support.change_status — subject, priority, category, tags, ligações
tickets.assign                     support.assign — new → open
tickets.reply                      support.reply — pública; macroId; setStatus open | pending_customer |
                                   pending_internal | resolved (resolved com resolutionCode)
tickets.internalNote               support.reply — interna, não conta como primeira resposta
tickets.customerMessage            support.reply — mensagem simulada do cliente (§68.5 reopen)
tickets.pendingCustomer            support.change_status — exige resposta pública prévia ou motivo
tickets.pendingInternal            support.change_status
tickets.escalate                   support.escalate — motivo; alvo por omissão: um Support Manager
tickets.resolve                    support.change_status — RESOLUTION_CODE_REQUIRED
tickets.reopen                     support.change_status dentro de 7 dias; support.manage depois
                                   ou a partir de closed
tickets.close                      support.change_status — só de resolved
```

Campos de filtro e ordenação: `ticketResource` em `support.ts` (status, priority, channel,
category, assigneeId, assignedTeamId, customerSegment, firstResponseSla, resolutionSla,
resolutionDueAt, resolutionMinutesRemaining, tags, relatedOrderId). Lê-o antes de desenhar uma
barra de filtros: um filtro que o backend não aceita é um controlo que mente.

Regras de negócio que os ecrãs têm de fazer ver antes do erro, não depois:

- Transições de §68.5: o ecrã desenha os comandos que o estado atual permite (RP-09), não traduz
  `INVALID_TRANSITION` depois. `closed` recusa tudo com `TICKET_CLOSED`; o ecrã já o diz.
- SLA em minutos de expediente (§68.3: seg–sex, 08:00–18:00, America/Chicago), dois relógios
  independentes: primeira resposta (para na primeira resposta pública, não recomeça) e resolução
  (pausa em pending_customer, continua em pending_internal, para em resolved, retoma ao reabrir).
  Estados `running`, `at_risk` (> 75% do alvo), `breached`, `paused`, `met`. O tempo restante
  vem do backend (`firstResponseMinutesRemaining`, `resolutionMinutesRemaining`); o cliente não
  recalcula. Um prazo que cai fora do expediente diz-se como tal.
- Visibilidade (§68.6): uma nota interna nunca se apresenta como visível ao cliente — no fio, no
  compositor e na confirmação. A persona sem `support.reply` não a recebe; o ecrã não desenha um
  vazio onde ela estaria.
- Pending customer exige uma resposta pública anterior ou um motivo; o controlo pede o motivo
  quando falta a resposta, antes do pedido.
- Escalate exige motivo e alvo (§68.5); resolve exige código de resolução; reopen depois de 7 dias
  ou de closed exige `support.manage` — o ecrã diz a autoridade antes do comando.
- Close automático 72 horas depois da resolução quando o relógio de demonstração avança
  (`autoClose`): o ticket aberto no ecrã reflete-o.
- Todo comando exceto create verifica a versão (`STALE_VERSION`): ER-01..ER-04. Uma resposta
  escrita sobrevive a um conflito e a um 503.

## Ecrãs a entregar

O único destino do modelo de navegação (`core/nav/nav.model.ts`, módulo `support`,
`/support/inbox`) abre hoje o placeholder. Regista as páginas no mapa `PAGES` de `app.routes.ts`
como `lazyPage`, como o Finance, e escreve `pages/support-routes.spec.ts` pelo molde de
`finance-routes.spec.ts`.

1. /support/inbox — a inbox de §34.6: fila de tickets com prioridade, estado, SLA e responsável;
   filas que um agente usa (meus, por atribuir, em risco, violados, escalados, à espera do
   cliente); contagens de `GET /support/metrics`; cada figura abre a fila com a sua condição como
   pills da barra (OV-01).
2. O ticket — conversa (públicas, internas, sistema) com o compositor de resposta e nota interna,
   macros, os dois relógios de SLA e o seu histórico (`slaEvents`), o contexto (cliente com
   saúde e dono de conta, encomenda, fatura, SKU e envio relacionados, cada um a abrir o seu
   registo) e cada comando de §68.5 no seu estado. Em desktop vive no split pane da inbox; em
   telemóvel é uma página.
3. Criar ticket (`support.create`, que sofia-ramirez também tem): a partir da
   inbox, do Customer 360 e da encomenda, com o cliente e a encomenda já preenchidos quando vem
   deles.

Decide e regista o endereço canónico de um ticket. Hoje há três: a pesquisa global
(`core/search/search.service.ts`) e o Customer 360 (`pages/customers/customer-page.ts`) apontam a
`/support/tickets/:id`; as notificações (`core/activity/notifications.store.ts`) e o modelo de
navegação apontam a `/support/inbox[/:id]`. Fica um endereço, e todos os produtores levam a ele.

Liga o módulo ao que já existe:

- A contagem do destino Inbox (`count: 'support'`) não está ligada: `shell/shell-layout.ts`
  só resolve `approvals`. Decide o que conta (por exemplo os novos e por atribuir, ou os do
  agente) e liga-a ao mesmo número que a inbox mostra.
- O separador Tickets do Customer 360 e o da encomenda (`pages/orders/order-page.ts`): cada linha
  leva ao ticket; "Create ticket" aparece quando a persona tem `support.create`.
- `core/activity/notifications.store.ts` leva `support_ticket` ao ticket (o escalamento notifica o
  alvo); confirma com spec.
- A pesquisa global e o command palette abrem o ticket no endereço canónico.

## As armadilhas deste módulo

- **Support Manager.** Nenhuma persona é support_manager. O escalamento atribui o ticket por
  omissão a um Support Manager semeado, e reabrir depois de 7 dias exige `support.manage`. O
  backend tem o mecanismo `STAND_IN_PERSONAS` (`domain/permissions.ts`; `procurement-lead`,
  `finance-controller`, `staff-accountant`) e o §55.6 descreve-o: acrescenta um stand-in se o
  domínio pedir uma decisão que nenhuma persona toma, emenda o parágrafo do §55.6, e verifica a
  receção do escalamento ponta a ponta.
- **Âmbito.** O papel support_agent não tem escopo de equipa nem de dono. Verifica se aisha-grant
  vê e muda todos os tickets e se isso é o que o domínio pede; se não for, é defeito a resolver
  pelo lado certo.
- **Leitores sem resposta.** sofia-ramirez, noah-bennett, priya-shah, staff de finance, evan-brooks
  e owen-price têm `support.view` sem `support.reply`: o ticket abre-se em leitura, sem notas
  internas, sem compositor desligado a fingir que existe. jordan-wells não tem `support.view`:
  o módulo diz-lho, não abre vazio.
- **Mensagem do cliente.** `customerMessage` simula o cliente e é o único caminho do reopen
  automático de §68.5. Decide onde vive (painel de demonstração ou ação marcada como simulação no
  ticket) sem a confundir com uma resposta do agente.
- **Exceção de envio.** A Journey D passa por uma exceção de envio e um envio não tem ecrã próprio
  (`notifications.store.ts` abre o ledger de movimentos filtrado). Decide e regista como o ticket
  mostra o envio relacionado e para onde leva.
- **Notificação ao cliente.** O backend não tem um comando "notify customer": a resposta pública
  é a notificação. Não inventes um endpoint no cliente.
- **Relógio.** Avança o relógio de demonstração e confirma: os relógios de SLA andam só em
  expediente, pending_customer pausa a resolução, e um resolved fecha às 72 horas.
- **Seed.** Lê as linhas `seed` do ledger antes de confiar numa contagem.

## Estados, permissões e cenários

Cada ecrã responde aos estados do §33 que lhe cabem: pendente ≠ vazio; vazio ≠ vazio-por-filtro;
erro com repetição; leitura-apenas por permissão; confirmação destrutiva ou irreversível (resolve,
close, escalate); resposta enviada mas transição recusada; conflito de versão; um ticket aberto na
inbox que outro agente mudou.

Fixtures a abrir antes de dar o ecrã por feito (`data/seed/curated.ts`):
`flagship.ticket.meridian` (escalado, atribuído a aisha-grant, com envio relacionado),
`edge.ticket.urgent_near_breach`, `edge.ticket.breached_high`, `edge.ticket.long_conversation`
(120 mensagens: o fio aguenta-o sem perder a posição nem o compositor).

Personas obrigatórias: aisha-grant (support_agent: tudo menos `support.manage`), o stand-in de
Support Manager se nascer, maya-chen (tudo), sofia-ramirez (leitura e criação), noah-bennett,
evan-brooks e owen-price (leitura), jordan-wells (sem acesso).

Cenários: healthy; `support_incident` (incidente de envio num cliente estratégico: 12 tickets
relacionados, 3 high, 1 urgent, uma violação de SLA, carga da fila ×2, persona aisha-grant) — a
inbox tem de ler diferente e a incidência tem de se ver como um grupo; `system_degraded` (700–1600
ms, 5% das escritas falham: uma resposta não se perde); `heavy_data`.

## Qualidade visual — a barra desta entrega

- Tempos de SLA em unidades de expediente legíveis ("1 h 20 min úteis", "vence amanhã 09:15"),
  nunca minutos crus; estado de SLA dito por texto e não só por cor; datas relativas acompanham o
  relógio de demonstração.
- A inbox de §34.6: a lista, a conversa e o contexto têm fronteiras de scroll próprias; o
  compositor e o cabeçalho do ticket ficam ao alcance com o fio rolado; em telemóvel, a inbox é
  uma lista e o ticket uma página, e o gesto de voltar do sistema regressa à fila na mesma
  posição.
- Navegação por teclado na fila (§14 "keyboard-heavy navigation"): próximo e anterior sem rato,
  com foco visível e anunciado.
- CP-02, CP-05 (o guarda `specs/demo-screen-tokens.test.mjs`), CP-06.
- Esqueletos pelo skill `loading-states`, medidos com
  `PERSONA=<key> [TOUCH=1] node tools/jump.mjs <rota> '<seletor>' [w] [h]`: `top` a 0 em 1280,
  570 e telemóvel com toque. O esqueleto do fio é a anatomia de uma mensagem; o esqueleto da fila
  é a anatomia de uma linha da fila.
- Dois esquemas e três densidades; em toque, as ferramentas da lista numa linha (LP-11).
- O bundle inicial não passa o orçamento de 3.75 MB de `angular.json`: confirma depois de cada
  import.

## Decisões que provavelmente nascem aqui

- Como uma conversa com mensagens públicas, internas e de sistema se lê e se escreve.
- Como um relógio de SLA em tempo de expediente se diz, e como se diz pausado.
- Como uma inbox de três regiões se reduz a 570 px e a telemóvel.
- Como uma fila filtra-se a si mesma (filas guardadas versus pills da barra) sem duas fontes de
  verdade.

Cria regra nova pelo esquema de `writing-rules.md` quando a decisão é do produto; emenda a
existente quando a redação melhora (mesmo número) e retira-a quando o sentido muda. Um tópico
novo (por exemplo "conversations") entra no `index.md`.

## Verificação por ecrã, antes de o dar por feito

- 1280, 570 e telemóvel emulado (390×844 e 360×780):
  `node tools/look.mjs <url> <png> <w> <h> <persona> <cenário> phone` — lista de elementos mais
  largos que o viewport vazia; controlos a 44px com ponteiro grosso.
- `jump.mjs` com persona e toque, como acima.
- Transporte normal e degradado pelo painel de demonstração (ou `SCENARIO=system_degraded`).
- Percurso da Journey D no telemóvel escrito como `tools/journey-d.mjs`, pelo molde de
  `tools/journey-c.mjs` (uma sessão de browser, persona trocada pelo painel de demonstração, um
  PASS ou FAIL por passo): inbox → ticket → contexto do cliente → encomenda relacionada → envio
  → escalamento com motivo → o Support Manager recebe-o → resolução com código e resposta
  pública → relógio avançado 72 horas → ticket fechado → voltar com o gesto do sistema. Corre-o
  a 390×844 e a 360×780; todos os passos passam.
- `ng test` na demo com specs por comportamento prometido — em particular os comandos por estado,
  a nota interna invisível a quem não responde, pending customer sem resposta pede motivo, reopen
  com a autoridade dita antes, o relógio de SLA pausado, a resposta preservada num 503 e num
  conflito, o endereço canónico a partir de cada produtor.
- `pnpm --filter @slotted/<pkg> verify` e `pnpm check` quando tocas um pacote; `pnpm verify` no
  backend quando o tocas; `pnpm demo:refresh` e servidor reiniciado antes de capturar.

## Fecho

Não commites. No fim — e só no fim — um relato: veredictos (pacote / demo / backend / conforms)
por observação, ficheiros, linhas do ledger, regras novas ou emendadas, e a evidência de cada
verificação. O módulo termina quando nenhuma rota de /support abrir num placeholder, nenhum ecrã
desenhar um controlo para um comando que o backend não tem ou que a persona não pode usar, a
Journey D passar inteira no telemóvel, e nenhuma observação ficar sem resolução.
