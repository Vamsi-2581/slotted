docs/process/nexora-analytics-module-prompt.md — cola o preâmbulo de nexora-vertical-slice-prompts.md antes deste bloco.

Módulo: Analytics inteiro, /analytics. Entrega única, até que nenhuma rota de /analytics abra num
placeholder, cada número de cada relatório reconcilie com os registos que conta e abra a lista
deles, nenhum estado do §33 que caiba a um relatório fique por desenhar, e nada fique em aberto no
relato.

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

O working tree tem trabalho por commitar de outras sessões a decorrer em paralelo (pacotes,
docs). Constrói por cima; não revertas, não formates em massa e não faças stage de nada. Um
ficheiro que outra sessão está a mudar (`git diff` mostra alterações que não são tuas) é editado
só no troço que o Analytics exige. `pnpm demo:refresh` empacota também o trabalho delas: diz no
relato quando uma falha vem daí.

## O que muda neste módulo

Analytics é o primeiro módulo sem registos próprios: cada ecrã é uma leitura agregada de registos
que outros módulos possuem, ao longo de períodos. Domínio: §16 (os seis tipos de relatório e as
"UI implications": cartões de KPI, períodos de comparação, gráficos, tabelas por baixo dos
gráficos, controlos de data, filtros de segmento, drill-down, relatórios descarregáveis, anotações,
avisos de anomalia; "nenhum gráfico existe só como decoração"), §72 (definições normativas de cada
KPI, moeda de reporte em USD pelo `fxRateToUsd` de cada transação; "Analytics MUST use the same
underlying domain data as operational screens"), §34.1 (o painel executivo: como vai o negócio, o
que mudou, o que precisa de atenção), §75.3 (24 meses de histórico lógico), §26 e §77 (cenários).

A superfície que existe está em `demos/nexora/backend/backend/api/index.ts` e
`api/resources/analytics.ts`:

```
analytics.dashboard()        GET /analytics/dashboard   analytics.view (pedido 'analytics')
                             §34.1/§72: kpis com deltaBps, série mensal (receita faturada,
                             margem bruta, valor reservado, encomendas), encomendas por estado,
                             saúde das contas, top clientes, top produtos, receita por segmento,
                             alertas, pipeline. Sem período escolhido: hoje, 30, 60 e 365 dias.

Leituras operacionais que já agregam (de outros módulos, não de Analytics):
finance.overview()           GET /finance/overview      finance.dashboard — aging, DSO, cash
support.metrics()            GET /support/metrics       support.view — filas, SLA, CSAT
/inventory/overview          o ecrã agrega listas de inventário no cliente
```

Os cinco destinos do modelo de navegação (`core/nav/nav.model.ts`, módulo `analytics`:
`/analytics/executive`, `/sales`, `/inventory`, `/finance`, `/support`) abrem hoje o placeholder.
Para quatro deles o backend não tem leitura nenhuma, e nenhuma leitura aceita período, comparação
ou segmento. Esta é a lacuna central do módulo: resolve-a no backend, uma leitura por tipo de
relatório do §16, cada uma com período (`from`, `to`), período de comparação do mesmo
comprimento, e os segmentos que o relatório pede (região, segmento de cliente, armazém, categoria,
representante). Cada figura é calculada a partir dos mesmos registos e pela mesma definição do §72
que o ecrã operacional usa, e um teste em `api.test.ts` prova, figura a figura, que ela é igual ao
total da lista que a abre com a mesma condição. Uma figura que não reconcilia não entra no ecrã.

## Ecrãs a entregar

Regista as páginas no mapa `PAGES` de `app.routes.ts` como `lazyPage`, e escreve
`pages/analytics-routes.spec.ts` pelo molde de `support-routes.spec.ts`. Os destinos de Analytics
não têm registo próprio: marca-os `record: false` no modelo de navegação, para que
`/analytics/sales/123` caia no not-found em vez de abrir o relatório.

1. /analytics/executive — o §34.1 com o §16 "Executive": receita, margem bruta, crescimento de
   encomendas, concentração de clientes, recebíveis, valor de inventário, desempenho de serviço;
   o que mudou face ao período anterior e o que precisa de atenção.
2. /analytics/sales — receita por conta e por produto, taxa de conversão de cotações, valor médio
   por encomenda, tempo de ciclo da encomenda, taxa de desconto, desempenho por representante.
3. /analytics/inventory — valorização, rotação, inventário envelhecido, frequência de ruturas,
   utilização de armazém, volume de transferências.
4. /analytics/finance — aging dos recebíveis, tendência de vencidas, cobranças, DSO, mistura de
   métodos de pagamento.
5. /analytics/support — volume de tickets, SLA de primeira resposta, tempo de resolução, backlog,
   CSAT, taxa de escalamento.

Cada relatório: um controlo de período com comparação, os filtros de segmento que o relatório
aceita, cartões de KPI com a variação e a sua base, gráficos que respondem a uma pergunta de
negócio dita no título, uma tabela por baixo de cada gráfico com os mesmos números, drill-down de
cada figura e de cada barra ou ponto para a lista que conta (OV-01, com a condição e o período como
pills da barra), e um descarregamento do que a tabela mostra.

