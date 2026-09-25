docs/process/nexora-finance-module-prompt.md — cola o preâmbulo de nexora-vertical-slice-prompts.md antes deste bloco.

Módulo: Finance inteiro, /finance. Entrega única, até que nenhuma rota de /finance abra num
placeholder, nenhum estado do §33 que caiba a um ecrã fique por desenhar, cada comando que o
backend expõe para faturas, pagamentos, notas de crédito, reembolsos e transações bancárias tenha
o seu caminho no ecrã certo, e nada fique em aberto no relato.

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

O working tree pode ter trabalho por commitar de sessões anteriores (CRM, Sales, Catalog,
Inventory, Procurement). Constrói por cima; não revertas, não formates em massa e não faças stage
de nada.

## O que muda neste módulo

Finance fecha a Journey C (`domain.md` §20): painel financeiro → faturas vencidas → cliente →
fatura → tentativa de contacto → pagamento → reconciliação → saldo do cliente atualizado. Domínio:
§13 (incluindo "Payment reconciliation workspace") e §66.1–§66.13; efeito cruzado em §30 "Record
payment"; aprovação de write-off em §66.5 e §67.

A superfície está em `demos/nexora/backend/backend/api/index.ts` (objeto `finance`), leituras em
`api/resources/finance.ts`, comandos em `api/commands/finance.ts`, autoridade de write-off em
`domain/pricing.ts` (`writeOffAuthority`):

```
Leituras
finance.overview()                 GET /finance/overview        finance.dashboard (pedido 'analytics')
finance.invoices.list(q) | get(id) GET /invoices[/:id]          invoices.view
finance.payments.list(q) | get(id) GET /payments[/:id]          payments.view
finance.creditMemos.list(q) | get  GET /credit-memos[/:id]      credit_memos.view
finance.refunds.list()             GET /refunds                 credit_memos.view (sem query)
finance.bankTransactions.list | get GET /bank-transactions[/:id] reconciliation.view
bankTransactions.suggestions(id)   candidatos pontuados (§66.13) reconciliation.view

Comandos
invoices.createFromOrder           invoices.create — quantidade expedida e não faturada (OVER_INVOICING)
invoices.updateDraft               invoices.edit_draft
invoices.open | send               invoices.open | invoices.send
invoices.dispute | resolveDispute  invoices.edit_draft
invoices.void                      invoices.void — sem pagamentos nem créditos alocados (INVOICE_HAS_ALLOCATIONS)
invoices.writeOff                  invoices.write_off — autoridade por valor (§66.5)
payments.record | allocate         payments.record
payments.reverse                   payments.reverse — com motivo
creditMemos.create | open | apply | void   credit_memos.create | credit_memos.open
refunds.create                     refunds.create
bankTransactions.match | ignore    reconciliation.manage — ignore com motivo
```

Campos de filtro e ordenação: `invoiceResource`, `paymentResource`, `creditMemoResource` e
`bankTransactionResource` em `finance.ts`. Lê-os antes de desenhar uma barra de filtros: um filtro
que o backend não aceita é um controlo que mente.

Regras de negócio que os ecrãs têm de fazer ver antes do erro, não depois:

- Três eixos da fatura, independentes: `lifecycle` (draft, open, voided, written_off),
  `settlement` (unpaid, partially_paid, paid) e `collectionState` (current, overdue, disputed);
  `displayStatus` e `daysOverdue` vêm calculados na lista. Aritmética em §66.6.
- Write-off só do saldo inteiro (§66.5): até US$500 um accountant; acima de US$500 a Finance
  Manager; acima de US$5 000 um ApprovalRequest com passo de finance_manager e motivo. O ecrã diz
  a autoridade exigida pelo saldo atual antes de o reader carregar em nada (FM-11, FM-13).
- Void só com a fatura aberta e sem alocações; dispute não suspende o aging (§66.5). O ecrã
  desenha o comando certo para o estado (RP-09), não traduz a recusa depois.
- Pagamento e alocação (§66.7–§66.10): `ALLOCATION_EXCEEDS_OUTSTANDING`,
  `ALLOCATION_EXCEEDS_PAYMENT`, `CURRENCY_MISMATCH`, `PAYMENT_NOT_POSTED`,
  `INVOICE_ALREADY_PAID`; o formulário de alocação aplica os limites enquanto se escreve.
- Reconciliação (§66.13): pontuação determinística, confiança high ≥ 85, medium 60–84, low < 60;
  confirmar liga um pagamento existente ou cria e lança um a partir da transação; ignorar exige
  motivo. §13 descreve o espaço de trabalho: pagamentos à esquerda, faturas possíveis à direita,
  sugestões, diferenças e confiança ao centro.
