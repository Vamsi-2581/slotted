docs/process/nexora-procurement-module-prompt.md — cola o preâmbulo de nexora-vertical-slice-prompts.md antes deste bloco.

Módulo: Procurement inteiro, /procurement. Entrega única, até que nenhuma rota de
/procurement abra num placeholder, nenhum estado do §33 que caiba a um ecrã fique por
desenhar, e cada comando que o backend expõe para fornecedores, ordens de compra e
recebimentos tenha o seu caminho no ecrã certo.

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

O working tree pode ter trabalho por commitar de sessões anteriores (CRM, Sales, Catalog,
Inventory). Constrói por cima; não revertas, não formates em massa e não faças stage de nada.

## O que muda neste módulo

Procurement fecha a Journey B (`domain.md` §20): alerta de inventário → posição → ordem de
compra → aprovação → envio → receção → inventário atualizado → encomendas em backorder
avisadas. O Inventory já desenha o princípio (posições abaixo do ponto de encomenda,
"Inbound", quantidade sugerida); este módulo desenha o resto. Domínio: §12 e §65.1–§65.7;
efeito cruzado da receção em §30 "Receive purchase order".

A superfície está em `demos/nexora/backend/backend/api/index.ts` (objetos `suppliers` e
`purchaseOrders`), leituras em `api/resources/procurement.ts`, comandos em
`api/commands/procurement.ts`, política de aprovação em `domain/pricing.ts`
(`evaluatePurchaseOrderApproval`):

```
Leituras
suppliers.list(q)             GET /suppliers              suppliers.view
suppliers.get(id)             GET /suppliers/:id          fornecedor, mapeamentos SKU, 10 últimas PO
purchaseOrders.list(q)        GET /purchase-orders        purchase_orders.view — SEM âmbito de armazém
purchaseOrders.get(id)        GET /purchase-orders/:id    linhas com openQuantity, receções, aprovação
purchaseOrders.receipt(id)    GET /goods-receipts/:id     receipts.view
(não existe GET /goods-receipts em lista)

Comandos
suppliers.create|update                  suppliers.manage
purchaseOrders.create                    purchase_orders.create
purchaseOrders.update                    purchase_orders.edit — draft ou approved
purchaseOrders.submit                    purchase_orders.submit — draft → pending_approval | approved
purchaseOrders.send                      purchase_orders.send — approved → sent
purchaseOrders.acknowledge               purchase_orders.edit — sent → acknowledged
purchaseOrders.cancel                    purchase_orders.cancel
purchaseOrders.closeShort                purchase_orders.approve — sent | acknowledged | partially_received
purchaseOrders.receive                   receipts.create no armazém de destino
```

Campos de filtro e ordenação: `supplierResource` e `purchaseOrderResource` em
`procurement.ts`. Lê-os antes de desenhar uma barra de filtros: um filtro que o backend não
aceita é um controlo que mente.

Regras de negócio que os ecrãs têm de fazer ver antes do erro, não depois:

- Estados da PO: draft → pending_approval → approved → sent → acknowledged →
  partially_received → received → closed | cancelled. `exceptionFlags`: `delayed`,
  `disputed`; `daysLate` e `receivedShareBps` vêm calculados na lista.
- Aprovação `purchase_order.v1`, calculada em USD sobre subtotal + frete:
  ≥ US$ 25 000 → procurement_manager; ≥ US$ 100 000 → finance_manager; fornecedor com
  `relationshipTier` conditional → procurement_manager; variação do custo unitário contra o
  último custo aceite > 15% → procurement_manager, > 30% → finance_manager. O formulário diz
  que a submissão vai pedir aprovação, e porquê, antes de submeter (FM-11).
- Editar uma PO aprovada cancela a aprovação: o ecrã diz isso antes de gravar.
- Cancelar só antes de qualquer receção; uma PO parcialmente recebida fecha-se com
  `closeShort` (`purchase_orders.approve`). O ecrã desenha o comando certo para o estado
  (RP-09), não traduz a recusa depois.
- Fornecedor `on_hold` ou `inactive` recusa criar e submeter (`SUPPLIER_ON_HOLD`,
  `SUPPLIER_INACTIVE`); inativar com PO abertas recusa (`SUPPLIER_HAS_OPEN_POS`).
  `SKU_DISCONTINUED`, `WAREHOUSE_CLOSED`, quantidade positiva, pelo menos uma linha.