Decide e regista:

- **Procurement.** O §16 tem um relatório de Procurement (despesa por fornecedor, entrega no prazo,
  tendência de lead time, variação de preço de compra) e a navegação não tem destino para ele.
  Ou acrescentas o destino (`procurement.view`/`analytics.view`, e a contagem de destinos nos
  specs) ou dizes onde vive e porquê; não o deixas sem casa.
- **Home e overviews.** `/dashboard` (o Prompt 5 da fatia vertical, ainda a página de boas-vindas
  com contagens), `/finance/overview`, `/inventory/overview` e as figuras da inbox de Support já
  respondem "o que se passa agora". Analytics responde "como evoluiu ao longo de um período e
  face a outro". Escreve a fronteira como regra e não dupliques um ecrã: uma figura que já existe
  num overview abre o mesmo destino e diz o mesmo número no mesmo período.
- **Descarregar.** Não há endpoint de exportação (`audit.export` é só da auditoria). Decide se o
  descarregamento é o CSV da tabela gerado no cliente a partir da mesma resposta ou um endpoint
  novo, e quem o pode fazer.
- **Anomalias e anotações.** Um aviso de anomalia segue uma regra determinística dita no ecrã
  (por exemplo, fora da banda dos períodos anteriores); uma anotação marca um facto do domínio
  (um cenário carregado, o fim do mês, o incidente de envio), nunca uma frase inventada.

## As armadilhas deste módulo

- **Histórico.** §75.3 dá 24 meses lógicos, e o backend não materializa tudo:
  `store.history.summaries` guarda um resumo por encomenda (cliente, data, moeda, `fxRateToUsd`,
  total, subtotal, frete, custo, número de linhas) e nada sobre produtos, representantes, faturas,
  pagamentos, tickets ou movimentos de stock. Lê `executiveDashboard` antes de desenhar um período:
  um relatório por produto ou por representante só existe na janela materializada, e o controlo de
  período di-lo e não oferece o que o backend não sabe. Um zero onde não há dado é uma mentira
  (PM-01 é o molde).
- **Permissões e âmbito.** `analytics.view` é de executive, sales_manager, sales_representative,
  finance_manager, accountant, procurement_manager, warehouse_manager, support_manager, auditor e
  administrator; não é de support_agent, buyer nem warehouse_operator. O representante tem-no sem
  escopo: decide pelo §55.5 se vê o desempenho dos colegas. Margem e custo são `cost.view` (PM-03):
  o representante não o tem. O relatório de finanças a quem não tem `finance.dashboard` nem
  `payments.view`, e o de suporte a quem não tem `support.view`, dizem o que retêm e quem o tem
  (PM-02); não abrem com buracos.
- **aisha-grant** trabalha a inbox e não tem `analytics.view`: o relatório de suporte é do
  `support-lead` (stand-in de Support Manager). Confirma que o módulo lho diz.
- **Moeda.** Tudo em USD pelo `fxRateToUsd` de cada transação (§72.1); as transações em BRL da
  região BR entram convertidas, e o ecrã diz a moeda de reporte uma vez.
- **Relógio.** Os períodos são relativos ao relógio de demonstração; avança dias no painel e
  confirma que "últimos 30 dias", a comparação e os textos relativos acompanham. `month_end` move
  o relógio para o último dia útil do mês (há uma linha no ledger sobre os pagamentos que o
  cenário não cria).
- **Custo do cálculo.** Agregar sobre `heavy_data` e `enterprise_scale` no thread principal é o
  risco: o ledger tem a linha do overview de inventário com 8.1 s em long tasks. Indexa no backend
  e mede o primeiro carregamento de cada relatório nos dois cenários.
- **Navegação.** O módulo abre no primeiro destino que a persona pode abrir (o redirect de
  `app.routes.ts`); confirma-o para uma persona que só vê parte dos relatórios.
- **Seed.** Lê as linhas `seed` do ledger antes de confiar numa contagem ou numa tendência.

## Estados, permissões e cenários

Cada relatório responde aos estados do §33 que lhe cabem: pendente ≠ vazio; vazio (um período sem
dados, `new_tenant`) ≠ zero; uma região que falhou com repetição enquanto as outras continuam úteis
(um relatório parcial diz o que falta); leitura retida por permissão; período sem comparação
possível (o início do histórico); dados mudados por outra ação enquanto o relatório está aberto
(AF-07).

Personas obrigatórias: evan-brooks (executive), maya-chen (tudo), sofia-ramirez (vendas),
noah-bennett (representante: âmbito e margem retida), priya-shah (finanças), support-lead
(suporte), procurement-lead (procurement, se o destino nascer), owen-price (auditor),
marcus-lee, aisha-grant e jordan-wells (sem `analytics.view`: o módulo diz-lho, não abre vazio).

