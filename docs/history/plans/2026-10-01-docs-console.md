# Plano — console da home do site de documentação

Superfície: `apps/docs/src/islands/Console.tsx`, `apps/docs/src/console/*`, `apps/docs/src/styles/home.css`, `apps/docs/src/islands/StageAxes.tsx`. Brief: `apps/docs/.impeccable/surfaces/apps-docs-src-pages-index-astro.md`. Regras de composição: `demos/nexora/guidelines/` (SC, OV, LP, RP, CP, LA). Checkpoint: `.claude/progress/docs-console.md`.

Decisões do usuário (2026-10-01): domínio Northwind Ops mantido; o console abre em `compact`; defeitos de pacote corrigidos na família, com teste, e registrados em `apps/docs/LIBRARY-FEEDBACK.md`.

## Defeitos observados (captura 1440×900, 8 telas)

| Observação | Classe |
| --- | --- |
| Descrição do cabeçalho 40 px abaixo do título, em corpo grande | site — `PageHeaderDescription` dentro de `title-area`; o lugar é `PageHeaderSubheading` |
| "Northwind Ops" a 8 px do campo de busca | site — SC-04 |
| Barra de progresso com o rótulo visível dentro da célula | a triar |
| Cabeçalhos de coluna truncados a 84–112 px | a triar |
| Rótulos do eixo x do gráfico cortados com reticências | a triar |
| Dois tooltips do rail visíveis após recolher a navegação | a triar |
| "Hoje" do calendário fora da data da demo | pacote — `event-calendar` não aceita `now`; `timeline` e `notification-center` aceitam |
| Cliente com 0 pedidos numa lista "com pelo menos um pedido" | site — dados |
| 64 pedidos, 20 produtos, nenhuma paginação, nenhuma ação em lote no rodapé | site — LP-03, LP-05 |
| Gráficos plain e card misturados sem regra; números sem porta | site — OV-01, OV-05 |

## Fatia 1 — defeitos de pacote

1. Triagem dos itens "a triar" com evidência por arquivo e linha.
2. Correção de cada defeito de pacote na família, com teste, nas duas bindings quando a família tem as duas.
3. Linhas no ledger `apps/docs/LIBRARY-FEEDBACK.md`. Aceite: testes filtrados das famílias tocadas passam.

## Fatia 2 — dados e moldura

4. **Dados.** `apps/docs/src/console/data.ts` reescrito: 40 clientes com contato, cidade e segmento; 60 produtos com estoque disponível, reservado e a receber; cerca de 480 pedidos em 90 dias com linhas de item, endereço, transportadora e tags; envios, devoluções, faturas e pedidos de compra derivados dos pedidos. Semente fixa; nenhum cliente sem pedido.
5. **Moldura.** Marca com monograma; busca a um passo de espaço da marca (SC-04) que abre `CommandPalette` com destinos e registros; cabeçalho da navegação com seletor de armazém (LA-02); rodapé da navegação com a conta; `StageAxes` e `#console-frame` iniciam em `compact`; altura do console revista.
6. **Cabeçalho de página.** Título, `PageHeaderSubheading` com escopo e data, ações por tela; abas de vista no slot `tabs` do cabeçalho (LA-04); largura por tipo de página (CP-07).

## Fatia 3 — visão geral e pedidos

7. **Visão geral.** Cinco `stat-card` com sparkline e porta para a lista filtrada (OV-01); receita contra o período anterior em seção titulada (OV-05); fila "Needs attention"; funil de fulfillment por estágio; produtos mais vendidos em `table` com total (RP-07); atividade em `timeline`.
8. **Pedidos.** Abas All, Unfulfilled, Ready to ship, Delivered, Returns com contagem; `filter-bar` com `saved-views`; `data-grid` em `fill` com paginação (LP-05) e `action-bar` no rodapé da página para a seleção (LP-03).
9. **Registro do pedido no aside.** Cabeçalho com estado e saúde (RP-01), `stepper` do ciclo de vida (RP-06), linhas de item com subtotal, frete, imposto e total (RP-07), cliente, endereço, `timeline`.

## Fatia 4 — demais telas

10. Envios (atraso, ETA, transportadora, destino) e devoluções como fila (LP-09).
11. Estoque (disponível, reservado, a receber, cobertura em dias; aba de gráfico, LP-10) e calendário (mais eventos, barras de dia inteiro, `now` da demo).
12. Faturas (aging em abas, totais) e clientes (receita acumulada, segmento, responsável, última compra).

## Fatia 5 — verificação

13. Cenário de captura nomeado (8 telas e o pedido aberto a 1440×900; 390×844), detector `impeccable detect`, `pnpm --filter @slotted/docs typecheck` e `build`, revisão final contra o brief.