- Todo comando exceto os de criação verifica a versão (`STALE_VERSION`): ER-01..ER-04.

## Ecrãs a entregar

Os quatro destinos do modelo de navegação (`core/nav/nav.model.ts`, módulo `finance`) abrem hoje o
placeholder. Regista as páginas no mapa `PAGES` de `app.routes.ts` como `lazyPage`, como o
Procurement, e escreve `pages/finance-routes.spec.ts` pelo molde de `procurement-routes.spec.ts`.

1. /finance/overview — o painel da Journey C: recebíveis por aging, vencidas, disputas, DSO, cash
   recebido; cada figura abre a lista com a sua condição como pills da barra (OV-01); telemóvel
   pela OV-02; gráficos pela OV-03 e pela skill `dataviz`. `GET /finance/overview` falha em 35%
   dos pedidos em `system_degraded`: erro com repetição, sem zeros.
2. /finance/invoices e /finance/invoices/:id — lista (vencidas, disputadas, por cliente, moeda) e
   registo com as linhas, os pagamentos e créditos aplicados, o ciclo (`app-record-progress`), os
   três eixos, e cada comando no seu estado; write-off acima de US$5 000 pela aprovação
   (`app-approval-panel`).
3. /finance/payments e /finance/payments/:id — lista e registo; "Record payment" (FM-01) com
   alocação às faturas abertas do cliente; reverse com motivo e o efeito dito antes.
4. /finance/reconciliation — o espaço de trabalho de §13 e §66.13: transações por reconciliar,
   candidatos com confiança, a diferença, confirmar e ignorar; a sugestão explica a pontuação.

Decide e regista onde vivem as notas de crédito e os reembolsos, que não têm destino no modelo de
navegação (por exemplo no registo da fatura e do pagamento, ou numa rota filha de invoices).

Liga o módulo ao que já existe:

- O separador Invoices da encomenda (`pages/orders/order-page.ts`) lista as faturas sem ligação:
  cada linha leva ao registo, e "Create invoice" aparece quando há quantidade expedida por faturar
  e a persona tem `invoices.create`.
- O Customer 360 já liga a `/finance/invoices/:id`; confirma e acrescenta o caminho para "Record
  payment" do cliente.
- `core/activity/notifications.store.ts` leva `invoice` ao registo; confirma com spec.
- `pages/approvals/approvals-page.ts` trata `targetType === 'invoice_write_off'` levando a
  `/finance/invoices/:targetId`; confirma que o write-off pedido abre a fatura.

## As armadilhas deste módulo

- **Aprovadores.** priya-shah é a única persona finance_manager e é quem pede o write-off acima
  de US$5 000; quem pede nunca decide (§67.4). `defaultApprover` atribui o passo a outro
  finance_manager semeado, que nenhuma persona é. O backend já tem o mecanismo
  `STAND_IN_PERSONAS` (`domain/permissions.ts`, usado para `procurement-lead`): usa-o se o
  domínio pedir um aprovador que nenhuma persona é, e verifica a decisão ponta a ponta.
- **Accountant.** Nenhuma persona é accountant; a autoridade até US$500 só se prova por spec do
  backend ou por stand-in. Decide e regista.
- **Tentativa de contacto.** A Journey C tem "Record Contact Attempt" e o backend não tem comando
  de cobrança. Lê o que existe (notas de cliente, `notes.create`; atividade) e decide; não
  inventes um endpoint no cliente.
- **Âmbito.** Verifica se `invoices.view` e `payments.view` de noah-bennett (sales_representative)
  e de aisha-grant (support_agent) devem ser só dos seus clientes; se o backend responde tudo, é
  defeito a resolver pelo lado certo.
- **Crédito.** Exposição e limite de crédito são `customers.credit_view` (PM-01, PM-02).
- **Moeda.** Faturas em BRL da região BR; dinheiro na moeda do documento, o painel em USD, o
  limiar de write-off dito em USD.
- **Seed.** Lê as linhas `seed` do ledger antes de confiar numa contagem.

## Estados, permissões e cenários

Cada ecrã responde aos estados do §33 que lhe cabem: pendente ≠ vazio; vazio ≠ vazio-por-filtro;
erro com repetição; leitura-apenas por permissão; confirmação destrutiva (void, write-off,
reverse, ignore); sucesso parcial (pagamento alocado em parte); conflito de versão.