Cenários: healthy; `new_tenant` (vazio); `month_end`; `collections_pressure` e
`inventory_crisis` e `support_incident` (o relatório da área tem de ler diferente e o aviso de
anomalia tem de disparar pela sua regra); `heavy_data` e `enterprise_scale` (custo);
`system_degraded` (700–1600 ms, falhas por pedido conforme `shouldFail` em `api/runtime.ts`:
decide se as leituras novas falham como o overview de finanças e desenha a resposta).

## Qualidade visual — a barra desta entrega

- Gráficos pela skill `dataviz` e pela família `chart`: OV-03 (uma comparação de um só é uma
  frase), OV-04 (limiares ditos em palavras), OV-05 (moldura só em mosaicos pares), LP-10. Cada
  gráfico tem um título que é a pergunta que responde, eixos com unidades, e a tabela dos mesmos
  números por baixo; cor nunca é a única diferença entre séries.
- Dinheiro alinhado pela última casa, em USD; percentagens e dias sem casas inventadas; uma
  variação diz a sua base ("+4.2% face aos 30 dias anteriores").
- CP-02, CP-05 (o guarda `specs/demo-screen-tokens.test.mjs`), CP-06, CP-08 (mudar o período,
  a comparação ou o segmento troca os números e nunca a geometria do relatório).
- Esqueletos pelo skill `loading-states`: o esqueleto de um gráfico é o seu plano com os eixos, o
  de uma tabela as suas colunas; medidos com
  `PERSONA=<key> [TOUCH=1] node tools/jump.mjs <rota> '<seletor>' [w] [h]`, `top` a 0 em 1280,
  570 e telemóvel com toque. Mudar de período mantém os números marcados como ocupados em vez de
  os trocar por esqueletos (AF-02, AF-07).
- Telemóvel pela OV-02: as figuras como uma lista de portas, depois o que agir, depois os
  gráficos; um gráfico largo lê-se sem rolar a página de lado.
- Dois esquemas e três densidades.
- Os motores de gráfico ficam fora do bundle inicial (os `RESOLVERS` de `app.routes.ts` são o
  molde); mede o bundle inicial antes e depois e diz no relato o que é teu, porque outras sessões
  já o puseram acima do orçamento de 3.75 MB de `angular.json`.

## Decisões que provavelmente nascem aqui

- Onde termina um overview operacional e começa um relatório de período.
- Como um período e a sua comparação se escolhem, se dizem e se partilham entre relatórios.
- Como um relatório diz o que o histórico não guarda.
- Como uma anomalia se diz com a sua regra.
- Como um gráfico e a sua tabela se leem a 390 px.

Cria regra nova pelo esquema de `writing-rules.md` quando a decisão é do produto; emenda a
existente quando a redação melhora (mesmo número) e retira-a quando o sentido muda. Um tópico
novo (por exemplo "reports") entra no `index.md` e no `README.md` das guidelines.

## Verificação por relatório, antes de o dar por feito

- 1280, 570 e telemóvel emulado (390×844 e 360×780):
  `node tools/look.mjs <url> <png> <w> <h> <persona> <cenário> phone` — lista de elementos mais
  largos que o viewport vazia (um elemento dentro de um contentor que rola por si não conta);
  controlos a 44px com ponteiro grosso.
- `jump.mjs` com persona e toque, como acima.
- Transporte normal e degradado pelo painel de demonstração (ou `SCENARIO=system_degraded`).
- Percurso no telemóvel escrito como `tools/analytics-drill.mjs`, pelo molde de
  `tools/journey-d.mjs` (uma sessão de browser, persona trocada pelo painel de demonstração, um
  PASS ou FAIL por passo): Evan Brooks abre o executivo → muda o período e a comparação → uma
  figura abre a lista com a condição e o período como pills e o mesmo total → um registo → voltar
  com o gesto do sistema ao relatório no mesmo período → Noah Bennett abre vendas com a margem
  retida e dita → Jordan Wells é recusado. Corre-o a 390×844 e a 360×780; todos os passos passam.
- `api.test.ts`: cada figura de cada leitura nova igual ao total da lista com a mesma condição,
  em USD pelo §72; comparação do mesmo comprimento; âmbito e retenção por persona; o vazio de
  `new_tenant`.
- `ng test` na demo com specs por comportamento prometido — em particular a reconciliação de cada
  figura com o seu drill-down, o período preservado no voltar, a margem retida, o relatório parcial
  quando uma região falha.
- `pnpm --filter @slotted/<pkg> verify` e `pnpm check` quando tocas um pacote; `pnpm verify` no
  backend quando o tocas; `pnpm demo:refresh` e servidor reiniciado antes de capturar.

## Fecho

Não commites. No fim — e só no fim — um relato: veredictos (pacote / demo / backend / conforms)
por observação, ficheiros, linhas do ledger, regras novas ou emendadas, e a evidência de cada
verificação. O módulo termina quando nenhuma rota de /analytics abrir num placeholder, nenhuma
figura existir sem reconciliar com a lista que abre, o percurso de drill-down passar inteiro no
telemóvel, e nenhuma observação ficar sem resolução.