- Receção por linha: aceites, danificados, rejeitados, localização e nota; `RECEIPT_EMPTY`;
  tolerância de 5% acima do encomendado só com `purchase_orders.approve` e
  `overReceiptReason` (`OVER_RECEIPT_TOLERANCE`). Aceites e danificados entram em `onHand`
  e os danificados passam ao balde danificado num segundo movimento; rejeitados não entram
  no stock. O ecrã diz isso antes de confirmar.
- A receção avisa os donos das encomendas confirmadas em backorder; não aloca. Se o domínio
  pede libertação e o backend só notifica, é linha na tabela Backend do ledger.
- Todo comando exceto `create` verifica a versão (`STALE_VERSION`): ER-01..ER-04.

## Ecrãs a entregar

Os três destinos do modelo de navegação (`core/nav/nav.model.ts`, módulo `procurement`)
abrem hoje o placeholder. Regista as páginas no mapa `PAGES` de `app.routes.ts` como
`lazyPage`, como o Inventory, e escreve `pages/procurement-routes.spec.ts` pelo molde de
`inventory-routes.spec.ts`.

1. /procurement/suppliers e /procurement/suppliers/:id — lista com desempenho
   (`onTimeDeliveryBps`, `qualityScore`, `averageLeadTimeDays`, `openPurchaseOrderCount`,
   `annualSpendUsd`); registo com o scorecard, os mapeamentos SKU (custo, prazo) e as PO
   recentes. §12 pede comparação de fornecedores e scorecards: desenha só o que os campos
   sustentam. Criação e edição com `suppliers.manage`, ou justifica no relato porque ficou
   de fora.
2. /procurement/purchase-orders, /new e /:id — lista, criação (FM-01..FM-12) e registo com o
   ciclo (`app-record-progress`), a aprovação (`app-approval-panel`), as linhas com o que
   falta receber, as receções e as ações de cada estado. `/new` declarado antes de `:id`.
3. /procurement/receiving — não há lista de receções no backend. Decide o que o destino é
   (por exemplo a fila das PO sent | acknowledged | partially_received por armazém de
   destino), onde vive o formulário de receção e onde se lê uma receção
   (`GET /goods-receipts/:id`); regista a decisão. O formulário de receção das transferências
   (`pages/inventory/transfer-page.ts`) já resolve parcial e danificados: reutiliza o padrão.

Liga o módulo ao que já existe:

- Da posição de inventário abaixo do ponto de encomenda nasce "Create purchase order",
  pré-preenchido com o SKU, o armazém, a quantidade sugerida e o fornecedor preferido
  (`skuResource.preferredSupplierId`).
- `movementSourceLink` (`core/inventory/inventory.model.ts`) leva `goods_receipt` e
  `purchase_order` ao registo em vez do livro-razão filtrado.
- `core/activity/notifications.store.ts` aponta `purchase_order` e `supplier` para as
  listas: passa a apontar para o registo.
- `pages/approvals/approvals-page.ts` já trata `targetType === 'purchase_order'`: confirma
  que leva à rota nova.

## As armadilhas deste módulo

- **Âmbito de armazém.** `GET /purchase-orders` e `GET /purchase-orders/:id` não verificam
  armazém; `receive` verifica `receipts.create` no armazém de destino. jordan-wells (CHI-01)
  só recebe o que vai para CHI-01 e não vê comandos para outros armazéns. Linha no ledger
  para cada fuga.
- **Custo.** Linhas e totais de PO são preço de compra; `annualSpendUsd` é gasto. Lê §55
  para decidir se ficam sob `cost.view`. Se ficam, o ecrã não os desenha sem a permissão
  (PM-01, PM-02) e o envio pelo backend a jordan-wells é linha no ledger.
- **Sem filtro por SKU.** `purchaseOrderResource` não filtra por SKU (linha já no ledger):
  "Inbound" de uma posição não leva à PO que o traz. Não inventes a ligação.
- **Aprovadores.** Nenhuma persona tem procurement_manager. priya-shah (finance_manager) tem
  `purchase_orders.approve` e decide os passos de finance_manager; verifica se maya-chen
  (administrator) decide passos de outro papel. O painel desenha a decisão só para quem pode
  decidir.
