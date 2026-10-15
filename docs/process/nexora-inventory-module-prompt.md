docs/process/nexora-inventory-module-prompt.md — cola o preâmbulo de nexora-vertical-slice-prompts.md antes deste bloco.

Módulo: Inventory inteiro, /inventory. Entrega única, até que nenhuma rota de /inventory
abra num placeholder, nenhum estado do §33 que caiba a um ecrã fique por desenhar, e cada
comando que o backend expõe para o inventário tenha o seu caminho no ecrã certo.

## Modo de entrega

Uma entrega só, do princípio ao fim, sem paragens. Isto revoga, para esta sessão, o
protocolo de fatia do CLAUDE.md global e a linha de protocolo de fatia do preâmbulo:

- Sem checkpoints em `.claude/progress/current.md` durante o trabalho. Esse ficheiro pertence
  a outra sessão; não o sobrescrevas.
- Sem relatórios intermédios, sem perguntas de confirmação, sem "queres que eu continue".
- A lista de tarefas é tua; corre-a inteira.
- Um único relato, no fim, com tudo feito e verificado.

Se algo ficar bloqueado, entrega todo o resto completo e diz no relato final o que ficou de
fora e porquê. Bloqueio num ecrã não para os outros.

O working tree tem trabalho por commitar de sessões anteriores (módulos CRM, Sales e
Catalog, gestão de colunas, layout estreito). Constrói por cima; não revertas, não formates
em massa e não faças stage de nada.

## O que muda neste módulo