Fixtures a abrir antes de dar o ecrã por feito (`data/seed/finance.ts`):
`edge.invoice.due_today`, `edge.invoice.large`, `edge.invoice.partially_paid`,
`edge.invoice.paid_with_credit_memo`, `edge.invoice.zero_value`, `edge.payment.unapplied`, e o
cliente `flagship.customer.meridian`.

Personas obrigatórias: priya-shah (tudo de finance), maya-chen (tudo), evan-brooks (executive:
painel e leitura), owen-price (auditor, leitura), sofia-ramirez (leitura de faturas, pagamentos e
créditos), noah-bennett e aisha-grant (faturas: confirma o âmbito), jordan-wells (sem acesso: o
módulo diz-lho, não abre vazio).

Cenários: healthy; `collections_pressure` (vencidas ×2.2, 18 clientes acima de 90% de crédito, 6
em hold) — o painel e a lista de faturas têm de ler diferente; `month_end` (vencimentos em 5 dias
×2.5, transações por reconciliar ×3, fila de aprovações ×1.8) — a reconciliação tem de aguentar;
`system_degraded`; `heavy_data`.

## Qualidade visual — a barra desta entrega

- Dinheiro alinhado pela última casa, na moeda do documento; percentagens e DSO sem casas
  inventadas; datas de vencimento com a regra de aging do §66.
- CP-02, CP-05 (o guarda `specs/demo-screen-tokens.test.mjs`), CP-06.
- Esqueletos pelo skill `loading-states`, medidos com
  `PERSONA=<key> [TOUCH=1] node tools/jump.mjs <rota> '<seletor>' [w] [h]`: `top` a 0 em 1280,
  570 e telemóvel com toque. Uma frase ou uma nota de comprimento variável acima de uma tabela
  reserva as suas linhas nos dois estados (o `sentenceLines`/`stepLines` de `app-record-progress`
  e o padrão `.sentence-shape` do registo da PO são o molde); o que só o registo sabe (uma
  aprovação) fica abaixo do conteúdo que se mede.
- Dois esquemas e três densidades; em toque, as ferramentas da lista numa linha (LP-11).
- Um gráfico segue OV-03 e a skill `dataviz`; o bundle inicial não passa o orçamento de 3.75 MB
  de `angular.json` (está em 3.72 MB: confirma depois de cada import).

## Decisões que provavelmente nascem aqui

- Como um espaço de trabalho de reconciliação lê três colunas num telemóvel.
- Como uma confiança de correspondência diz o que a pontuou.
- Como a autoridade de um comando que depende do valor se diz antes do comando.
- Onde vivem documentos sem destino próprio (notas de crédito, reembolsos).

Cria regra nova pelo esquema de `writing-rules.md` quando a decisão é do produto; emenda a
existente quando a redação melhora (mesmo número) e retira-a quando o sentido muda.

## Verificação por ecrã, antes de o dar por feito

- 1280, 570 e telemóvel emulado (390×844 e 360×780):
  `node tools/look.mjs <url> <png> <w> <h> <persona> <cenário> phone` — lista de elementos mais
  largos que o viewport vazia; controlos a 44px com ponteiro grosso.
- `jump.mjs` com persona e toque, como acima.
- Transporte normal e degradado pelo painel de demonstração (ou `SCENARIO=system_degraded`).
- Percurso da Journey C no telemóvel escrito como `tools/journey-c.mjs`, pelo molde de
  `tools/journey-b.mjs` (uma sessão de browser, persona trocada pelo painel de demonstração, um
  PASS ou FAIL por passo): painel → vencidas → cliente → fatura → tentativa de contacto →
  pagamento registado e alocado → reconciliação confirmada → saldo do cliente atualizado → voltar
  com o gesto do sistema. Corre-o a 390×844 e a 360×780; todos os passos passam.
- `ng test` na demo com specs por comportamento prometido — em particular a autoridade de
  write-off dita antes, void recusado com alocações, alocação acima do saldo recusada ao escrever,
  confiança de reconciliação, âmbito por persona.
- `pnpm --filter @slotted/<pkg> verify` e `pnpm check` quando tocas um pacote; `pnpm verify` no
  backend quando o tocas; `pnpm demo:refresh` e servidor reiniciado antes de capturar.

## Fecho

Não commites. No fim — e só no fim — um relato: veredictos (pacote / demo / backend / conforms)
por observação, ficheiros, linhas do ledger, regras novas ou emendadas, e a evidência de cada
verificação. O módulo termina quando nenhuma rota de /finance abrir num placeholder, nenhum ecrã
desenhar um controlo para um comando que o backend não tem ou que a persona não pode usar, a
Journey C passar inteira no telemóvel, e nenhuma observação ficar sem resolução.