- **Moeda.** Cada PO tem a sua `currency` e `fxRateToUsd`; a aprovação é em USD. Dinheiro na
  moeda da PO, o limiar dito em USD.
- **Seed.** Receções antigas com danificados fracionários em unidades inteiras (linha já no
  ledger); `new_tenant` rebenta no seed (linha já no ledger).

## Estados, permissões e cenários

Cada ecrã responde aos estados do §33 que lhe cabem: pendente ≠ vazio; vazio ≠
vazio-por-filtro; erro com repetição; leitura-apenas por permissão; confirmação destrutiva
(cancelar, fechar em falta); sucesso parcial (receção parcial); conflito de versão.

Fixtures a abrir antes de dar o ecrã por feito: `edge.po.delayed`,
`edge.po.partially_received`, `edge.receipt.damaged` (`data/seed/curated.ts`).

Personas obrigatórias: marcus-lee (buyer: cria, edita, submete, envia; não aprova, não
cancela, não recebe), jordan-wells (recebe no CHI-01; lê PO sem `suppliers.view`),
priya-shah (aprova passos de finance_manager, fecha em falta), maya-chen (tudo),
owen-price (auditor, leitura), sofia-ramirez e aisha-grant (sem acesso: o módulo diz-lhes
isso, não abre vazio).

Cenários: healthy; `inventory_crisis` (8 PO sent | acknowledged marcadas `delayed`, data
esperada no passado, nota "URGENT") — a fila de receção e a lista de PO têm de ler
diferente; `restricted_user` (jordan no CHI-01); `system_degraded`; `heavy_data` (produto
com 40 mapeamentos de fornecedor).

## Qualidade visual — a barra desta entrega

- Quantidades com a precisão da unidade; dinheiro alinhado pela última casa, na moeda do que
  é mostrado; percentagens de desempenho a partir de basis points, sem casas inventadas.
- CP-02, CP-05 (o guarda `specs/demo-screen-tokens.test.mjs`), CP-06.
- Esqueletos pelo skill `loading-states`, verificados com `tools/jump.mjs`.
- Dois esquemas e três densidades.
- Um gráfico (scorecard, gasto, atrasos) segue a regra OV-03 e a skill `dataviz`; o bundle
  inicial não passa o orçamento de 3.75 MB de `angular.json`.

## Decisões que provavelmente nascem aqui

- Como uma fila de trabalho sem endpoint próprio se lê (receção).
- Como um formulário diz, antes de submeter, que a submissão vai pedir aprovação.
- Como um fornecedor se compara com outro: scorecard e o que cada número conta.
- Como uma receção com três destinos por linha (aceite, danificado, rejeitado) se confirma.

Cria regra nova pelo esquema de `writing-rules.md` quando a decisão é do produto; emenda a
existente quando a redação melhora (mesmo número) e retira-a quando o sentido muda.

## Verificação por ecrã, antes de o dar por feito

- 1280, 570 e telemóvel emulado (390×844 e 360×780): lista de elementos mais largos que o
  viewport vazia; controlos a 44px com ponteiro grosso.
- `node tools/jump.mjs <rota> '<seletor>'`: o `top` não se mexe e nenhuma caixa encolhe.
- Transporte normal e degradado pelo painel de demonstração.
- Percurso da Journey B no telemóvel: posição abaixo do ponto de encomenda → criar PO
  (marcus) → submeter com aprovação → aprovar (priya ou maya) → enviar → receber
  parcialmente no CHI-01 com danificados e rejeitados (jordan) → posição com `onHand` e
  "Inbound" atualizados → movimento no livro-razão que leva à receção → voltar com o gesto
  do sistema.
- `ng test` na demo com specs por comportamento prometido — em particular aprovação
  anunciada antes de submeter, cancelar recusado depois de receção, tolerância de 5%,
  âmbito do jordan, custo segundo a decisão de §55.
- `pnpm --filter @slotted/<pkg> verify` e `pnpm check` quando tocas um pacote;
  `pnpm demo:refresh` e servidor reiniciado antes de capturar.

## Fecho

Não commites. No fim — e só no fim — um relato: veredictos (pacote / demo / backend) por
observação, ficheiros, linhas do ledger, regras novas ou emendadas, o que ficou aberto e
porquê. O módulo termina quando nenhuma rota de /procurement abrir num placeholder e nenhum
ecrã desenhar um controlo para um comando que o backend não tem ou que a persona não pode
usar.