Catalog só lia. Inventory escreve, e escreve sobre o livro-razão do stock (§60.1: "StockMovement
is the immutable inventory ledger"). A superfície está em
`demos/nexora/backend/backend/api/index.ts` (objeto `inventory`), leituras em
`api/resources/operations.ts`, comandos em `api/commands/inventory.ts`:

```
Leituras (inventory.view)
inventory.list(q)                GET /inventory                  posições SKU × armazém, com âmbito de armazém
inventory.sku(skuId)             GET /inventory/:skuId           posições + últimos 100 movimentos
inventory.movements(q)           GET /stock-movements            com âmbito de armazém
inventory.warehouses()           GET /warehouses                 SEM âmbito: devolve os seis
inventory.locations(whId)        GET /warehouses/:id/locations
inventory.transfers.list(q)      GET /transfers                  âmbito: origem ou destino
inventory.transfers.get(id)      GET /transfers/:id              SEM verificação de armazém
inventory.cycleCounts.list(q)    GET /cycle-counts               com âmbito
inventory.cycleCounts.get(id)    GET /cycle-counts/:id           verifica o armazém

Comandos
inventory.adjust                 POST /inventory/adjustments     inventory.adjust no armazém
inventory.transfers.create|ready|ship|receive|cancel            inventory.transfer
inventory.cycleCounts.create|start|submit|complete|cancel       inventory.cycle_count
```

Campos de filtro e ordenação por lista estão em `operations.ts` (inventário :263, movimentos
:337, transferências :407, contagens :483); a mecânica de `ListQuery` em `api/query.ts`
(`pageSize` 25/50/100, operadores `eq…is_not_empty`, `q`). Lê-os antes de desenhar uma barra
de filtros: um filtro que o backend não aceita é um controlo que mente.

Regras de negócio que os ecrãs têm de fazer ver antes do erro, não depois:

- Ajuste: razão obrigatória, uma de `count_correction`, `damage`, `found_stock`,
  `data_correction`, `other`; nota obrigatória a partir de 10 unidades ou US$ 1 000 (`ADJUSTMENT_NOTE_REQUIRED`);
  precisão da unidade (`QUANTITY_PRECISION_EXCEEDED`); zero recusado; `WAREHOUSE_CLOSED`,
  `LOCATION_BLOCKED`, `INSUFFICIENT_AVAILABILITY` (409). Um ajuste negativo por `damage`
  move stock para o balde danificado e não mexe em `onHand` — o ecrã diz isso antes de
  confirmar.
- Transferência: origem ≠ destino (`TRANSFER_SAME_WAREHOUSE`); ciclo draft → ready → shipped
  → partially_received | received; cancelar só em draft ou ready (§61: "cannot be cancelled
  after any quantity has shipped"); receção parcial por linha, com danificados.
  `app-order-progress` já desenha o ciclo de um registo: lê-o antes de escrever outro.
- Contagem: `start` fotografa `systemOnHand`; `submit` com impacto de variância ≥ US$ 2 500
  abre um pedido de aprovação (`cycle_count.v1`, warehouse_manager) e `complete` responde
  `APPROVAL_REQUIRED` até lá. `app-approval-panel` já desenha a cadeia de decisões.
- Todo comando exceto `create` verifica a versão (`STALE_VERSION`): ER-01..ER-04 dizem como
  um conflito se lê.

## Ecrãs a entregar

Os quatro destinos do modelo de navegação (`core/nav/nav.model.ts:100-115`) abrem hoje o
placeholder, cada um com o seu `:id` implícito (`app.routes.ts:57-67`). Regista as páginas no
mapa `PAGES` como CRM, Sales e Catalog, e escreve `pages/inventory-routes.spec.ts` pelo
molde de `catalog-routes.spec.ts`.

1. /inventory/overview — o flagship do módulo (§34.4: "warehouse-level metrics; low-stock
   exceptions; stock movement; allocation pressure; transfers; capacity visualization;
   replenishment actions"). §11 pede que o módulo "go beyond tables" e nomeia quatro ideias:
   mapa de capacidade, heatmap de inventário, inspetor de alocação, linha do tempo de
   movimentos. Desenha só o que os dados sustentam: verifica em `operations.ts` e no seed o
   que existe de capacidade e de alocação antes de prometer um mapa. Métricas por armazém a
   partir de `GET /inventory` (on hand, disponível, reservado, a caminho, abaixo do ponto de
   encomenda, abaixo do stock de segurança, valor com `cost.view`); exceções de stock baixo
   que levam à posição; transferências em curso; movimentos recentes. Um número isolado é um
   `stat-card`; uma tendência, uma distribuição ou uma comparação é um `chart` (secção
   seguinte).
2. A lista de posições (`GET /inventory`) — decisão a tomar: é o corpo de
   /inventory/overview ou um destino próprio (por exemplo /inventory/stock) acrescentado ao
   modelo de navegação. É a lista que o operador mais usa ("o que está abaixo do ponto de
   encomenda no CHI-01"). Decide, regista o motivo, e não deixes `GET /inventory` sem lista.
   O ajuste nasce aqui (ação de linha e/ou no registo da posição).
3. /inventory/warehouses e /inventory/warehouses/:id — os armazéns (seis no seed, `SAO-01`
   incluído; §75 diz cinco) com gestor e número de localizações; o registo de um armazém com
   as suas posições, localizações (`GET /warehouses/:id/locations`; RECEIVING, STAGING,
   QUARANTINE, DAMAGED em §60.8), movimentos e contagens. `/settings/warehouses` é outra
   coisa (organização): não a construas aqui.
4. /inventory/transfers, /inventory/transfers/new e /inventory/transfers/:id — lista,
   criação (FM-01..FM-10) e registo com o ciclo e as ações de cada estado, incluindo a
   receção parcial por linha. `/new` tem de ser declarado antes de `:id`, como em
   `app.routes.ts:95-96`.
5. /inventory/movements e /inventory/movements/:id — o livro-razão: lista com tipo, SKU,
   armazém, delta, origem (`sourceEntityType`/`sourceEntityId` levam ao registo que causou o
   movimento), ator, data. A notificação `shipment` já aponta para esta rota
   (`core/activity/notifications.store.ts:17`). Decide o que o `:id` mostra — um movimento é
   imutável e pequeno; pode ser um painel sobre a lista em vez de uma página — e regista.
6. Contagens de ciclo — o backend tem o ciclo completo e o modelo de navegação não tem
   destino. Acrescenta /inventory/cycle-counts (lista, criação, registo com contagem por
   linha, variância, aprovação) ou justifica no relato porque ficou de fora. jordan-wells é a
   persona que conta (tem `inventory.cycle_count` no CHI-01).

Liga o registo de SKU (`pages/catalog/sku-page.ts`, separadores Stock e Movements) ao
inventário: a posição e o livro-razão filtrado pelo SKU. `app-stock-table`
(`pages/catalog/stock-table.ts`) e `core/catalog/warehouses.store.ts` já existem: reutiliza,
não copies.

## Capacidades novas da biblioteca (entregues depois do Catalog)

- `chart` (`@slotted/angular/chart`, `figure[slChart]`): linha, área, barra, pizza e
  dispersão; legenda, tooltip, toolbar, zoom, anotações, vista em tabela dos mesmos dados;
  responde à largura do contentor. O motor `echarts` é peer opcional de `@slotted/core` e a
  demo ainda não o declara: o primeiro gráfico acrescenta-o ao `package.json` da demo.
  `preloadChartEngine(kinds)` num resolver de rota. Lê `chart.docs.ts` e o contrato antes de
  desenhar; a skill `dataviz`, se existir na sessão, diz como um gráfico é desenhado.
- `data-grid` com pop-in (`columnOverflow: 'auto'`, por omissão): abaixo de 600px, ou em ecrã
  tátil abaixo de 1024px, as colunas que não cabem entram na linha como pares rótulo/valor.
  Cada lista marca a coluna identificadora com `rowHeader: true` e dá `priority` às colunas
  chave (LP-01). Toque simples ativa uma linha `activatable`. Clique direito no cabeçalho
  abre o menu de coluna.
- `app-list-view-tools` (`pages/list-view/`) já traz o gestor de colunas, vistas guardadas e o
  menu "Sort" de ordenação múltipla que aparece quando o pop-in tem colunas.
- `page-header` compacto abaixo de 600px: ações num `slToolbar overflow="menu"` com
  contrapartes ficam na linha do título; numa `page` com `fill`, o header recolhe quando o
  corpo rola.
- Classes de tamanho: compacta < 600px, média 600–1023px, expandida ≥ 1024px
  (`COMPACT_BELOW`, `EXPANDED_FROM` em `@slotted/core/measure`). Um `@container` de ecrã que
  decida composição de página usa estes limiares.

## As armadilhas deste módulo

- **Custo vazado pelo inventário.** `getSku` zera o custo sem `cost.view`, mas
  `inventoryListItem` preenche sempre `standardCost` e `onHandValue`
  (`operations.ts:253-257`): noah-bennett e jordan-wells recebem custo por `/inventory`. O
  ecrã não desenha valor nem custo sem `cost.view` (PM-01, PM-02) e o vazamento é linha na
  tabela Backend do ledger. Verifica com noah-bennett e com jordan-wells.
- **Âmbito de armazém incompleto.** `GET /warehouses` e `GET /transfers/:id` não verificam o
  âmbito; `SkuDetail.inventory` também não (linha já no ledger). jordan-wells (só CHI-01) não
  pode ver no ecrã o que o âmbito lhe nega, mesmo quando o backend o devolve. Linha no ledger
  para cada fuga nova.
- **Quem pode escrever.** Só maya-chen tem `inventory.adjust` e `inventory.transfer`; nenhuma
  persona usa warehouse_manager nem procurement_manager. jordan-wells tem
  `inventory.cycle_count` e mais nada de escrita no inventário. Um controlo que a persona não
  pode usar não se desenha, ou desenha-se desativado com o motivo (FM-04) — decide por
  controlo e verifica com cada persona.
- **Divergências backend ↔ domínio**, cada uma uma linha na tabela Backend do ledger e nunca
  uma correção no backend: `ready` não reserva stock (§61.2 diz que reserva);
  `INSUFFICIENT_AVAILABILITY` no código contra `INSUFFICIENT_AVAILABLE_STOCK` em §81; seis
  armazéns no seed contra cinco em §75; a vista guardada "CHI-01 below reorder point" de
  jordan nomeia colunas (`sku`, `name`) que o recurso não expõe.
- **Rótulos em falta.** `MOVEMENT_SOURCE_LABEL` (`core/catalog/catalog.model.ts:75`) não tem
  `manual_adjustment` nem `return`, que o backend emite. Um movimento sem rótulo não mostra
  o identificador cru.
- **Quantidades** são decimais com a precisão da unidade do SKU (`EA|PK|FT|M|KG`,
  `quantityPrecision` 0–3); um "12.000" numa coluna de unidades é erro de leitura. Não há
  lotes, séries nem validade no domínio: não os desenhes.

## Estados, permissões e cenários

Cada ecrã responde aos estados do §33 que lhe cabem: pendente ≠ vazio; vazio ≠
vazio-por-filtro; erro com repetição; dados parciais; leitura-apenas por permissão;
confirmação destrutiva (cancelar transferência); sucesso parcial (receção parcial);
mutação otimista e rollback; conflito de versão.

Casos semeados do §82 que são a prova do módulo — abre cada um antes de dar o ecrã por
feito: 82.7 zero disponível com PO a caminho (`edge.sku.zero_available_inbound`); 82.8 SKU
repartido (`edge.sku.three_warehouses`, cinco armazéns no seed leve); 82.14 encomenda
parcialmente alocada; 82.20 receção com danificados (`edge.receipt.damaged`); 82.33
utilizador com âmbito de armazém (`edge.user.warehouse_scope`); 82.35 conflito de inventário
(`edge.conflict.inventory_changed`).

Personas obrigatórias: maya-chen (única que ajusta e transfere), jordan-wells (CHI-01, conta),
marcus-lee (comprador, custo sim), noah-bennett (sem custo), owen-price (auditor, leitura),
aisha-grant (sem acesso ao inventário: o módulo diz-lhe isso, não abre vazio).

Cenários: healthy; `inventory_crisis` (entra como marcus-lee; §77.6: 42 SKU abaixo do stock de
segurança, 17 com falta de alocação, 8 PO urgentes ou atrasadas, a falta do MX-240 da
Meridian) — é o cenário em que o overview tem de ler diferente; `restricted_user` (jordan no
CHI-01); `system_degraded`; `new_tenant` (um armazém).

## Qualidade visual — a barra desta entrega

- Quantidades com a precisão da unidade; dinheiro alinhado pela última casa, na moeda do que
  é mostrado.
- CP-02 (irmãos em `inline`/`stack`), CP-05 (tokens; o guarda
  `specs/demo-screen-tokens.test.mjs` recusa literais sem `literal: <motivo>`), CP-06 (uma
  forma por ideia).
- Esqueletos pelo skill `loading-states`, verificados com `tools/jump.mjs`.
- Dois esquemas e três densidades.
- Um gráfico segue a mesma barra: legível em claro e escuro, sem cor como único canal, e com
  a vista em tabela alcançável.

## Decisões que provavelmente nascem aqui

- Como um livro-razão imutável se lê: o movimento e a sua origem, o delta com sinal, o
  saldo que resulta.
- Como um ajuste pede confirmação proporcional ao impacto (nota a partir de 10 unidades ou
  US$ 1 000).
- Como um ciclo com aprovação se lê quando a aprovação está pendente.
- Como um overview operacional se lê a 390px: ordem, o que se resume, onde um gráfico e o
  seu número coexistem.

Cria regra nova pelo esquema de `writing-rules.md` quando a decisão é do produto; emenda a
existente quando a redação melhora (mesmo número) e retira-a quando o sentido muda.

## Verificação por ecrã, antes de o dar por feito

- 1280, 570 e telemóvel emulado (390×844 e 360×780): lista de elementos mais largos que o
  viewport vazia; controlos a 44px com ponteiro grosso.
- `node tools/jump.mjs <rota> '<seletor>'`: o `top` não se mexe e nenhuma caixa encolhe.
- Transporte normal e degradado pelo painel de demonstração.
- Percurso no telemóvel: overview → exceção de stock baixo → posição → ajuste (maya) →
  movimento criado no livro-razão → voltar com o gesto do sistema. E: criar transferência,
  expedir, receber parcialmente com danificados.
- `ng test` na demo com specs por comportamento prometido — em particular custo ausente sem
  `cost.view`, âmbito do jordan, nota obrigatória do ajuste, cancelar recusado depois de
  expedir, contagem que pede aprovação.
- `pnpm --filter @slotted/<pkg> verify` e `pnpm check` quando tocas um pacote;
  `pnpm demo:refresh` e servidor reiniciado antes de capturar.

## Fecho

Não commites. No fim — e só no fim — um relato: veredictos (pacote / demo / backend) por
observação, ficheiros, linhas do ledger, regras novas ou emendadas, o que ficou aberto e
porquê. O módulo termina quando nenhuma rota de /inventory abrir num placeholder e nenhum
ecrã desenhar um controlo para um comando que o backend não tem ou que a persona não pode
usar.
